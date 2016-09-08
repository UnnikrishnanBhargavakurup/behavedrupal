<?php

/**
 * @file
 * Contains preprocess functions for node.
 */

/**
 * Implements hook_preprocess_node().
 */
function semanticui_preprocess_node(&$vars) {
  $vars['title_attributes_array']['class'][] = 'ui';
  $vars['title_attributes_array']['class'][] = 'header';

  $vars['content_attributes_array']['class'][] = 'ui';
  $vars['content_attributes_array']['class'][] = 'form';
  if (!empty($vars['user_picture'])) {
    $vars['content_attributes_array']['class'][] = 'left';
    $vars['content_attributes_array']['class'][] = 'floated';
    $vars['content_attributes_array']['class'][] = 'basic';
    $vars['content_attributes_array']['class'][] = 'horizontal';
    $vars['content_attributes_array']['class'][] = 'segment';
  }

  if ($vars['view_mode'] == 'teaser') {
    $vars['classes_array'][] = 'ui';
    $vars['classes_array'][] = 'segment';
  }

  // If authenticated user does not have permission to post a comments then
  // Comment module will add empty item (i.e. without title) to the links.
  // It will not be displayed but will be counted.
  if (isset($vars['content']['links']['comment']['#links']['comment_forbidden']) &&
      empty($vars['content']['links']['comment']['#links']['comment_forbidden']['title'])) {
    unset($vars['content']['links']['comment']['#links']['comment_forbidden']);
  }

  if ($vars['type'] === 'forum') {
    // Custom date format on forum.
    $vars['date'] = format_date($vars['created'], 'short');

    // Create links on forum topic.
    $vars['content']['links']['#theme'] = 'links__node_forum';
    $nid = $vars['nid'];
    // Add delete link to the links list.
    if (node_access('update', $vars['node'])) {
      $vars['content']['links']['comment']['#links'] = array('edit' => array(
          'title' => t('edit'),
          'href' => 'node/' . $nid . '/edit',
          'html' => TRUE,
        )) + $vars['content']['links']['comment']['#links'];
    }
    // Add edit link to the links list.
    if (node_access('delete', $vars['node'])) {
      $vars['content']['links']['comment']['#links'] = array('delete' => array(
          'title' => t('delete'),
          'href' => 'node/' . $nid . '/delete',
          'html' => TRUE,
        )) + $vars['content']['links']['comment']['#links'];
    }
    // Reply link.
    if (isset($vars['content']['links']['comment']['#links']['comment-add'])) {
      $vars['content']['links']['comment']['#links']['comment-add']['title'] = t('reply');
      $vars['content']['links']['comment']['#links']['comment-add']['html'] = TRUE;
    }
    // Add permalink to the links list.
    $vars['content']['links']['comment']['#links']['permalink'] = array(
      'title' => t('permalink'),
      'href' => drupal_get_path_alias('node/' . $nid),
      'html' => TRUE,
    );
  }
}
