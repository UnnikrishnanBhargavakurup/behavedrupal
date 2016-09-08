<?php

namespace Drupal\whoops\EventSubscriber;

use Drupal\Core\EventSubscriber\MainContentViewSubscriber;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\GetResponseForExceptionEvent;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\KernelEvents;
use Whoops\Run as Whoops;

/**
 * Base class for whoops exception subscribers.
 *
 * Any whoops subscriber should extend this class and:
 * - implement getHandledFormats() to indicate which request formats it will
 *   respond to.
 * - implement getHandler() to provide a whoops handler with whom handle the
 *   exception.
 * - optionally implement getPriority() to indicate the priority of the
 *   subscriber.
 *
 * Note: Core provides several exception listeners by default. The default
 * priority setted in this class (-248) allows the subscriber to run later in
 * the request but before the default whoops exception subscriber and core
 * exception subscriber. If a custom priority is set, be aware of the following
 * registered listeners:
 *
 * - \Drupal\whoops\EventSubscriber\DefaultExceptionSubscriber: -250.
 *   The default whoops subscriber. A listener with a lower priority will never
 *   get called.
 * - \Drupal\Core\EventSubscriber\DefaultExceptionSubscriber: -256.
 *   The subscriber of last resort, this will provide generic handling for any
 *   exception. A listener with a lower priority will never get called.
 *
 * @see \Drupal\whoops\EventSubscriber\DefaultExceptionSubscriber
 * @see \Drupal\Core\EventSubscriber\DefaultExceptionSubscriber
 */
abstract class ExceptionSubscriberBase implements EventSubscriberInterface {

  /**
   * Specifies the request formats this subscriber will respond to.
   *
   * @return array
   *   An indexed array of the format machine names that this subscriber will
   *   attempt to process, such as "html" or "json". Returning an empty array
   *   will apply to all formats.
   *
   * @see \Symfony\Component\HttpFoundation\Request
   */
  abstract protected function getHandledFormats();

  /**
   * Specifies the priority of this subscriber.
   *
   * The default priority is 248, which is very low but allow the subscriber
   * to run before the default whoops exception subscriber and the core default
   * exception subscriber. To have listeners that have a "first attempt" at
   * handling exceptions return a higher priority.
   *
   * @return int
   *   The event priority of this subscriber.
   */
  protected static function getPriority() {
    return -248;
  }

  /**
   * Gets the whoops handler dedicated to handle the exception in this
   * subscriber.
   *
   * @return \Whoops\Handler\HandlerInterface
   *   The exception handler.
   */
  abstract protected function getHandler();

  /**
   * Gets the error-relevant format from the request.
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   The request object.
   *
   * @return string
   *   The format as which to treat the exception.
   */
  protected function getFormat(Request $request) {
    $format = $request->query->get(MainContentViewSubscriber::WRAPPER_FORMAT, $request->getRequestFormat());

    // These are all JSON errors for our purposes.
    if (in_array($format, ['drupal_modal', 'drupal_dialog', 'drupal_ajax'])) {
      $format = 'json';
    }

    // Make an educated guess that any Accept header type that includes "json"
    // can probably handle a generic JSON response for errors.
    foreach ($request->getAcceptableContentTypes() as $mime) {
      if (strpos($mime, 'html') === FALSE && strpos($mime, 'json') !== FALSE) {
        $format = 'json';
      }
    }

    return $format;
  }

  /**
   * Determines whether the exception should be handled by this subscriber.
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   The request object.
   *
   * @return bool
   *   TRUE if the exception should be handled by this subscriber, FALSE
   *   otherwise.
   */
  protected function apply(Request $request) {
    $handled_formats = $this->getHandledFormats();
    $format = $this->getFormat($request);

    return empty($handled_formats) || in_array($format, $handled_formats);
  }

  /**
   * Handles exceptions for this subscriber.
   *
   * @param \Symfony\Component\HttpKernel\Event\GetResponseForExceptionEvent $event
   *   The event to process.
   */
  public function onException(GetResponseForExceptionEvent $event) {
    if ($this->apply($event->getRequest())) {
      $exception = $event->getException();
      $response = $this->exceptionToResponse($exception);
      $event->setResponse($response);
    }
  }

  /**
   * Gets the error response associated with the given exception.
   *
   * @param \Exception $exception
   *   The exception to be handled.
   *
   * @return \Symfony\Component\HttpFoundation\Response
   *   The error response associated with the given exception.
   */
  protected function exceptionToResponse(\Exception $exception) {
    $content = $this->whoops()->handleException($exception);

    $response = new Response($content);
    if ($exception instanceof HttpExceptionInterface) {
      $response->setStatusCode($exception->getStatusCode());
      $response->headers->replace($exception->getHeaders());
    }
    else {
      $response->setStatusCode(Response::HTTP_INTERNAL_SERVER_ERROR, '500 Service unavailable (with message)');
    }

    return $response;
  }

  /**
   * Gets a configured whoops instance for this subscriber.
   *
   * @return \Whoops\Run
   *   The preconfigured whoops instance.
   */
  protected function whoops() {
    $whoops = new Whoops();
    $whoops->sendHttpCode(FALSE);
    $whoops->allowQuit(FALSE);
    $whoops->writeToOutput(FALSE);
    $whoops->pushHandler($this->getHandler());

    return $whoops;
  }

  /**
   * {@inheritdoc}
   */
  public static function getSubscribedEvents() {
    $events[KernelEvents::EXCEPTION][] = ['onException', static::getPriority()];
    return $events;
  }

}
