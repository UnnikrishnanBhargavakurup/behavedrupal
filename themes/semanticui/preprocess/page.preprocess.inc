<?php

/**
 * @file
 * Preprocess functions for page.
 */

/**
 * Implements hook_preprocess_page().
 */
function semanticui_preprocess_page(&$variables) {
  if (!empty($variables['page']['sidebar_first'])) {
    $left = $variables['page']['sidebar_first'];
  }

  if (!empty($variables['page']['sidebar_second'])) {
    $right = $variables['page']['sidebar_second'];
  }
  // Dynamic sidebars.
  if (!empty($left) && !empty($right)) {
    $variables['main_grid'] = 'eight wide column';
    $variables['sidebar_left'] = 'four wide column';
    $variables['sidebar_right'] = 'four wide column';
  }
  elseif (empty($left) && !empty($right)) {
    $variables['main_grid'] = 'twelve wide column';
    $variables['sidebar_left'] = '';
    $variables['sidebar_right'] = 'four wide column';
  }
  elseif (!empty($left) && empty($right)) {
    $variables['main_grid'] = 'twelve wide column';
    $variables['sidebar_left'] = 'four wide column';
    $variables['sidebar_right'] = '';
  }
  else {
    $variables['main_grid'] = 'sixteen wide column';
    $variables['sidebar_left'] = '';
    $variables['sidebar_right'] = '';
  }

  $variables['primary_navigation'] = NULL;
  if (!empty($variables['main_menu']) && variable_get('menu_main_links_source', FALSE)) {
    $variables['primary_navigation'] = menu_tree(variable_get('menu_main_links_source'));
    // Unset menu wrapper as it is rendered as right part in exising
    // menu (see template page.tpl.php).
    $variables['primary_navigation']['#theme_wrappers'] = array();
  }

  $variables['secondary_navigation'] = NULL;
  if (!empty($variables['secondary_menu']) && variable_get('menu_secondary_links_source', FALSE)) {
    $variables['secondary_navigation'] = menu_tree(variable_get('menu_secondary_links_source'));
    $variables['secondary_navigation']['#theme_wrappers'] = array('menu_tree__secondary');
  }

  // Update menus in sidebars to use separate wrapper.
  iscale_page_update_sidebar_menus($variables);

  // As we are placing secondary menu inside the wrapper we need to split menus
  // into two variables.
  $variables['tabs_primary'] = $variables['tabs'];
  unset($variables['tabs_primary']['#secondary']);

  $variables['tabs_secondary'] = $variables['tabs'];
  unset($variables['tabs_secondary']['#primary']);

  // Making fixed navigation bar if this option is enabled.
  $semanticui_fixed_navbar = theme_get_setting('semanticui_fixed_navbar');
  if ($semanticui_fixed_navbar == 1) {
    $variables['fixed_navbar'] = 'fixed overlay-displace-top';
    drupal_add_js(drupal_get_path('theme', 'semanticui') . '/js/displace.js', array('group' => JS_THEME));
  }
  else {
    $variables['fixed_navbar'] = 'attached';
  }
}

/**
 * Update menu if it is placed in a sidebar.
 *
 * By default Drupal renders block title above the block. It would be good to
 * render it as a menu title inside menu structure (with classes "header item").
 *
 * @param array $variables
 *   An array of variables passed from hook_preprocess_page().
 */
function iscale_page_update_sidebar_menus(&$variables) {
  $menus = menu_get_menus(TRUE);
  $sidebars = array('sidebar_first', 'sidebar_second');

  // Walk through both sidebars.
  foreach ($sidebars as $sidebar) {
    $sidebar_elements = isset($variables['page'][$sidebar]) ? element_children($variables['page'][$sidebar]) : array();
    foreach ($sidebar_elements as $element_name) {
      $element = $variables['page'][$sidebar][$element_name];

      // Check if sidebar element is a menu.
      if (isset($element['#block']) &&
          in_array($element['#block']->module, array('system', 'menu')) &&
          array_key_exists($element['#block']->delta, $menus)) {

        // Do not add title item if it is empty.
        if (!empty($variables['page'][$sidebar][$element_name]['#block']->subject)) {
          $menu_header['menu_header'] = array(
            '#type' => 'container',
            '#attributes' => array(
              'class' => array(
                'header',
                'item',
              ),
            ),
          );
          $menu_header['menu_header']['header'] = array(
            '#markup' => $variables['page'][$sidebar][$element_name]['#block']->subject,
          );

          $variables['page'][$sidebar][$element_name] = $menu_header + $variables['page'][$sidebar][$element_name];
        }

        $variables['page'][$sidebar][$element_name]['#is_menu'] = TRUE;
      }
    }
  }
}
