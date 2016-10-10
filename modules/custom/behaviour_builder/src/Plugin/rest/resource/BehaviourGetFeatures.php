<?php

namespace Drupal\behaviour_builder\Plugin\rest\resource;

use Drupal\Core\Session\AccountProxyInterface;
use Drupal\rest\Plugin\ResourceBase;
use Drupal\rest\ResourceResponse;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Psr\Log\LoggerInterface;
use Drupal\rest\Plugin\rest\resource;
use Symfony\Component\HttpFoundation\Response;
use Drupal\Core\Entity\Query\QueryFactory;

use Drupal\Core\Database\Connection;
use Drupal\Core\Database\Database;
use Drupal\Core\Database\DatabaseException;

use Drupal\behaviour_builder\BehaveCommon;
/**
 * Provides a resource to get view modes by entity and bundle.
 *
 * @RestResource(
 *   id = "behaviour_get_features",
 *   label = @Translation("Behaviour builder get features"),
 *   uri_paths = {
 *     "canonical" = "/behave/features/{id}"
 *   },
 *   serialization_class = "Drupal\behaviour_builder\normalizer\JsonDenormalizer",
 * )
 */
class BehaviourGetFeatures extends ResourceBase {

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
   * Responds to GET requests.
   *
   * Returns a list of bundles for specified entity.
   *
   * @throws \Symfony\Component\HttpKernel\Exception\HttpException
   *   Throws exception expected.
   */
  public function post($id) {
    /**
     * id should get from the url because this is going to be accessed from
     * command line not from web so it might have a different session.
     * so we cannot get id from session.
     */
    $session = filter_var($id, FILTER_SANITIZE_STRING);
    // This is going to access from commandline so we can't get a user authenticated user here. 
    $or = db_or();
    // build should be updated within 10 days. 
    $or->condition('b.updated', time() - (60 * 60 * 24 * 10), '>');
    $or->condition('b.uid', 0, '>');
    $saved_data = $this->connection
      ->select('behave_builds', 'b')
      ->fields('b', array('data', 'build_no'))
      ->condition('b.session', $session)
      ->condition($or)
      ->execute()->fetch(\PDO::FETCH_OBJ);

    if(isset($saved_data) && !empty($saved_data)) {
      $features = json_decode($saved_data->data);
      $build_path = 'public://downloads/'. $session .'/features/features/';
      // we need to cleaup the folder may be there exist some previous builds. 
      if (file_exists(drupal_realpath($build_path))) {
        file_prepare_directory($build_path, FILE_MODIFY_PERMISSIONS | FILE_CREATE_DIRECTORY | FILE_EXISTS_REPLACE);
        file_unmanaged_delete_recursive($build_path);
      }

      file_prepare_directory($build_path, FILE_MODIFY_PERMISSIONS | FILE_CREATE_DIRECTORY | FILE_EXISTS_REPLACE);
      foreach ($features as $feature) {
        BehaveCommon::writeFeatureData($feature, $build_path);
      }
      BehaveCommon::archive('public://downloads/'. $session .'/features/', 'public://downloads/'. $session .'/features.zip');
      if(file_exists('public://downloads/'. $session .'/features.zip')) {
        $response = new Response();
        $response->headers->set('Content-Type', 'application/zip');
        $response->headers->set('Content-Disposition', 'attachment; filename=features.zip');
        $response->headers->set('Content-Length', filesize('public://downloads/'. $session .'/features.zip'));
        $response->sendHeaders();
        $response->setContent(file_get_contents('public://downloads/'. $session .'/features.zip'));
        return $response;
      }
    }
    return new ResourceResponse(array());
  }
}
