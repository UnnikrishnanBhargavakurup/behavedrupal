<?php

/**
 * @file
 * Contains preprocess functions for table.
 */

/**
 * Implements hook_preprocess_table().
 */
function semanticui_preprocess_table(&$variables) {
  $variables['attributes']['class'][] = 'ui';
  $variables['attributes']['class'][] = 'unstackable';
  $variables['attributes']['class'][] = 'table';
  $variables['attributes']['class'][] = 'striped';

  // Update "Recent log messages" table to use Semantic UI classes.
  $log_table_id = 'admin-dblog';
  if (isset($variables['attributes']['id']) && $variables['attributes']['id'] == $log_table_id) {
    foreach ($variables['rows'] as $row_num => $row) {
      $error_classes = array(
        'dblog-error',
        'dblog-critical',
        'dblog-alert',
        'dblog-emerg',
      );
      if (count(array_intersect($error_classes, $row['class']))) {
        $variables['rows'][$row_num]['class'][] = 'error';
      }
      if (in_array('dblog-warning', $row['class'])) {
        $variables['rows'][$row_num]['class'][] = 'warning';
      }
      if (in_array('dblog-notice', $row['class'])) {
        $variables['rows'][$row_num]['class'][] = 'positive';
      }
    }
  }
}
