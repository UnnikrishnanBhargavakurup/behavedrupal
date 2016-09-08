<?php

/**
 * @file
 * Contains preprocess functions for Toolbar.
 */

/**
 * Implements hook_preprocess_toolbar().
 */
function semanticui_preprocess_toolbar(&$variables) {
  // Override default theme function for toolbar home links.
  $variables['toolbar']['toolbar_home']['#theme'] = 'links__toolbar_home';

  // Override default theme wrappers to be able to style shortcut sets in
  // the same way.
  $variables['toolbar']['toolbar_drawer'][0]['shortcuts']['#theme_wrappers'] = array('menu_tree__shortcut_set');
}
