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

/**
 * Provides a resource to get view modes by entity and bundle.
 *
 * @RestResource(
 *   id = "behaviour_password_reset",
 *   label = @Translation("Behaviour builder change password"),
 *   uri_paths = {
 *     "canonical" = "/behave/reset-password",
 *     "https://www.drupal.org/link-relations/create" = "/behave/reset-password"
 *   },
 *   serialization_class = "Drupal\behaviour_builder\normalizer\JsonDenormalizer",
 * )
 */
class BehaviourPasswordReset extends ResourceBase {

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
        $form_state = (new FormState())->setValues(['name' => $data['mail']]);
        //$form_state->setRebuild();
        \Drupal::formBuilder()->submitForm('\Drupal\user\Form\UserPasswordForm', $form_state);
        // Check that the form returns an error when expected, and vice versa.
        $errors = $form_state->getErrors();
        if(empty($errors)) {
          return new ResourceResponse(array());
        }
        else {
          return new ResourceResponse(array("error" => $errors['name']));
        }
      /*}
      else {
        return new ResourceResponse(array("error" => "captcha"));
      }*/
    }
  }
}
