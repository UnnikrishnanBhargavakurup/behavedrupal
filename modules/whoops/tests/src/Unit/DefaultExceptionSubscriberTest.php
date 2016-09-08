<?php

namespace Drupal\Tests\whoops\Unit;

use Drupal\Tests\UnitTestCase;
use Drupal\whoops\EventSubscriber\DefaultExceptionSubscriber;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\GetResponseForExceptionEvent;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\HttpKernelInterface;

/**
 * @coversDefaultClass \Drupal\whoops\EventSubscriber\DefaultExceptionSubscriber
 * @group whoops
 */
class DefaultExceptionSubscriberTest extends UnitTestCase {

  /**
   * The mocked HTTP kernel.
   *
   * @var \Symfony\Component\HttpKernel\HttpKernelInterface
   */
  protected $kernel;

  /**
   * {@inheritdoc}
   */
  public function setUp() {
    parent::setUp();

    $this->kernel = $this->prophesize(HttpKernelInterface::class)->reveal();
  }

  /**
   * @covers ::onException
   */
  public function testOnException() {
    $request = Request::create('/whoops');
    $exception = new \RuntimeException('Houston, we have a problem');
    $event = new GetResponseForExceptionEvent($this->kernel, $request, 'GET', $exception);

    $subscriber = new DefaultExceptionSubscriber();
    $subscriber->onException($event);

    $response = $event->getResponse();

    $this->assertTrue($event->isPropagationStopped());
    $this->assertInstanceOf(Response::class, $response);
    $this->assertEquals(500, $response->getStatusCode());
    $this->assertContains('Whoops! There was an error.', $response->getContent());
    $this->assertContains('Houston, we have a problem', $response->getContent());
  }

  /**
   * @covers ::onException
   */
  public function testOnExceptionWithUnknownFormat() {
    $request = Request::create('/test?_format=unknown');
    $exception = new \Exception('Houston, we have a problem');
    $event = new GetResponseForExceptionEvent($this->kernel, $request, 'GET', $exception);

    $subscriber = new DefaultExceptionSubscriber();
    $subscriber->onException($event);

    $response = $event->getResponse();

    $this->assertTrue($event->isPropagationStopped());
    $this->assertInstanceOf(Response::class, $response);
    $this->assertEquals(500, $response->getStatusCode());
    $this->assertContains('Whoops! There was an error.', $response->getContent());
    $this->assertContains('Houston, we have a problem', $response->getContent());
  }

  /**
   * @covers ::onException
   */
  public function testOnExceptionWithHttpException() {
    $request = Request::create('/http-exception');
    $headers = [
      'Cache-Control' => 'no-cache, private',
      'Content-Type' => 'text/plain',
      'X-Custom' => 'test',
    ];
    $exception = new HttpException(406, 'Houston, we have a problem', NULL, $headers);
    $event = new GetResponseForExceptionEvent($this->kernel, $request, 'GET', $exception);

    $subscriber = new DefaultExceptionSubscriber();
    $subscriber->onException($event);

    $response = $event->getResponse();

    $this->assertTrue($event->isPropagationStopped());
    $this->assertInstanceOf(Response::class, $response);
    // Ensures that the status code of the http exception is preserved.
    $this->assertEquals(406, $response->getStatusCode());
    // Ensures that the headers of the http exception are preserved.
    $this->assertEquals($headers['Cache-Control'], $response->headers->get('Cache-Control'));
    $this->assertEquals($headers['Content-Type'], $response->headers->get('Content-Type'));
    $this->assertEquals($headers['X-Custom'], $response->headers->get('X-Custom'));
    $this->assertContains('Whoops! There was an error.', $response->getContent());
    $this->assertContains('Houston, we have a problem', $response->getContent());
  }

}
