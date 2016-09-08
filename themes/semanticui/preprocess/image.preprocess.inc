<?php

/**
 * @file
 * Contains preprocess functions for image.
 */

/**
 * Implements hook_preprocess_image().
 *
 * Removes height and width inline styles from images to make them responsive.
 */
function semanticui_preprocess_image(&$variables) {
  foreach (array('width', 'height') as $key) {
    unset($variables[$key]);
  }

  if (empty($variables['attributes']['class'])) {
    $variables['attributes']['class'] = array();
  }
  elseif (!is_array($variables['attributes']['class'])) {
    $variables['attributes']['class'] = explode(' ', $variables['attributes']['class']);
  }

  if (isset($variables['style_name'])) {
    $variables['attributes']['class'][] = 'ui';
    $variables['attributes']['class'][] = 'image';
    $variables['attributes']['class'][] = drupal_html_class($variables['style_name']);
  }
}
