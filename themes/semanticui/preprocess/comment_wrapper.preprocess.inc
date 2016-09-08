<?php

/**
 * @file
 * Contains preprocess and related functions for comment_wrapper.
 */

/**
 * Implements hook_preprocess_comment_wrapper().
 */
function semanticui_preprocess_comment_wrapper(&$variables) {
  $is_threaded = variable_get('comment_default_mode_' . $variables['node']->type, COMMENT_MODE_THREADED) == COMMENT_MODE_THREADED;
  if ($is_threaded) {
    semanticui_nest_comments($variables['content']['comments']);
  }
}

/**
 * Nests comments into threads regarding Semantic UI markup.
 *
 * By default Drupal provides flat list with comments. Sub-comment is wrapped
 * into div with "indented" class, but Semantic UI uses nested comments
 * structure.
 *
 * @param array $comments
 *   An array of comments. May contain additional information, such as #sorted
 *   or pager.
 */
function semanticui_nest_comments(&$comments) {
  foreach ($comments as $cid => $comment) {
    if (empty($comment['#comment']->cid)) {
      continue;
    }
    // Setting custom prefix will remove open div for indented wrapper as
    // theme uses nested markup for comments.
    $comments[$cid]['#prefix'] = '';  // Anchor must embedded in comment root div.
    $comments[$cid]['#suffix'] = '';
  }

  foreach ($comments as $cid => $comment) {
    if (empty($comment['#comment']->pid)) {
      continue;
    }
    $pids = semanticui_comment_get_parents($comment['#comment']->pid, $comments);
    if (empty($pids)) {
      continue;
    }

    $parent = drupal_array_get_nested_value($comments, $pids);

    if (!isset($parent['subcomments'])) {
      $parent['subcomments'] = array();
      $value = $parent;
      drupal_array_set_nested_value($comments, $pids, $value);
    }
    $parent['subcomments'][$cid] = $comment;
    $value = $parent;
    drupal_array_set_nested_value($comments, $pids, $value);
    unset($comments[$cid]);
  }
}

/**
 * Helper function to get all comment parents.
 *
 * @param int $pid
 *   Parent comment id.
 * @param array $comments
 *   An array of all comments to look for parent in.
 *
 * @return mixed
 *   Returned result contains an array of all parents or NULL if parent was not
 *   found in the provided comments array (this situation is possible when
 *   comments thread is divided on multiple pages).
 */
function semanticui_comment_get_parents($pid, $comments) {
  if (array_key_exists($pid, $comments)) {
    return array($pid);
  }

  foreach ($comments as $cid => $comment) {
    $parents = array();
    if (!empty($comment['subcomments'])) {
      $parents[] = $cid;
      $parents[] = 'subcomments';
      $sub_parents = semanticui_comment_get_parents($pid, $comment['subcomments']);
      if (!empty($sub_parents)) {
        $parents = array_merge($parents, $sub_parents);
        return $parents;
      }
    }
  }
  return NULL;
}
