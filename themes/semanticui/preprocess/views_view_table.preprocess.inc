<?php

/**
 * @file
 * Contains preprocess functions for views_view_table.
 */

/**
 * Implements hook_preprocess_views_view_table().
 */
function semanticui_preprocess_views_view_table(&$vars) {
  $vars['classes_array'][] = 'ui';
  $vars['classes_array'][] = 'unstackable';
  $vars['classes_array'][] = 'table';
}
