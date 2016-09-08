<?php

namespace Drupal\Tests\whoops\Unit;

use Drupal\Tests\UnitTestCase;
use Drupal\whoops\EventSubscriber\JsonExceptionSubscriber;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\GetResponseForExceptionEvent;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\HttpKernelInterface;

/**
 * @coversDefaultClass \Drupal\whoops\EventSubscriber\JsonExceptionSubscriber
 * @group whoops
 */
class JsonExceptionSubscriberTest extends UnitTestCase {

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
  public function testOnExceptionWithJsonFormat() {
    $request = Request::create('/whoops?_format=json');
    $exception = new \RuntimeException('Houston, we have a problem');
    $event = new GetResponseForExceptionEvent($this->kernel, $request, 'GET', $exception);

    $subscriber = new JsonExceptionSubscriber();
    $subscriber->onException($event);

    $response = $event->getResponse();

    $this->assertTrue($event->isPropagationStopped());
    $this->assertInstanceOf(Response::class, $response);
    $this->assertEquals(500, $response->getStatusCode());
    $this->assertEquals('application/json', $response->headers->get('Content-Type'));
    $this->assertJson($response->getContent());

    $content = json_decode($response->getContent(), TRUE);
    $this->assertNotEmpty($content['error']);
    $this->assertEquals('RuntimeException', $content['error']['type']);
    $this->assertEquals('Houston, we have a problem', $content['error']['message']);
    $this->assertNotEmpty($content['error']['trace']);
  }

  /**
   * @covers ::onException
   */
  public function testOnExceptionWithHalJsonFormat() {
    $request = Request::create('/whoops?_format=hal_json');
    $exception = new \RuntimeException('Houston, we have a problem');
    $event = new GetResponseForExceptionEvent($this->kernel, $request, 'GET', $exception);

    $subscriber = new JsonExceptionSubscriber();
    $subscriber->onException($event);

    $response = $event->getResponse();

    $this->assertTrue($event->isPropagationStopped());
    $this->assertInstanceOf(Response::class, $response);
    $this->assertEquals(500, $response->getStatusCode());
    $this->assertEquals('application/json', $response->headers->get('Content-Type'));
    $this->assertJson($response->getContent());

    $content = json_decode($response->getContent(), TRUE);
    $this->assertNotEmpty($content['error']);
    $this->assertEquals('RuntimeException', $content['error']['type']);
    $this->assertEquals('Houston, we have a problem', $content['error']['message']);
    $this->assertNotEmpty($content['error']['trace']);
  }

  /**
   * @covers ::onException
   */
  public function testOnExceptionWithNotApplicableFormat() {
    $request = Request::create('/test?_format=html');
    $exception = new \Exception('Houston, we have a problem');
    $event = new GetResponseForExceptionEvent($this->kernel, $request, 'GET', $exception);

    $subscriber = new JsonExceptionSubscriber();
    $subscriber->onException($event);

    $this->assertFalse($event->isPropagationStopped());
  }

  /**
   * @covers ::onException
   */
  public function testOnExceptionWithAcceptJson() {
    $request = Request::create('/test');
    $request->headers->set('Accept', 'application/json');
    $exception = new \Exception('Houston, we have a problem');
    $event = new GetResponseForExceptionEvent($this->kernel, $request, 'GET', $exception);

    $subscriber = new JsonExceptionSubscriber();
    $subscriber->onException($event);

    $response = $event->getResponse();

    $this->assertTrue($event->isPropagationStopped());
    $this->assertInstanceOf(Response::class, $response);
    $this->assertEquals(500, $response->getStatusCode());
    $this->assertEquals('application/json', $response->headers->get('Content-Type'));
    $this->assertJson($response->getContent());

    $content = json_decode($response->getContent(), TRUE);
    $this->assertNotEmpty($content['error']);
    $this->assertEquals('Exception', $content['error']['type']);
    $this->assertEquals('Houston, we have a problem', $content['error']['message']);
    $this->assertNotEmpty($content['error']['trace']);
  }

  /**
   * @covers ::onException
   */
  public function testOnExceptionWithAcceptJsonAndHtml() {
    $request = Request::create('/test');
    $request->headers->set('Accept', 'application/json,text/html');
    $exception = new \Exception('Houston, we have a problem');
    $event = new GetResponseForExceptionEvent($this->kernel, $request, 'GET', $exception);

    $subscriber = new JsonExceptionSubscriber();
    $subscriber->onException($event);

    $response = $event->getResponse();

    $this->assertTrue($event->isPropagationStopped());
    $this->assertInstanceOf(Response::class, $response);
    $this->assertEquals(500, $response->getStatusCode());
    $this->assertEquals('application/json', $response->headers->get('Content-Type'));
    $this->assertJson($response->getContent());

    $content = json_decode($response->getContent(), TRUE);
    $this->assertNotEmpty($content['error']);
    $this->assertEquals('Exception', $content['error']['type']);
    $this->assertEquals('Houston, we have a problem', $content['error']['message']);
    $this->assertNotEmpty($content['error']['trace']);
  }

  /**
   * @covers ::onException
   */
  public function testOnExceptionWithHttpException() {
    $request = Request::create('/http-exception?_format=json');
    $headers = [
      'Cache-Control' => 'no-cache, private',
      'X-Custom' => 'test',
    ];
    $exception = new HttpException(406, 'Houston, we have a problem', NULL, $headers);
    $event = new GetResponseForExceptionEvent($this->kernel, $request, 'GET', $exception);

    $subscriber = new JsonExceptionSubscriber();
    $subscriber->onException($event);

    $response = $event->getResponse();

    $this->assertTrue($event->isPropagationStopped());
    $this->assertInstanceOf(Response::class, $response);
    // Ensures that the status code of the http exception is preserved.
    $this->assertEquals(406, $response->getStatusCode());
    // Ensures that the headers of the http exception are preserved.
    $this->assertEquals($headers['Cache-Control'], $response->headers->get('Cache-Control'));
    // Ensures that the content type 'application/json' is added if not present
    // in the response header.
    $this->assertEquals('application/json', $response->headers->get('Content-Type'));
    $this->assertEquals($headers['X-Custom'], $response->headers->get('X-Custom'));
    $this->assertJson($response->getContent());

    $content = json_decode($response->getContent(), TRUE);
    $this->assertNotEmpty($content['error']);
    $this->assertEquals('Symfony\\Component\\HttpKernel\\Exception\\HttpException', $content['error']['type']);
    $this->assertEquals('Houston, we have a problem', $content['error']['message']);
    $this->assertNotEmpty($content['error']['trace']);
  }

}
