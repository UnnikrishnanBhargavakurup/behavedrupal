<?php

/**
 * @file
 * Contains process functions for html_tag.
 */

/**
 * Implements hook_process_html_tag().
 */
function semanticui_process_html_tag(&$variables) {
  $tag = &$variables['element'];
  if ($tag['#tag'] == 'style' || $tag['#tag'] == 'script') {
    // Remove redundant type attribute and CDATA comments.
    unset($tag['#attributes']['type'], $tag['#value_prefix'], $tag['#value_suffix']);

    // Remove media="all" but leave others unaffected.
    if (isset($tag['#attributes']['media']) && $tag['#attributes']['media'] === 'all') {
      unset($tag['#attributes']['media']);
    }
  }
}
