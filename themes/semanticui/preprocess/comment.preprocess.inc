<?php

/**
 * @file
 * Contains preprocess and related functions for comments.
 */

/**
 * Implements hook_preprocess_comment().
 */
function semanticui_preprocess_comment(&$variables) {
  // Check if comments use title. If title is not allowed - then do not
  // render it.
  $node = $variables['node'];
  $title_allowed = variable_get('comment_subject_field_' . $node->type, 1) == 1;
  $variables['title_allowed'] = $title_allowed;

  $comment = $variables['elements']['#comment'];

  // Output title as a simple text (by defualt it is rendered as a link).
  $variables['title'] = $comment->subject;
  $variables['title_attributes_array']['class'][] = 'title';

  if (theme_get_setting('toggle_comment_user_picture')) {
    if (!empty($comment->picture->uri)) {
      $avatar_path = image_style_url(variable_get('user_picture_style'), $comment->picture->uri);
    }
    elseif (variable_get('user_picture_default', '')) {
      $avatar_path = variable_get('user_picture_default', '');
    }
  }

  // Update avatar to use Semantic UI markup.
  if (isset($avatar_path)) {
    $alt = t("@user's picture", array('@user' => format_username($comment)));
    $avatar_attributes = array();
    $avatar_wrapper_attributes = array('class' => array('avatar'));
    if ($variables['node']->type === 'forum') {
      $avatar_attributes = array('class' => array('ui bordered image card'));
      $avatar_wrapper_attributes = array();
    }
    $avatar = array(
      '#theme' => 'image',
      '#path' => $avatar_path,
      '#alt' => $alt,
      '#title' => $alt,
      '#attributes' => $avatar_attributes,
    );
    if (!empty($comment->uid) && user_access('access user profiles')) {
      $avatar_wrapper = array(
        '#type' => 'link',
        '#title' => drupal_render($avatar),
        '#href' => 'user/' . $comment->uid,
        '#options' => array(
          'html' => TRUE,
          'attributes' => $avatar_wrapper_attributes,
        ),
      );
    }
    else {
      $avatar_wrapper = array(
        '#type' => 'container',
        '#attributes' => $avatar_wrapper_attributes,
      );
      $avatar_wrapper['image'] = $avatar;
    }
    if ($variables['node']->type === 'forum') {
      $avatar_wrapper = array(
        '#type' => 'container',
        '#attributes' => array('class' => 'ui tiny image card'),
        'image' => $avatar_wrapper,
      );
    }
    $variables['picture'] = $avatar_wrapper;
  }

  $uri = entity_uri('comment', $comment);
  $uri['options'] += array('attributes' => array('class' => array('permalink'), 'rel' => 'bookmark'));

  // Add permalink to the links list.
  $variables['content']['links']['comment']['#links']['permalink'] = array(
    'title' => t('permalink'),
    'href' => $uri['path'],
    'attributes' => $uri['options']['attributes'],
    'fragment' => $uri['options']['fragment'],
    'html' => TRUE,
  );
  if ($variables['node']->type !== 'forum') {
    // Unset classes to that action links will have correct font size.
    $variables['content']['links']['#attributes']['class'] = array();
  }

  // Template comment.tpl.php is used on the default comments view
  // (under the node) and at the Reply page. On the default view this template
  // is rendered inside comment-wrapper.tpl.php and has wrapper with
  // "ui comments" classes, but at the Reply page it is not. That is why we
  // need to add a wrapper at the Reply page so that SemanticUI will style the
  // comment properly.
  $variables['is_reply_page'] = arg(0) == 'comment' && arg(1) == 'reply' && is_numeric(arg(2));

  // Some features of forum comments
  if ($variables['node']->type === 'forum') {
    $variables['created'] = format_date($variables['comment']->created, 'short');

    if (($key = array_search('links', $variables['content']['links']['#attributes']['class'])) !== FALSE) {
      unset($variables['content']['links']['#attributes']['class'][$key]);
    }
    // Forum comment links displayed as buttons.
    foreach ($variables['content']['links']['comment']['#links'] as $key => $link) {
      $variables['content']['links']['comment']['#links'][$key]['title'] = '<button class="mini basic ui button">' . $variables['content']['links']['comment']['#links'][$key]['title'] . '</button>';
    }
  }
}
