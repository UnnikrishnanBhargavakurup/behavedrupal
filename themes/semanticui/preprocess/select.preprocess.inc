<?php

/**
 * @file
 * Contains preprocess functions for select element.
 */

/**
 * Implements hook_preprocess_select().
 */
function semanticui_preprocess_select(&$variables) {
  if (!isset($variables['element']['#attributes']['class'])) {
    $variables['element']['#attributes']['class'] = array();
  }

  // Add necessary classes for the select element so it will be styled with
  // Semantic UI framework.
  if (!in_array('ui', $variables['element']['#attributes']['class'])) {
    $variables['element']['#attributes']['class'][] = 'ui';
  }
  if (!in_array('dropdown', $variables['element']['#attributes']['class'])) {
    $variables['element']['#attributes']['class'][] = 'dropdown';
  }
}
