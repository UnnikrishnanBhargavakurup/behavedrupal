<?php

/**
 * @file
 * Contains preprocess functions for links.
 */

/**
 * Implements hook_preprocess_links().
 */
function semanticui_preprocess_links(&$variables) {
  $variables['attributes']['class'][] = 'ui';
  $variables['attributes']['class'][] = 'list';

  // Here is additional check for FALSE result because needle class may be
  // placed at the 0 position.
  if (($key = array_search('links', $variables['attributes']['class'])) !== FALSE) {
    unset($variables['attributes']['class'][$key]);
    $variables['attributes']['class'][] = 'link';
  }

  if (($key = array_search('inline', $variables['attributes']['class'])) !== FALSE) {
    unset($variables['attributes']['class'][$key]);
    $variables['attributes']['class'][] = 'horizontal';
  }

  if (($key = array_search('operations', $variables['attributes']['class'])) !== FALSE) {
    unset($variables['attributes']['class'][$key]);
    $variables['attributes']['class'][] = 'link';
    $variables['attributes']['class'][] = 'horizontal';
    $variables['attributes']['class'][] = 'divided';
  }
}
