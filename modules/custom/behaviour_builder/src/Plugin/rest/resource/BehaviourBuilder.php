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
use \ZipArchive;
use \RecursiveIteratorIterator;
use \RecursiveDirectoryIterator;

/**
 * Provides a resource to get view modes by entity and bundle.
 *
 * @RestResource(
 *   id = "behaviour_builder",
 *   label = @Translation("Behaviour builder build project"),
 *   uri_paths = {
 *     "canonical" = "/download/features",
 *     "https://www.drupal.org/link-relations/create" = "/download/features"
 *   },
 *   serialization_class = "Drupal\behaviour_builder\normalizer\JsonDenormalizer",
 * )
 */
class BehaviourBuilder extends ResourceBase {

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
   * Responds to POST requests.
   *
   * Returns a list of bundles for specified entity.
   *
   * @throws \Symfony\Component\HttpKernel\Exception\HttpException
   *   Throws exception expected.
   */
  public function post($data) {
    $url = "";
    if(!empty($data)) {
      //delete any existing files and write new features.
      file_unmanaged_delete_recursive("public://build/tests/behat/features/");
      drupal_mkdir("public://build/tests/behat/features/");
      foreach ($data as $features) {
        $file_name = $this->clean($features['name']) .".feature";
        $feature_data = "Feature: ". $features['name'];
        //remove whitespace after newline.
        $description = preg_replace("/\n\s+/", "\n", "\n". trim($features['description']));
        // we need to indent three lines here
        $feature_data .= str_replace("\n", "\n   ", $description). "\n";
        // get al scenarios, tags, actions here.
        foreach ($features['scenarios'] as $scenario) {
          $_scenario = "";
          $_actions = "";
          $tags = array();
          // three space indentation
          // need to find tags form action text here.
          $_scenario = "\n   ". $scenario['name'] . "\n";
          // get all the actions and find out tags in it.
          foreach ($scenario['actions'] as $action) {
            // nine space indendation
            if(isset($action['text'])) {
              // get some tags from here.
              if(
                  strrpos(strtolower($action['text']), "ajax") !== false ||
                  strrpos(strtolower($action['text']), "javascript") !== false ||
                  strrpos(strtolower($action['text']), "jautocomplet") !== false 
                ) 
              {
                array_push($tags, "@javascript");
              }
              if(
                  strrpos(strtolower($action['text']), "drush") !== false ||
                  strrpos(strtolower($action['text']), "logged in") !== false ||
                  strrpos(strtolower($action['text']), "term") !== false 
                ) 
              {
                array_push($tags, "@api");
              }
              // add action text.
              $_actions .= "      ". $action['text'] . "\n";
            }
            else {
              foreach ($action['data'] as $row) {
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
        file_unmanaged_save_data($feature_data, "public://build/tests/behat/features/". $file_name, FILE_EXISTS_REPLACE);
      }
      // archive the file
      $this->archive();
      if(file_exists('public://build.zip')) {
        $url = Url::fromUri(file_create_url('public://build.zip'))->getUri();
      }
    }
    // response back urll to download the build file.
    return new ResourceResponse(array("url" => $url));
  }
  
  /**
   * Archive everything for download.
   */
  private function archive() {
    // zip the data
    $zip = new \ZipArchive();
    if ($zip->open(drupal_realpath('public://build.zip'), ZipArchive::CREATE | ZipArchive::OVERWRITE)!==TRUE) {
      return new ResourceResponse(array("message" => "error opening zip archive"));
    }
    $rootPath = drupal_realpath("public://build");
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
}
