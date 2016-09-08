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

/**
 * Provides a resource to get view modes by entity and bundle.
 *
 * @RestResource(
 *   id = "behaviour_save",
 *   label = @Translation("Behaviour builder save project"),
 *   uri_paths = {
 *     "canonical" = "/behave/save",
 *     "https://www.drupal.org/link-relations/create" = "/behave/save"
 *   },
 *   serialization_class = "Drupal\behaviour_builder\normalizer\JsonDenormalizer",
 * )
 */
class BehaviourSave extends ResourceBase {

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
      //$language = \Drupal::languageManager()->getCurrentLanguage()->getId();
      if(isset($data['id']) && is_numeric($data['id'])) {
        $node = Node::load($data['id']);
        //set value for field
        $node->body->value = $data['data'];
      }
      else {
        $node = Node::create([
          'type' => 'projects',
          'title' => $data['name'],
          'body' => json_encode($data['data']),
        ]);
        $user = user_load($this->currentUser->id());
        $node->setOwnerId($this->currentUser->id());
        $node->setOwner($user);
      }
      $errors = $node->validate();
      if($errors->count() == 0) {
        $node->save();
        return new ResourceResponse(array("pid" => $node->id(), "created" => $node->getCreatedTime()));
      }
      else {
        return new ResourceResponse(array("error" => $errors->getFieldNames()));
      }
    }
    else {
      return new ResourceResponse(array("error" => "Missing data"));
    }
  }
}
