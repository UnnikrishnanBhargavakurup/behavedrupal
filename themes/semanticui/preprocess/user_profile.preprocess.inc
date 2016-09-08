<?php

/**
 * @file
 * Implements preprocess functions for the user profile.
 */

/**
 * Implements hook_preprocess_user_profile().
 */
function semanticui_preprocess_user_profile(&$variables) {
  $account = $variables['elements']['#account'];
  $variables['user_mail'] = $variables['elements']['#account']->mail;
  $variables['user_name'] = $variables['elements']['#account']->name;
  // Helpful $user_profile variable for templates.
  foreach (element_children($variables['elements']) as $key) {
    $variables['user_profile'][$key] = $variables['elements'][$key];
  }

  // Preprocess fields.
  field_attach_preprocess('user', $account, $variables['elements'], $variables);
}
