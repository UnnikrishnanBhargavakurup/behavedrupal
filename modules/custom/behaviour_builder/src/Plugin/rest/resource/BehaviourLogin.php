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
use Drupal\Core\Access\CsrfTokenGenerator;
use Drupal\Core\Access\CsrfRequestHeaderAccessCheck;

/**
 * Provides a resource to get view modes by entity and bundle.
 *
 * @RestResource(
 *   id = "behaviour_login",
 *   label = @Translation("Behaviour builder login user"),
 *   uri_paths = {
 *     "canonical" = "/behave/login",
 *     "https://www.drupal.org/link-relations/create" = "/behave/login"
 *   },
 *   serialization_class = "Drupal\behaviour_builder\normalizer\JsonDenormalizer",
 * )
 */
class BehaviourLogin extends ResourceBase {

  /**
   * A current user instance.
   *
   * @var \Drupal\Core\Session\AccountProxyInterface
   */
  protected $currentUser;
  
  /**
   * Captcha secret.
   *
   * @var String.
   */
  private $secret = '6LdXOigTAAAAAG3ki9ycpx8J-asBR1UgShMsBHPu';
  
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
    AccountProxyInterface $current_user) {
    parent::__construct($configuration, $plugin_id, $plugin_definition, $serializer_formats, $logger);

    $this->currentUser = $current_user;
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
      $container->get('current_user')
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
    if(!empty($data)) {
      /*
      $response = json_decode(file_get_contents("https://www.google.com/recaptcha/api/siteverify?secret=". $this->secret . "&response=". $data['captcha'] ."&remoteip=". $_SERVER['REMOTE_ADDR']), true);
      if ($response['success'] == true) {
        */
        $form_state = (new FormState())->setValues(['name' => $data['name'], 'pass' => $data['pass']]);
        //$form_state->setRebuild();
        \Drupal::formBuilder()->submitForm('\Drupal\user\Form\UserLoginForm', $form_state);
        // Check that the form returns an error when expected, and vice versa.
        $errors = $form_state->getErrors();
        if(empty($errors)) {
          $user = user_load($this->currentUser->id());
          // Check whether a session has been started.
          // Migrate the current session from anonymous to authenticated (or vice-versa).
          $picture = isset($user->get('user_picture')->entity) ? $user->get('user_picture')->entity->url() : "/sites/default/files/public/styles/thumbnail/public/avatar_kit/robohash/1.jpg";
          return new ResourceResponse(array(
            "pic" => $picture,
            "name" => substr($user->getUsername(), 0, strpos($user->getUsername(), '@')),
            "saved_data" => $this->get_data(),
            "csr_token" => \Drupal::csrfToken()->get(CsrfRequestHeaderAccessCheck::TOKEN_KEY),
          ));
        }
        else {
          return new ResourceResponse(array("error" => $errors));
        }
     /* }
      else {
        return new ResourceResponse(array("error" => "captcha"));
      }*/
    }
    else {
      return new ResourceResponse(array("error" => "Missing data"));
    }
  }

  /**
   * Get all the saved project information for this user.
   * @return array
   *   return an array of project informations.
   */
  private function get_data() {
    $uid = \Drupal::currentUser()->id();
    $query = \Drupal::entityQuery('node');
    $query->condition('type', 'projects');
    $query->condition('uid', $this->currentUser->id());
    $query->sort('created', 'DESC');
    $nids = $query->execute();
    $nodes = entity_load_multiple('node', $nids);
    $results = array();
    foreach ($nodes as $node) {
      $results[] = array(
        "pid" => $node->id(), 
        "title" => $node->get('title')->value, 
        "created" => $node->get('created')->value,
      );
    }
    return $results;    
  }
}
