<?php

/**
 * @file
 * Implements hook_form_alter() to alter forms.
 */

use Drupal\Component\Utility\Html;
use Drupal\Core\Template\Attribute;
use Drupal\Component\Utility\Xss;
use Drupal\Core\Render\Element;
use Drupal\Component\Utility\SafeMarkup;

/**
 * Implements hook_form_alter().
 */
function semanticui_form_alter(&$form, \Drupal\Core\Form\FormStateInterface $form_state, $form_id) {
  $form['#attributes']['class'][] = 'ui';
  $form['#attributes']['class'][] = 'form';
  if ($form_id) {

    // IDs of forms that should be ignored. Make this configurable?
    // @todo is this still needed?
    $form_ids = array(
      'node_form',
      'system_site_information_settings',
      'user_profile_form',
      'node_delete_confirm',
    );

    // Only wrap in container for certain form.
    if (!in_array($form_id, $form_ids) && !isset($form['#node_edit_form']) && isset($form['actions']) && isset($form['actions']['#type']) && ($form['actions']['#type'] == 'actions')) {
      $form['actions']['#theme_wrappers'] = array();
    }
    switch ($form_id) {
      case 'search_form':
        // Hide default submit button.
        $form['basic']['submit']['#attributes']['class'][] = 'element-invisible';

        // Append search icon to the input.
        $form['basic']['keys']['#attributes']['placeholder'] = t('Search ...');
        $form['basic']['keys']['#attributes']['class'][] = 'prompt';
        $form['basic']['keys']['#theme_wrappers'] = array('search_block_input_wrapper');
        break;

      case 'search_block_form':
        $form['#attributes']['class'][] = 'search-form';
        $form['actions']['submit']['#attributes']['class'][] = 'element-invisible';

        $form['search_block_form']['#attributes']['placeholder'] = t('Search ...');
        $form['search_block_form']['#attributes']['class'][] = 'prompt';
        $form['search_block_form']['#theme_wrappers'] = array('search_block_input_wrapper');

        // Removed "form" class as Semantic UI styles search input differently
        // inside the "form".
        if (($form_class = array_search('form', $form['#attributes']['class'])) !== FALSE) {
          unset($form['#attributes']['class'][$form_class]);
        }
        break;

      case 'user_login_block':
        $form['name']['#attributes']['placeholder'] = t('Username');
        $form['pass']['#attributes']['placeholder'] = t('Password');
        break;

      case 'user_login':
        $form['#attributes']['class'][] = 'segment';
        $form['name']['#attributes']['placeholder'] = t('Username');
        $form['pass']['#attributes']['placeholder'] = t('Password');
        break;

      case 'user_register_form':
        $form['#attributes']['class'][] = 'segment';
        $form['account']['name']['#attributes']['placeholder'] = t('Username');
        $form['account']['mail']['#attributes']['placeholder'] = t('Email');
        break;

      case 'user_pass':
        $form['#attributes']['class'][] = 'segment';
        $form['name']['#attributes']['placeholder'] = t('Username or e-mail address');
        break;

      case 'comment_node_forum_form':
        $form['#attributes']['class'][] = 'reply';
        break;
    }
  }
  // Add default class to form.
  $form['actions']['submit']['#attributes']['class'][] = 'ui';
  $form['actions']['submit']['#attributes']['class'][] = 'button';
}

/**
 * Implements hook_form_FORM_ID_alter().
 */
function semanticui_form_comment_form_alter(&$form, \Drupal\Core\Form\FormStateInterface $form_state) {
  // Hide "Your name" field.
  $form['author']['_author']['#access'] = FALSE;
  $form['actions']['submit']['#attributes']['class'][] = 'primary';
  $form['actions']['submit']['#attributes']['class'][] = 'labeled';
  $form['actions']['submit']['#attributes']['class'][] = 'submit';
  $form['actions']['submit']['#attributes']['class'][] = 'icon';

  $form['#after_build'][] = 'semanticui_comments_after_build';
}

/**
 * After build function for the Comment form.
 *
 * Updates attributes that are not populated in the hook_form_alter().
 */
function semanticui_comments_after_build(&$form, \Drupal\Core\Form\FormStateInterface $form_state) {
  if (isset($form['comment_body'])) {
    // Move filter hint to Semantic UI popup.
    $language = $form['comment_body']['#language'];
    $form['comment_body'][$language][0]['format']['#attributes']['class'][] = 'ui';
    $form['comment_body'][$language][0]['format']['#attributes']['class'][] = 'popup';
    $form['comment_body'][$language][0]['value']['#title'] .= '<i class="help circle icon"></i>';
    //$form['comment_body'][$language][0]['#attached']['js'][] = drupal_get_path('theme', 'semanticui') . '/js/comments.js';
    // Add "field" class, so Semantic UI will add a margin.
    $form['comment_body']['#attributes']['class'][] = 'field';
  }

  // Update submit button to use label inside.
  if (($key = array_search('button', $form['actions']['submit']['#theme_wrappers'])) !== FALSE) {
    unset($form['actions']['submit']['#theme_wrappers'][$key]);
    $form['actions']['submit']['#theme_wrappers'][] = 'labeled_button';
  }
  $form['actions']['submit']['#label'] = array(
    '#prefix' => '<i class="icon edit"></i>',
    '#markup' => t('Add Comment'),
  );

  return $form;
}

/**
 * Theme function for block search input.
 */
function semanticui_search_block_input_wrapper(&$variables) {
  $input_wrapper = array(
    '#type' => 'container',
    '#attributes' => array(
      'class' => array(
        'ui',
        'fluid',
        'search',
        'icon',
        'input',
      ),
    ),
  );
  $input_wrapper['input'] = array(
    '#markup' => $variables['element']['#children'],
  );
  $input_wrapper['icon'] = array(
    '#markup' => '<i class="search icon"></i>',
  );

  return drupal_render($input_wrapper);
}

/**
 * Implements theme_form_element().
 */
function semanticui_form_element($variables) {
  $element = &$variables['element'];
  $is_checkbox = FALSE;
  $is_radio = FALSE;

  // This function is invoked as theme wrapper, but the rendered form element
  // may not necessarily have been processed by form_builder().
  $element += array(
    '#title_display' => 'before',
  );

  // Add element #id for #type 'item'.
  if (isset($element['#markup']) && !empty($element['#id'])) {
    $attributes['id'] = $element['#id'];
  }
  // Check for errors and set correct error class.
  $error_text = "";//TODO:(isset($element['#parents'])) ? form_get_error($element) : NULL;
  if ($error_text !== NULL && !empty($element['#validated'])) {
    $element['#attributes']['class'][] = 'error1';
    Element::setAttributes($element, array('class' =>'error'));
    $error = 'error';
  }
  else {
    $error = '';
  }

  // Prepare popup error message.
  // Also check that the message is added to the root element, like radios
  // wrapper and not to each radio button in the set.
  if ($error_text !== NULL && theme_get_setting('semanticui_error_popups') == 1 && empty($element['#semanticui_skip_error_message'])) {
    $error_message = '<div class="ui pointing red basic label">' . $error_text . '</div>';
  }
  else {
    $error_message = '';
  }

  // Add element's #type and #name as class to aid with JS/CSS selectors.
  $attributes['class'] = array('form-item');
  $attributes['class'][] = 'field';
  $attributes['class'][] = $error;

  if (!empty($element['#type'])) {
    $attributes['class'][] = Html::getClass('form-type-' . $element['#type']);
  }
  if (!empty($element['#name'])) {
    $attributes['class'][] = Html::getClass('form-item-' . $element['#name']);
  }
  // Add a class for disabled elements to facilitate cross-browser styling.
  if (!empty($element['#attributes']['disabled'])) {
    $attributes['class'][] = 'disabled';
  }
  if (!empty($element['#autocomplete_path']) && drupal_valid_path($element['#autocomplete_path'])) {
    $attributes['class'][] = 'autocomplete';
  }
  if (isset($element['#type'])) {
    if ($element['#type'] == "radio") {
      unset($attributes['class']);
      $attributes['class'][] = 'ui';
      $attributes['class'][] = 'radio';
      $attributes['class'][] = 'checkbox';
      $attributes['class'][] = 'form-item';
      $is_radio = TRUE;
    }
    elseif ($element['#type'] == "checkbox") {
      unset($attributes['class']);
      $attributes['class'][] = 'ui';
      $attributes['class'][] = 'checkbox';
      $attributes['class'][] = 'form-item';
      $is_checkbox = TRUE;
      if (isset($element['#title'])) {
        if ($element['#title_display'] == 'invisible') {
          $attributes['class'][] = 'tab-label';
        }
      }
      else {
        $attributes['class'][] = 'tab-label';
      }
    }
    elseif ($element['#type'] == 'file') {
      $attributes['class'][] = 'ui';
      $attributes['class'][] = 'input';
    }
    else {
      $attributes['class'][] = 'form';
    }
  }

  // Add requird class to the element wrapper because Semantic UI will use it
  // to append required aterisk.
  if (isset($element['#required']) && $element['#required']) {
    $attributes['class'][] = 'required';
  }

  // Show field description in a popup.
  $popup_description = theme_get_setting('semanticui_popup_description');
  if (!empty($element['#description']) && $popup_description == 1) {
    $attributes['data-html'][] = $element['#description'];
  }

  if (isset($element['#wrapper_attributes'])) {
    $attributes = drupal_array_merge_deep($attributes, $element['#wrapper_attributes']);
  }

  $output = '<div' . new Attribute($attributes) . '>' . "\n";

  // If #title is not set, we don't display any label or required marker.
  if (!isset($element['#title'])) {
    $element['#title_display'] = 'none';
  }
  $prefix = isset($element['#field_prefix']) ? '<span class="field-prefix">' . $element['#field_prefix'] . '</span> ' : '';
  $suffix = isset($element['#field_suffix']) ? ' <span class="field-suffix">' . $element['#field_suffix'] . '</span>' : '';

  switch ($element['#title_display']) {
    case 'before':
    case 'invisible':
      $data = array('form_element_label', $variables);
      $output .= ' ' . drupal_render($data);
      $output .= ' ' . $prefix . $element['#children'] . $suffix . "\n";
      break;

    case 'after':
      if ($is_radio || $is_checkbox) {
        $output .= ' ' . $prefix . $element['#children'] . $suffix;
      }
      else {
        $variables['#children'] = ' ' . $prefix . $element['#children'] . $suffix;
      }
      $data = array('form_element_label', $variables);
      $output .= ' ' . drupal_render($data) . "\n";
      break;

    case 'none':
    case 'attribute':
      // Output no label and no required marker, only the children.
      $output .= ' ' . $prefix . $element['#children'] . $suffix . "\n";
      break;
  }

  if (!empty($element['#description']) && $popup_description == 0) {
    $output .= '<p class="description">' . $element['#description'] . "</p>\n";
  }

  $output .= $error_message;
  $output .= "</div>\n";

  return $output;
}

/**
 * Implements theme_button().
 */
function semanticui_button($variables) {
  $element = $variables['element'];
  Element::setAttributes($element, array(
    'id',
    'name',
    'value',
    'type',
      )
  );

  // If a button type class isn't present then add in default.
  $button_classes = array(
    'button',
    'positive',
    'blue',
    'orange',
    'negative',
  );
  $class_intersection = array_intersect($button_classes, $element['#attributes']['class']);
  if (empty($class_intersection)) {
    $element['#attributes']['class'][] = 'button';
  }

  // Add in the button type class.
  $element['#attributes']['class'][] = Html::getClass('form-' . $element['#button_type']);

  // This line break adds inherent margin between multiple buttons.
  return '<input' . new Attribute($element['#attributes']) . '>' . '' . "</input>\n";
}

/**
 * Implements theme_textfield().
 */
function semanticui_textfield($variables) {
  $element = $variables['element'];
  $element['#attributes']['type'] = 'text';
  Element::setAttributes($element, array(
    'id',
    'name',
    'value',
    'size',
    'maxlength',
      )
  );
  Element::setAttributes($element, array('class' => 'form-text'));
  $extra = '';
  if ($element['#autocomplete_path'] && drupal_valid_path($element['#autocomplete_path'])) {
    //TODO: drupal_add_library('system', 'drupal.autocomplete');
    $element['#attributes']['class'][] = 'form-autocomplete';

    $attributes = array();
    $attributes['type'] = 'hidden';
    $attributes['id'] = $element['#attributes']['id'] . '-autocomplete';
    $attributes['value'] = url($element['#autocomplete_path'], array('absolute' => TRUE));
    $attributes['disabled'] = 'disabled';
    $attributes['class'][] = 'autocomplete';
    $extra = '<input' . new Attribute($attributes) . ' />';
  }
  $output = '<input' . new Attribute($element['#attributes']) . ' />';

  return $output . $extra;
}

/**
 * Implements theme_password().
 */
function semanticui_password($variables) {
  $element = $variables['element'];
  $element['#attributes']['type'] = 'password';
  Element::setAttributes($element, array('id', 'name', 'size', 'maxlength'));
  Element::setAttributes($element, array('class' => 'form-text'));
  return '<input' . new Attribute($element['#attributes']) . ' />';
}

/**
 * Implements theme_textarea().
 */
function semanticui_textarea($variables) {
  $element = $variables['element'];
  Element::setAttributes($element, array('id', 'name', 'cols', 'rows'));
  Element::setAttributes($element, array('class' => 'form-textarea'));

  $wrapper_attributes = array(
    'class' => array('form-textarea-wrapper'),
  );

  // Add resizable behavior.
  if (!empty($element['#resizable'])) {
    //drupal_add_library('system', 'drupal.textarea');
    $wrapper_attributes['class'][] = 'resizable';
  }
  $output = '<div' . new Attribute($wrapper_attributes) . '>';
  $output .= '<textarea' . new Attribute($element['#attributes']) . '>' . SafeMarkup::checkPlain($element['#value']) . '</textarea>';
  $output .= '</div>';
  return $output;
}

/**
 * Implements theme_form_element_label().
 */
function semanticui_form_element_label(&$variables) {
  $element = $variables['element'];

  // Determine if certain things should skip for checkbox or radio elements.
  $skip = (isset($element['#type']) && ('checkbox' === $element['#type'] || 'radio' === $element['#type']));

  // If title and required marker are both empty, output no label.
  if ((!isset($element['#title']) || $element['#title'] === '' && !$skip) && empty($element['#required'])) {
    return '';
  }

  // Function SafeMarkup::checkPlain() was replaced by filter_xss_admin() because
  // some titles can use image tags, e.g. for country
  // icons (as it does countryicons module).
  $title = Xss::filterAdmin($element['#title']);

  $attributes = array();

  // Style the label as class option to display inline with the element.
  if ($element['#title_display'] == 'after' && !$skip) {
    $attributes['class'][] = $element['#type'];
  }
  // Show label only to screen readers to avoid disruption in visual flows.
  elseif ($element['#title_display'] == 'invisible') {
    $attributes['class'][] = 'element-invisible';
  }

  if (!empty($element['#id'])) {
    $attributes['for'] = $element['#id'];
  }

  // Insert radio and checkboxes inside label elements.
  $output = '';
  if (isset($variables['#children'])) {
    $output .= $variables['#children'];
  }

  // Append label.
  $output .= t('!title', array('!title' => $title));

  // The leading whitespace helps visually separate fields from inline labels.
  // There is no required asterisk as it is appended automatically
  // by Semantic UI framework.
  return ' <label' . new Attribute($attributes) . '>' . $output . "</label>\n";
}

/**
 * Implements theme_file_managed_file().
 */
function semanticui_file_managed_file($variables) {
  $element = $variables['element'];

  $attributes = array();
  if (isset($element['#id'])) {
    $attributes['id'] = $element['#id'];
  }
  if (!empty($element['#attributes']['class'])) {
    $attributes['class'] = (array) $element['#attributes']['class'];
  }
  $attributes['class'][] = 'form-managed-file';
  $attributes['class'][] = 'ui';
  $attributes['class'][] = 'icon';
  $attributes['class'][] = 'input';

  $element['upload_button']['#prefix'] = '<span class="ui icon button element-invisible">';
  $element['upload_button']['#suffix'] = '</span>';
  $element['remove_button']['#prefix'] = '<span class="ui icon button element-invisible">';
  $element['remove_button']['#suffix'] = '</span>';

  if (!empty($element['filename'])) {
    $element['filename']['#prefix'] = '<div class="ui icon input">';
    $element['filename']['#suffix'] = '</div>';
  }

  $hidden_elements = array();
  foreach (element_children($element) as $child) {
    if ($element[$child]['#type'] === 'hidden') {
      $hidden_elements[$child] = $element[$child];
      unset($element[$child]);
    }
  }

  // This wrapper is required to apply JS behaviors and CSS styling.
  $output = '';
  $output .= '<div' . new Attribute($attributes) . '>';
  $output .= drupal_render_children($element);
  $output .= $variables['element']['#children'];
  $output .= '<button type="submit" class="ui icon button">';
  $output .= '<i class="upload icon"></i>';
  $output .= '</button>';
  $output .= '</div>';
  $output .= render($hidden_elements);
  return $output;
}

/**
 * Implements theme_fieldset().
 */
function semanticui_fieldset($variables) {
  $element = $variables['element'];
  Element::setAttributes($element, array('id'));
  Element::setAttributes($element, array('class' => 'form-wrapper'));

  $output = '<fieldset' . new Attribute($element['#attributes']) . '>';
  if (!empty($element['#title'])) {
    if (!empty($element['#collapsed'])) {
      $caret_icon = '<i class="caret right icon"></i>';
    }
    else {
      $caret_icon = '<i class="caret down icon"></i>';
    }
    // Always wrap fieldset legends in a SPAN for CSS positioning.
    $output .= '<legend><span class="fieldset-legend">' . $caret_icon . $element['#title'] . '</span></legend>';
  }
  $output .= '<div class="fieldset-wrapper">';
  if (!empty($element['#description'])) {
    $output .= '<div class="fieldset-description">' . $element['#description'] . '</div>';
  }
  $output .= $element['#children'];
  if (isset($element['#value'])) {
    $output .= $element['#value'];
  }
  $output .= '</div>';
  $output .= "</fieldset>\n";
  return $output;
}

/**
 * Implements theme_labeled_button().
 */
function semanticui_labeled_button(&$variables) {
  $element = $variables['element'];
  $element['#attributes']['type'] = 'submit';
  Element::setAttributes($element, array('id', 'name', 'value'));

  $element['#attributes']['class'][] = 'form-' . $element['#button_type'];
  if (!empty($element['#attributes']['disabled'])) {
    $element['#attributes']['class'][] = 'form-button-disabled';
  }

  $output = '<button' . new Attribute($element['#attributes']) . '>';
  $output .= drupal_render($element['#label']);
  $output .= '</button>';
  return $output;
}

/**
 * Updates radio elements in the radios group to not output inline error.
 *
 * Sets the flag to not output inline error message to each radio element in the
 * group as there is an error to the whole group.
 */
function semanticui_form_process_radios($element) {
  // Check that the theme uses inline errors.
  $show_inline_errors = theme_get_setting('semanticui_error_popups') == 1;

  if (count($element['#options']) > 0 && $show_inline_errors) {
    foreach ($element['#options'] as $key => $choice) {
      // Set the flag to skip inline error message. The flag is used in the
      // semanticui_form_element().
      $element[$key]['#semanticui_skip_error_message'] = TRUE;
    }
  }

  return $element;
}

function drupal_array_merge_deep_array($arrays) {
  $result = array();

  foreach ($arrays as $array) {
    foreach ($array as $key => $value) {
      // Renumber integer keys as array_merge_recursive() does. Note that PHP
      // automatically converts array keys that are integer strings (e.g., '1')
      // to integers.
      if (is_integer($key)) {
        $result[] = $value;
      }
      // Recurse when both values are arrays.
      elseif (isset($result[$key]) && is_array($result[$key]) && is_array($value)) {
        $result[$key] = drupal_array_merge_deep_array(array($result[$key], $value));
      }
      // Otherwise, use the latter value, overriding any previous value.
      else {
        $result[$key] = $value;
      }
    }
  }

  return $result;
}

function drupal_array_merge_deep() {
  $args = func_get_args();
  return drupal_array_merge_deep_array($args);
}
