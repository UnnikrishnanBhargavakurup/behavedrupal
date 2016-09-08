<?php

/**
 * @file
 * Override or insert variables into the block_admin_display template.
 */

/**
 * Implements hook_preprocess_block_admin_display_form().
 *
 * Adds wrapper to the select element with regions to remove Semantic UI bottom
 * margin (margin will not be added for last child element).
 */
function semanticui_preprocess_block_admin_display_form(&$variables) {
  foreach (element_children($variables['form']['blocks']) as $i) {
    $block = &$variables['form']['blocks'][$i];
    show($block['region']);
    show($block['theme']);
    // Fetch the region for the current block.
    $region = (isset($block['region']['#default_value']) ? $block['region']['#default_value'] : BLOCK_REGION_NONE);

    $region_wrapper = array(
      '#type' => 'container',
      '#attributes' => array(
        'class' => array(
          'field-theme-wrapper',
        ),
      ),
    );
    $region_wrapper['field'] = $block['region'];

    $variables['block_listing'][$region][$i]->region_select = drupal_render($region_wrapper) . drupal_render($block['theme']);
  }
}
