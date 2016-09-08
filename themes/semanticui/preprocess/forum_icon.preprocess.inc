<?php

/**
 * @file
 * Implements preprocess functions for Drupal forum icon.
 */

/**
 * Implements hook_preprocess_forum_icon().
 */
function semanticui_preprocess_forum_icon(&$vars) {
  $icon = 'circle';
  switch ($vars['icon_class']) {
    case 'new':
      $icon = 'red circle';
      break;

    case 'sticky':
      $icon = 'teal info';
      break;

    case 'hot':
      $icon = 'attention';
      break;

    case 'closed':
      $icon = 'lock';
      break;

    case 'hot-new':
      $icon = 'red attention';
      break;

    default:
      $icon = 'circle';
  }
  $vars['icon'] = $icon;
}
