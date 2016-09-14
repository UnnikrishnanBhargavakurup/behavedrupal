<?php

namespace Drupal\behaviour_builder;

use \ZipArchive;
use \RecursiveIteratorIterator;
use \RecursiveDirectoryIterator;

/**
 * common functions used in different behave APIs
 */
class BehaveCommon {

  /**
   * replace a string form file.
   */
  public static function replaceInFile($key, $replace, $file_path) {
    $content = file_get_contents($file_path);
    //replace something in the file string - this is a VERY simple example
    $behat_local = str_replace($key, $replace, $content);
    //write the entire string
    file_put_contents($file_path, $content);    
  }

  /**
   * Clean special chars from string
   */
  public static function clean($string) {
    $string = str_replace(' ', '_', $string); // Replaces all spaces with hyphens.
    return preg_replace('/[^A-Za-z0-9_]/', '', strtolower($string)); // Removes special chars.
  }

  /**
   * Archive everything for download.
   */
  public static function archive($file_path, $zip_path) {
    // zip the data
    $zip = new \ZipArchive();
    if ($zip->open(drupal_realpath($zip_path), ZipArchive::CREATE | ZipArchive::OVERWRITE) !== TRUE) {
      return new ResourceResponse(array("message" => "error opening zip archive"));
    }
    $rootPath = drupal_realpath($file_path);
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
   * Write feature data to feature files.
   * @param $feature
   *  Feature objct from which data needs to be written.
   * @param $destination
   *  Destination of the feature file.
   */
  public static function writeFeatureData($feature, $destination) {
    $file_name = self::clean($feature->name) .".feature";
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

  /**
   * Prepare build 
   */
  public static function prepareBuild($usr_folder, $base_url, $token) {
    $build_path = 'public://downloads/'. $usr_folder .'/build/build';
    file_prepare_directory($build_path, FILE_MODIFY_PERMISSIONS | FILE_CREATE_DIRECTORY);
    $dest = drupal_realpath('public://downloads/'. $usr_folder .'/build/build/');
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
      self::replaceInFile('http://localhost/', $base_url, drupal_realpath('public://downloads/'. $usr_folder .'/build/build/tests/behat/behat.local.yml'));
    }    
  }
}
