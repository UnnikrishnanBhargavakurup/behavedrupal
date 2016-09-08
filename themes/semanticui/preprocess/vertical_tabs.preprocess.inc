<?php

/**
 * @file
 * Implements preprocess functions for default vertical tabs.
 */

/**
 * Implements hook_preprocess_vertical_tabs().
 */
function semanticui_preprocess_vertical_tabs(&$variables) {
  drupal_add_js(drupal_get_path('theme', 'semanticui') . '/js/vertical-tabs.js');
}
