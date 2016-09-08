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
use Drupal\Core\Entity\Query\QueryFactory;

/**
 * Provides a resource to get view modes by entity and bundle.
 *
 * @RestResource(
 *   id = "behaviour_get",
 *   label = @Translation("Behaviour builder get projects"),
 *   uri_paths = {
 *     "canonical" = "/behave/get/{id}"
 *   },
 *   serialization_class = "Drupal\behaviour_builder\normalizer\JsonDenormalizer",
 * )
 */
class BehaviourGet extends ResourceBase {

  /**
   * A current user instance.
   *
   * @var \Drupal\Core\Session\AccountProxyInterface
   */
  protected $currentUser;

  /**
   * The entity form builder.
   *
   * @var \Drupal\Core\Entity\Query\QueryInterface.
   */
  protected $entity_query;  
  
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
    QueryFactory $entity_query) {
    parent::__construct($configuration, $plugin_id, $plugin_definition, $serializer_formats, $logger);

    $this->currentUser = $current_user;
    $this->entity_query = $entity_query;
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
      $container->get('entity.query')
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
  public function get($id = 'all') {
    $query = $this->entity_query->get('node');
    $query->condition('type', 'projects');
    $query->condition('uid', $this->currentUser->id());
    if(is_numeric($id)) {
      $query->condition('nid', $id);
      $nids = $query->execute();
      if(!empty($nids)) {
        $node = entity_load('node', array_values($nids)[0]);
        return new ResourceResponse(array("data" => $node->get('body')->value));
      }
      return new ResourceResponse(array("data" => ""));
    }
    else if($id == 'all') {
      $nids = $query->execute();
      $nodes = entity_load_multiple('node', $nids);
      $result = array();
      foreach ($nodes as $node) {
        $result[] = array($node->id(), $node->get('title')->value, $node->get('body')->value);
      }
      return new ResourceResponse(array("result" => $result));
    }
    return new ResourceResponse(array("result" => ""));
  }
}
