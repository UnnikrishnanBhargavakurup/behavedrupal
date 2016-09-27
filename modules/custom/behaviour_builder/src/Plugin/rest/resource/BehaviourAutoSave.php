<?php

namespace Drupal\behaviour_builder\Plugin\rest\resource;

use Drupal\Core\Session\AccountProxyInterface;
use Drupal\rest\Plugin\ResourceBase;
use Drupal\rest\ResourceResponse;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Psr\Log\LoggerInterface;
use Drupal\rest\Plugin\rest\resource;
use Drupal\Core\Url;
use Drupal\Core\Form\FormState;
use Symfony\Component\HttpFoundation\Response;
use Drupal\Core\Entity\EntityFormBuilderInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\node\Entity\Node;

use Drupal\Core\Database\Connection;
use Drupal\Core\Database\Database;
use Drupal\Core\Database\DatabaseException;
use Drupal\Component\Utility\Crypt;

/**
 * Provides a resource to get view modes by entity and bundle.
 *
 * @RestResource(
 *   id = "behaviour_auto_save",
 *   label = @Translation("Behaviour builder auto save project"),
 *   uri_paths = {
 *     "canonical" = "/behave/autosave",
 *     "https://www.drupal.org/link-relations/create" = "/behave/autosave"
 *   },
 *   serialization_class = "Drupal\behaviour_builder\normalizer\JsonDenormalizer",
 * )
 */
class BehaviourAutoSave extends ResourceBase {

  /**
   * A current user instance.
   *
   * @var \Drupal\Core\Session\AccountProxyInterface
   */
  protected $currentUser;

  /**
   * The database connection object.
   *
   * @var \Drupal\Core\Database\Connection
   */
  protected $connection;

  /**
   * The dedicated database connection target to use for log entries.
   */
  const DEDICATED_SAVEBUILD_CONNECTION_TARGET = 'dedicated_savebuild';

  /**
   * Constructs a Drupal\rest\Plugin\ResourceBase object.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin_id for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param array $serializer_formats
   *   The available serialization formats.
   * @param \Psr\Log\LoggerInterface $logger
   *   A logger instance.
   * @param \Drupal\Core\Session\AccountProxyInterface $current_user
   *   A current user instance.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    array $serializer_formats,
    LoggerInterface $logger,
    AccountProxyInterface $current_user,
    Connection $connection) {
    parent::__construct($configuration, $plugin_id, $plugin_definition, $serializer_formats, $logger);

    $this->currentUser = $current_user;
    $this->connection = $connection;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->getParameter('serializer.formats'),
      $container->get('logger.factory')->get('behaviour_builder'),
      $container->get('current_user'),
      $container->get('database')
    );
  }

  /**
   * Responds to POST requests.
   *
   * Returns a list of bundles for specified entity.
   *
   * @throws \Symfony\Component\HttpKernel\Exception\HttpException
   *   Throws exception expected.
   */
  public function post($data) {
    if(is_array($data) && isset($data['data'])) {
      // save for later use.
      $session = '';
      if(!isset($_COOKIE['SESSIONWORKSPACE'])) {
        $params = session_get_cookie_params();
        $session = Crypt::hashBase64(session_id() . uniqid() . '#%Qf@92XfR');
        $_SESSION['behave_drupal']['SESSIONWORKSPACE'] = $session;
        setcookie('SESSIONWORKSPACE', $session, time() + 60 * 60 * 24 * 5, '/behave/autosave', $params['domain'], FALSE, TRUE);
      }
      else {
        /* 
          if someone set random values for this cookie 
          we dont need to save it sp we will check that in session.
        */
        if(isset($_SESSION['behave_drupal']['SESSIONWORKSPACE'])) {
          $session = $_SESSION['behave_drupal']['SESSIONWORKSPACE'];
        }
        else {
          $session = $_SESSION['behave_drupal']['SESSIONWORKSPACE'] = $_COOKIE['SESSIONWORKSPACE'];
        }
      }
      $_SESSION['behave_drupal']['auto_save'] = $data['data'];
      $this->save($session, $this->currentUser->id(), $data['data']);
      return new ResourceResponse(array());
    }
    else if (is_array($data) && isset($data['get'])) {
      return new ResourceResponse($_SESSION['behave_drupal']['auto_save']);
    }
    else {
      return new ResourceResponse(array("error" => "Missing data"));
    }
  }

  /**
   * Responds to GET requests.
   *
   * Returns a list of bundles for specified entity.
   *
   * @throws \Symfony\Component\HttpKernel\Exception\HttpException
   *   Throws exception expected.
   */
  public function get() {
    if(isset($_SESSION['behave_drupal']['auto_save'])) {
      //\Drupal::logger('behave_drupal')->notice("getting > ". print_r($_SESSION['behave_drupal']['auto_save'], TRUE));
      return new ResourceResponse($_SESSION['behave_drupal']['auto_save']);
    }
    else {
      return new ResourceResponse(array());
    }
  }

 /**
  * Save build infomation for accessing from commandline.
  *
  * @param $session
  *   session name for saving data for get build.
  * @param $uid
  *   uid of the user
  * @param $data
  *   workspace data to be saved. 
  */
  private function save($session, $uid, $data) {
    try {
      $keys = array('session' => $session);
      if($uid > 0) {
        $keys = array('uid' => $uid);
      }
      $this->connection
        ->merge('behave_builds')
        ->key($keys)
        ->insertFields(array(
          'session' => $session,
          'uid' => $uid,
          'ip' => $_SERVER['REMOTE_ADDR'],
          'created' => time(),
          'updated' => time(),
          'data' => json_encode($data),
        ))
        ->updateFields(array(
          'ip' => $_SERVER['REMOTE_ADDR'],
          'updated' => time(),
          'data' => json_encode($data),
        ))
        ->expression('build_no', 'build_no + 1')
        ->execute();
    }
    catch (\Exception $e) {
      // When running Drupal on MySQL or MariaDB you can run into several errors
      // that corrupt the database connection. Some examples for these kind of
      // errors on the database layer are "1100 - Table 'xyz' was not locked
      // with LOCK TABLES" and "1153 - Got a packet bigger than
      // 'max_allowed_packet' bytes". If such an error happens, the MySQL server
      // invalidates the connection and answers all further requests in this
      // connection with "2006 - MySQL server had gone away". In that case the
      // insert statement above results in a database exception. To ensure that
      // the causal error is written to the log we try once to open a dedicated
      // connection and write again.
      if (
        // Only handle database related exceptions.
        ($e instanceof DatabaseException || $e instanceof \PDOException) &&
        // Avoid an endless loop of re-write attempts.
        $this->connection->getTarget() != self::DEDICATED_SAVEBUILD_CONNECTION_TARGET
      ) {
        // Open a dedicated connection for logging.
        $key = $this->connection->getKey();
        $info = Database::getConnectionInfo($key);
        Database::addConnectionInfo($key, self::DEDICATED_SAVEBUILD_CONNECTION_TARGET, $info['default']);
        $this->connection = Database::getConnection(self::DEDICATED_SAVEBUILD_CONNECTION_TARGET, $key);
        // Now try once to log the error again.
        $this->save($session, $uid, $data);
      }
      else {
        throw $e;
      }
    }    
  }
}

/*
use Drupal\Component\Utility\Crypt;
dpm(Crypt::hashBase64(session_id()));
*/