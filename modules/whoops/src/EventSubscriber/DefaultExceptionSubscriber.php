<?php

namespace Drupal\whoops\EventSubscriber;

use Whoops\Handler\PrettyPageHandler;

/**
 * Default handling for exceptions.
 *
 * This handler will catch any exceptions not caught elsewhere and report
 * them as whoops error page.
 */
class DefaultExceptionSubscriber extends ExceptionSubscriberBase {

  /**
   * {@inheritdoc}
   */
  protected function getHandledFormats() {
    return [];
  }

  /**
   * {@inheritdoc}
   */
  protected static function getPriority() {
    // Run after all whoops exception subscribers and handle exceptions not
    // caught.
    return -250;
  }

  /**
   * {@inheritdoc}
   */
  protected function getHandler() {
    $handler = new PrettyPageHandler();
    $handler->handleunconditionally(TRUE);
    return $handler;
  }

}
