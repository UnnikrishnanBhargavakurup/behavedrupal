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
use Drupal\Core\File\FileSystem;
use \ZipArchive;
use \RecursiveIteratorIterator;
use \RecursiveDirectoryIterator;

/**
 * Provides a resource to get view modes by entity and bundle.
 *
 * @RestResource(
 *   id = "behaviour_download",
 *   label = @Translation("Behaviour builder download build"),
 *   uri_paths = {
 *     "canonical" = "/behave/download",
 *     "https://www.drupal.org/link-relations/create" = "/behave/download"
 *   },
 *   serialization_class = "Drupal\behaviour_builder\normalizer\JsonDenormalizer",
 * )
 */
class BehaviourDownload extends ResourceBase {

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
      $url = "";
      if(isset($data['id']) && is_numeric($data['id'])) {
        $node = Node::load($data['id']);
        //set value for field
        $url = $this->prepareBuild(json_decode($node->get('body')->value));
      }
      else if(isset($data['data'])) {
        // for converting array into object.
        //$data =  json_decode(json_encode($data['data']));
        $_data = json_decode(json_encode($data['data']));
        $url = $this->prepareBuild($_data, $data['base_url']);
      }
      return new ResourceResponse(array("url" => $url));
    }
    else {
      return new ResourceResponse(array("error" => "Missing data"));
    }
  }

  /**
   *
   */
  private function prepareBuild($features = array(), $base_url = "http://localhost/") {
    $unique_name = uniqid();
    $build_path = 'public://downloads/'. $unique_name .'/build/build';
    file_prepare_directory($build_path, FILE_MODIFY_PERMISSIONS | FILE_CREATE_DIRECTORY);
    $dest = drupal_realpath('public://downloads/'. $unique_name .'/build/build/');
    foreach (
     $iterator = new \RecursiveIteratorIterator(
      new \RecursiveDirectoryIterator(drupal_realpath('public://build_template/build'), \RecursiveDirectoryIterator::SKIP_DOTS),
      \RecursiveIteratorIterator::SELF_FIRST) as $item
    ) {
      if ($item->isDir()) {
        mkdir($dest . DIRECTORY_SEPARATOR . $iterator->getSubPathName());
      } else {
        copy($item, $dest . DIRECTORY_SEPARATOR . $iterator->getSubPathName());
      }
    }
    // add base_url in local behat config
    if($base_url != 'http://localhost/') {
      $this->addBasePath(drupal_realpath('public://downloads/'. $unique_name .'/build/build/tests/behat/behat.local.yml'), $base_url);
    }
    $destination = "public://downloads/". $unique_name ."/build/build/tests/behat/features/";
    file_prepare_directory($destination, FILE_MODIFY_PERMISSIONS | FILE_CREATE_DIRECTORY);
    drupal_mkdir($destination, NULL, TRUE);
    foreach ($features as $feature) {
      $file_name = $this->clean($feature->name) .".feature";
      $feature_data = "Feature: ". $feature->name;
      if(isset($feature->description)) {
        //remove whitespace after newline.
        $description = preg_replace("/\n\s+/", "\n", "\n". trim(filter_var($feature->description, FILTER_SANITIZE_STRING)));
        // we need to indent three lines here
        $feature_data .= str_replace("\n", "\n   ", $description). "\n";
      }
      // get al scenarios, tags, actions here.
      foreach ($feature->scenarios as $scenario) {
        $_scenario = "";
        $_actions = "";
        $tags = array();
        // three space indentation
        // need to find tags form action text here.
        $_scenario = "\n   Scenario: ". $scenario->name . "\n";
        // get all the actions and find out tags in it.
        foreach ($scenario->actions as $action) {
          // nine space indendation
          if(isset($action->action)) {
            // get some tags from here.
            if(
                strrpos(strtolower($action->action), "ajax") !== false ||
                strrpos(strtolower($action->action), "javascript") !== false ||
                strrpos(strtolower($action->action), "jautocomplet") !== false 
              ) 
            {
              array_push($tags, "@javascript");
            }
            if(
                strrpos(strtolower($action->action), "drush") !== false ||
                strrpos(strtolower($action->action), "logged in") !== false ||
                strrpos(strtolower($action->action), "term") !== false 
              ) 
            {
              array_push($tags, "@api");
            }
            // add action text.
            $_actions .= "      ". $action->action . "\n";
          }
          else {
            foreach ($action->data as $row) {
              $_actions .= "      | ";
              foreach ($row as $cell) {
                $_actions .= $cell . " |";
              }
              $_actions .= "\n";
            }
          }
        }
        // remove duplicate tags here.
        $tags = array_unique($tags);
        $_tags = "";
        if(!empty($tags)){
          $_tags = "\n   ". implode($tags, ", ");
        }
        // write it here.
        $feature_data .= $_tags . $_scenario . $_actions;
      }
      // save feature file to filesystem
      file_unmanaged_save_data(
        $feature_data, 
        $destination . $file_name, 
        FILE_EXISTS_REPLACE
      );
    }
    // archive the file
    $this->archive('public://downloads/'. $unique_name);
    if(file_exists('public://downloads/'. $unique_name .'/build.zip')) {
      $url = Url::fromUri(file_create_url('public://downloads/'. $unique_name .'/build.zip'))->getUri();
      return $url;
    }
    return "";
  }   

  /**
   * Archive everything for download.
   */
  private function archive($path) {
    // zip the data
    $zip = new \ZipArchive();
    if ($zip->open(drupal_realpath($path . '/build.zip'), ZipArchive::CREATE | ZipArchive::OVERWRITE) !== TRUE) {
      return new ResourceResponse(array("message" => "error opening zip archive"));
    }
    $rootPath = drupal_realpath($path . '/build');
    $files = new RecursiveIteratorIterator(
      new RecursiveDirectoryIterator($rootPath),
      RecursiveIteratorIterator::LEAVES_ONLY
    );
    foreach ($files as $name => $file) {
        // Skip directories (they would be added automatically)
      if (!$file->isDir()) {
        // Get real and relative path for current file
        $filePath = $file->getRealPath();
        $relativePath = substr($filePath, strlen($rootPath) + 1);
        // Add current file to archive
        $zip->addFile($filePath, $relativePath);
      }
    }
    // Zip archive will be created only after closing object
    $zip->close();    
  } 

  /**
   * Clean special chars from string
   */
  private function clean($string) {
    $string = str_replace(' ', '_', $string); // Replaces all spaces with hyphens.
    return preg_replace('/[^A-Za-z0-9_]/', '', strtolower($string)); // Removes special chars.
  }
  
  /**
   * Add base path for access drupal enviornment
   */
  private function addBasePath($path, $base_path) {
    $behat_local = file_get_contents($path);
    //replace something in the file string - this is a VERY simple example
    $behat_local = str_replace("http://localhost/", $base_path, $behat_local);
    //write the entire string
    file_put_contents($path, $behat_local);
  }
}
