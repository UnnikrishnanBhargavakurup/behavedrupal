<?php

namespace Drupal\whoops\EventSubscriber;

use Whoops\Handler\JsonResponseHandler;

/**
 * Default handling for JSON and Hal-JSON exceptions.
 */
class JsonExceptionSubscriber extends ExceptionSubscriberBase {

  /**
   * {@inheritdoc}
   */
  protected function getHandledFormats() {
    return ['json', 'hal_json'];
  }

  /**
   * {@inheritdoc}
   */
  protected function getHandler() {
    $handler = new JsonResponseHandler();
    $handler->addTraceToOutput(TRUE);
    return $handler;
  }

  /**
   * {@inheritdoc}
   */
  protected function exceptionToResponse(\Exception $exception) {
    $response = parent::exceptionToResponse($exception);
    if (!$response->headers->has('Content-Type') || 'text/javascript' === $response->headers->get('Content-Type')) {
      $response->headers->set('Content-Type', 'application/json');
    }
    return $response;
  }

}
