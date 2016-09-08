<?php

/**
 * @file
 * Preprocess functions for search result.
 */

/**
 * Implements hook_preprocess_search_result().
 */
function semanticui_preprocess_search_result(&$variables) {
  $variables['title_attributes_array']['class'][] = 'header';
}
