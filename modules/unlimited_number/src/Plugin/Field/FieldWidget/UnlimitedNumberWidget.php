<?php

/**
 * @file
 * Contains \Drupal\unlimited_number\Plugin\Field\FieldWidget\UnlimitedNumberWidget.
 */

namespace Drupal\unlimited_number\Plugin\Field\FieldWidget;

use Drupal\Core\Field\Plugin\Field\FieldWidget\NumberWidget;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\unlimited_number\Element\UnlimitedNumber;

/**
 * Plugin implementation of the 'unlimited_number' widget.
 *
 * @FieldWidget(
 *   id = "unlimited_number",
 *   label = @Translation("Unlimited or Number"),
 *   field_types = {
 *     "integer",
 *   }
 * )
 */
class UnlimitedNumberWidget extends NumberWidget {

  /**
   * {@inheritdoc}
   */
  public static function defaultSettings() {
    return [
      'label_unlimited' => t('Unlimited'),
      'label_number' => t('Limited'),
    ] + parent::defaultSettings();
  }

  /**
   * {@inheritdoc}
   */
  public function settingsForm(array $form, FormStateInterface $form_state) {
    $element = parent::settingsForm($form, $form_state);

    $element['label_unlimited'] = [
      '#type' => 'textfield',
      '#title' => t('Unlimited Label'),
      '#default_value' => $this->getSetting('label_unlimited'),
      '#description' => t('Text that will be used for the unlimited radio.'),
    ];

    $element['label_number'] = [
      '#type' => 'textfield',
      '#title' => t('Number Label'),
      '#default_value' => $this->getSetting('label_number'),
      '#description' => t('Text that will be used for the number radio.'),
    ];

    return $element;
  }

  /**
   * {@inheritdoc}
   */
  public function formElement(FieldItemListInterface $items, $delta, array $element, array &$form, FormStateInterface $form_state) {
    $value = isset($items[$delta]->value) ? $items[$delta]->value : NULL;
    if (isset($value)) {
      $default_value = empty($value) ? UnlimitedNumber::UNLIMITED : $value;
    }
    else {
      $default_value = NULL;
    }

    $form_element['unlimited_number'] = $element + [
      '#type' => 'unlimited_number',
      '#default_value' => $default_value,
      '#min' => 1,
      '#options' => [
        'unlimited' => $this->getSetting('label_unlimited'),
        'limited' => $this->getSetting('label_limited'),
      ],
      '#parents' => [$items->getName(), $delta, 'unlimited_number'],
    ];

    return $form_element;
  }

  /**
   * {@inheritdoc}
   */
  public function massageFormValues(array $values, array $form, FormStateInterface $form_state) {
    $new_values = [];
    foreach ($values as $value) {
      $number = $value['unlimited_number'];
      if ($value['unlimited_number'] == UnlimitedNumber::UNLIMITED) {
        $number = 0;
      }
      $new_values[]['value'] = $number;
    }
    return $new_values;
  }

}
