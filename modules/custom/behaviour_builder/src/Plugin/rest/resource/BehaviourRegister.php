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
use Drupal\Core\Access\CsrfTokenGenerator;
use Drupal\Core\Access\CsrfRequestHeaderAccessCheck;

/**
 * Provides a resource to get view modes by entity and bundle.
 *
 * @RestResource(
 *   id = "behaviour_register",
 *   label = @Translation("Behaviour builder register account"),
 *   uri_paths = {
 *     "canonical" = "/behave/register",
 *     "https://www.drupal.org/link-relations/create" = "/behave/register"
 *   },
 *   serialization_class = "Drupal\behaviour_builder\normalizer\JsonDenormalizer",
 * )
 */
class BehaviourRegister extends ResourceBase {

  /**
   * A current user instance.
   *
   * @var \Drupal\Core\Session\AccountProxyInterface
   */
  protected $currentUser;

  /**
   * The entity manager.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface.
   */
  protected $entityTypeManager;

  /**
   * The entity form builder.
   *
   * @var \Drupal\Core\Entity\EntityManagerInterface.
   */
  protected $entityFormBuilder;  

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
    AccountProxyInterface $current_user,
    EntityTypeManagerInterface $entityTypeManager, 
    EntityFormBuilderInterface $entityFormBuilder) {
    parent::__construct($configuration, $plugin_id, $plugin_definition, $serializer_formats, $logger);

    $this->currentUser = $current_user;
    $this->entityTypeManager = $entityTypeManager;
    $this->entityFormBuilder = $entityFormBuilder;
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
      $container->get('entity_type.manager'),
      $container->get('entity.form_builder')
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
         // Validate the e-mail address first.
        if (!\Drupal::service('email.validator')->isValid($data['email'])) {
          return new ResourceResponse(array("error" => "invalid email"));
        }

        if ($data['pass'] !== $data['confirm_pass']) {
          return new ResourceResponse(array("error" => "not matching"));
        }

        $language = \Drupal::languageManager()->getCurrentLanguage()->getId();
        $user = entity_create('user', [
          'name' => $data['email'],
          'pass' => $data['pass'],
          'mail' => $data['email'],
          'init' => $data['email'],
          'status' => 1,
          'langcode' => $language
        ]);
        $errors = $user->validate();
        if($errors->count() == 0) {
          $user->save();
          // we need to finilize login send cookie to browser.
          user_login_finalize($user);
          return new ResourceResponse(array(
            "pic" => "/sites/default/files/public/styles/thumbnail/public/avatar_kit/robohash/1.jpg",
            "name" => substr($user->getUsername(), 0, strpos($user->getUsername(), '@')),
            "csr_token" => \Drupal::csrfToken()->get(CsrfRequestHeaderAccessCheck::TOKEN_KEY),
          ));
        }
        else {
          $error_messages = array();
          foreach ($errors->getByFields($errors->getFieldNames()) as $violation) {
            list($field_name) = explode('.', $violation->getPropertyPath(), 2);
            $error_messages[$field_name] = $violation->getMessage();
          }
          return new ResourceResponse(array("error" => $error_messages));
        }
      /*}
      else {
        return new ResourceResponse(array("error" => "captcha"));
      }*/
    }
    else {
      return new ResourceResponse(array("error" => "Missing data"));
    }
  }
}
