<?php

/**
 * @file
 * Override or insert variables into the HTML templates.
 *
 * To add dynamically your own classes use
 * $vars['classes_array'][] = 'my_class';
 */

/**
 * Implements hook_preprocess_html().
 */
function semanticui_preprocess_html(&$vars) {
  if (semanticui_check_library('semanticui', 'semantic.min.css') && semanticui_check_library('semanticui', 'semantic.min.js')) {
    drupal_add_css(libraries_get_path('semanticui') . '/semantic.min.css', array('group' => CSS_THEME, 'every_page' => TRUE, 'weight' => -10));
    drupal_add_js(libraries_get_path('semanticui') . '/semantic.min.js', array('group' => JS_THEME, 'every_page' => TRUE));
  }
  else {
    drupal_set_message(t('Please download the latest version of <a href="https://github.com/Semantic-Org/Semantic-UI/archive/master.zip">Semantic UI from Github</a> and place all content of the <em>/dist</em> folder into a new libraries folder <em>/semanticui</em> within your drupal installation. %css_file and %js_file', array('%css_file' => 'sites/all/libraries/semanticui/semantic.min.css', '%js_file' => 'sites/all/libraries/semanticui/semantic.min.js')), 'error');
  }

  if (!module_exists('jquery_update')) {
    drupal_set_message(t('Semantic UI requires the <a href="https://www.drupal.org/project/jquery_update/">jQuery Update module</a> to be installed.'), 'error');
  }
  elseif (version_compare(variable_get('jquery_update_jquery_version'), '1.8', '<')) {
    drupal_set_message(t('Semantic UI requires at least jQuery 1.8. Please enable it by <a href="/admin/config/development/jquery_update/">clicking here</a>.'), 'error');
  }
}
