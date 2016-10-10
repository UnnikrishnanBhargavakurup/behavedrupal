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
use Symfony\Component\HttpFoundation\Response;
use Drupal\node\Entity\Node;
use Drupal\Core\File\FileSystem;
use \ZipArchive;
use \RecursiveIteratorIterator;
use \RecursiveDirectoryIterator;

use Drupal\behaviour_builder\BehaveCommon;

/**
 * Provides a resource to get view modes by entity and bundle.
 *
 * @RestResource(
 *   id = "behaviour_download_build",
 *   label = @Translation("Behaviour download build"),
 *   uri_paths = {
 *     "canonical" = "/behave/download-build",
 *     "https://www.drupal.org/link-relations/create" = "/behave/download-build"
 *   },
 *   serialization_class = "Drupal\behaviour_builder\normalizer\JsonDenormalizer",
 * )
 */
class BehaviourGetBuild extends ResourceBase {

  /**
   * A current user instance.
   *
   * @var \Drupal\Core\Session\AccountProxyInterface
   */
  protected $currentUser;
  
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
   * Responds to GET requests.
   *
   * Returns a list of bundles for specified entity.
   *
   * @throws \Symfony\Component\HttpKernel\Exception\HttpException
   *   Throws exception expected.
   */
  public function post($data) {
    $url = '';
    if(isset($data['base_url']) && isset($_SESSION['behave_drupal']['SESSIONWORKSPACE'])) {
      $session = $_SESSION['behave_drupal']['SESSIONWORKSPACE'];
      $build_path = 'public://downloads/'. $session .'/build/build';
      // we need to cleaup the folder may be there exist some previous builds. 
      if (file_exists(drupal_realpath($build_path))) {
        file_prepare_directory($build_path, FILE_MODIFY_PERMISSIONS | FILE_CREATE_DIRECTORY | FILE_EXISTS_REPLACE);
        file_unmanaged_delete_recursive($build_path);
      }
      file_prepare_directory($build_path, FILE_MODIFY_PERMISSIONS | FILE_CREATE_DIRECTORY | FILE_EXISTS_REPLACE);
      $dest = drupal_realpath('public://downloads/'. $session .'/build/build/');
      $sorce = drupal_realpath(drupal_get_path('module', 'behaviour_builder') . '/build_template/build');
      foreach (
       $iterator = new \RecursiveIteratorIterator(
        new \RecursiveDirectoryIterator($sorce, \RecursiveDirectoryIterator::SKIP_DOTS),
        \RecursiveIteratorIterator::SELF_FIRST) as $item
      ) {
        if ($item->isDir()) {
          mkdir($dest . DIRECTORY_SEPARATOR . $iterator->getSubPathName());
        } else {
          copy($item, $dest . DIRECTORY_SEPARATOR . $iterator->getSubPathName());
        }
      }
      // This is a requred parameter.
      $base_url = $data['base_url'] == "" ? "http://localhost" : $data['base_url'];
      // removing the trailing backslash if exist in the url.
      $base_url = preg_replace('{/$}', '', $base_url);
      // add base_url in local behat config
      BehaveCommon::replaceInFile(
        'LOCALHOST', 
        $base_url,
        drupal_realpath('public://downloads/'. $session .'/build/build/tests/behat/behat.local.yml')
      );
      // add session for building the project form comandline
      BehaveCommon::replaceInFile(
        'SESSIONID', 
        $session,
        drupal_realpath('public://downloads/'. $session .'/build/build/phing/build.properties')
      );
      // archive the file
      BehaveCommon::archive('public://downloads/'. $session .'/build/', 'public://downloads/'. $session .'/build.zip');
      if(file_exists('public://downloads/'. $session .'/build.zip')) {
        $url = Url::fromUri(file_create_url('public://downloads/'. $session .'/build.zip'))->getUri();
      }
    }
    else {
      //something went wrong here.
    }
    return new ResourceResponse(array("url" => $url));
  }
}
