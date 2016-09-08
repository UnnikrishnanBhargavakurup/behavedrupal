<?php

/**
 * @file
 * Implements preprocess functions for Drupal forum list.
 */

/**
 * Implements hook_preprocess_forum_list().
 */
function semanticui_preprocess_forum_list(&$vars) {
  $forums = $vars['forums'];
  foreach ($forums as $fid => $forum) {
    $icon = 'circle';
    switch ($forum->icon_class) {
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
    $vars['forums'][$fid]->icon = $icon;
  }
}
