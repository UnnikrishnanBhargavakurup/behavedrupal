<?php

/**
 * @file
 * Implements preprocess functions for Drupal forum topic list.
 */

/**
 * Implements hook_preprocess_forum_topic_list().
 */
function semanticui_preprocess_forum_topic_list(&$vars) {
  $topics = (array) $vars['topics'];
  foreach ($topics as $tid => $topic) {
    $vars['topics'][$tid]->title = filter_xss($vars['topics'][$tid]->title);
  }
}
