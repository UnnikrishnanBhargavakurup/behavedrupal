<?php

/**
 * @file
 * Contains preprocess functions for item list.
 */

/**
 * Implements hook_preprocess_item_list().
 */
function semanticui_preprocess_item_list(&$variables) {
  if (!isset($variables['attributes']['class']) ||
      is_array($variables['attributes']['class'])) {
    $variables['attributes']['class'][] = 'ui';
    $variables['attributes']['class'][] = 'list';
  }
  elseif (is_string($variables['attributes']['class'])) {
    $variables['attributes']['class'] .= ' ui list';
  }
}
