<?php

/**
 * @file
 * Contains preprocess functions for field.
 */

/**
 * Implements hook_preprocess_field().
 */
function semanticui_preprocess_field(&$vars) {
  if ($vars['element']['#field_name'] == 'field_tags' || $vars['element']['#field_name'] == 'taxonomy_forums') {
    array_walk($vars['items'], 'semanticui_update_element_classes');
  }
}

/**
 * Adds necessary classes for the field element.
 */
function semanticui_update_element_classes(&$el) {
  $el['#options']['attributes']['class'][] = 'ui';
  $el['#options']['attributes']['class'][] = 'tag';
  $el['#options']['attributes']['class'][] = 'label';
}
