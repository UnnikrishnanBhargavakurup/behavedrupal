<?php

/**
 * @file
 * Contains \Drupal\behaviour_builder\Controller\BehaviourBuilderController.
 */

namespace Drupal\behaviour_builder\Controller;

use Drupal\Core\Controller\ControllerBase;

class BehaviourBuilderController extends ControllerBase {
  
  public function home() {
    return array(
        '#theme' => 'home',
        '#test_var' => $this->t('Test Value'),
    );
  }
  
  /**
   * valiables for the IDE.
   */
  public function ide() {
    return array(
        '#theme' => 'home',
        '#test_var' => $this->t('Test Value'),
    );
  }
}