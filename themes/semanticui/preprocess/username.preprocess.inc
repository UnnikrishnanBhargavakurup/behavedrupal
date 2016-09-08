<?php

/**
 * @file
 * Implements preprocess functions for the user name.
 */

/**
 * Implements hook_preprocess_username().
 */
function semanticui_preprocess_username(&$variables) {
  // Forum uses standard link style, therefore no need class 'author' in username link on forum.
  if (!((isset($variables['account']->type) && $variables['account']->type == 'forum') || (isset($variables['account']->node_type) && $variables['account']->node_type == 'comment_node_forum'))) {
    $variables['attributes_array']['class'][] = 'author';
  }
}
