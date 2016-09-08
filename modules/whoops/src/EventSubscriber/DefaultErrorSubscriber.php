<?php

namespace Drupal\whoops\EventSubscriber;

use Symfony\Component\EventDispatcher\Event;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\KernelEvents;
use Whoops\Handler\PrettyPageHandler;
use Whoops\Run as Whoops;

/**
 * Default handling for errors.
 *
 * This handler will catch any php fatal errors or exceptions not caught
 * elsewhere and report them as whoops error page.
 */
class DefaultErrorSubscriber implements EventSubscriberInterface {

  /**
   * Registers whoops as error handler.
   *
   * Every php fatal error or uncaught exception is handled by the whoops
   * instance registered in this class.
   *
   * @param \Symfony\Component\EventDispatcher\Event $event
   *   The event to process.
   */
  public function registerWhoops(Event $event = NULL) {
    $whoops = new Whoops();
    $whoops->pushHandler(new PrettyPageHandler());
    // Do not convert php non-fatal errors in exceptions in all the code base.
    $whoops->silenceErrorsInPaths('/(.*)/', E_STRICT | E_DEPRECATED | E_NOTICE | E_WARNING);
    $whoops->register();

    // All php non-fatal errors are silenced by whoops but is desiderable to
    // show error messages to the developer respecting the Drupal's error_level
    // configuration; To achieve this purpose the default error handler is
    // restored. All php fatal errors are handled and caught by whoops in a
    // shutdown function.
    // @see \Whoops\Run\handleShutdown()
    restore_error_handler();
  }

  /**
   * {@inheritdoc}
   */
  public static function getSubscribedEvents() {
    $events[KernelEvents::REQUEST][] = ['registerWhoops', 2048];
    return $events;
  }

}
