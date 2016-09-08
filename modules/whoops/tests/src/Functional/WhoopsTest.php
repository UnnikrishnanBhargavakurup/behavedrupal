<?php

namespace Drupal\Tests\whoops\Functional;

use Drupal\Core\Url;
use Drupal\Tests\BrowserTestBase;

/**
 * Tests whoops error and exception handling.
 *
 * @group whoops
 */
class WhoopsTest extends BrowserTestBase {

  /**
   * Modules to install.
   *
   * @var array
   */
  public static $modules = ['whoops', 'whoops_test'];

  /**
   * Tests whoops error and exception handling.
   */
  public function testWhoops() {
    // Ensures that the site works properly with whoops module enabled.
    $this->drupalGet(Url::fromRoute('<front>'));
    $this->assertSession()->statusCodeEquals(200);

    // Ensures that "well-known" HttpExceptions (e.g. NotFoundHttpException)
    // are handled by exception subscribers registered before the whoops
    // exception subscriber and whoops not interferes with them.
    // @see \Drupal\Core\EventSubscriber\DefaultExceptionHtmlSubscriber
    $this->drupalGet('admin');
    $this->assertSession()->statusCodeEquals(403);
    $this->assertNoWhoopsErrorPage();

    // Ensures that "well-known" HttpExceptions (e.g. AccessDeniedHttpException)
    // are handled by exception subscribers registered before the whoops
    // exception subscriber and whoops not interferes with them.
    // @see \Drupal\Core\EventSubscriber\DefaultExceptionHtmlSubscriber
    $this->drupalGet('not-exist');
    $this->assertSession()->statusCodeEquals(404);
    $this->assertNoWhoopsErrorPage();

    // Ensures that fatal php error are caught by whoops error handler (even if
    // the format is specified) and reported as whoops error page.
    $this->drupalGet('whoops/fatal-error');
    $this->assertSession()->statusCodeEquals(500);
    $this->assertWhoopsErrorPage('Call to undefined function Drupal\whoops_test\Controller\undefined()');

    $this->drupalGet('whoops/fatal-error', ['query' => ['_format' => 'json']]);
    $this->assertSession()->statusCodeEquals(500);
    $this->assertWhoopsErrorPage('Call to undefined function Drupal\whoops_test\Controller\undefined()');

    // Ensures that HttpExceptions not handled by exception subscribers
    // registered before the whoops exception subscriber (e.g when the format
    // is unknown) are caught and reported as whoops error page and the http
    // status code is preserved.
    $this->drupalGet('not-exist', ['query' => ['_format' => 'mhe']]);
    $this->assertSession()->statusCodeEquals(404);
    $this->assertWhoopsErrorPage('No route found for "GET /not-exist"');

    $this->drupalGet('whoops/http-exception');
    $this->assertSession()->statusCodeEquals(418);
    $this->assertWhoopsErrorPage('I\'m a teapot');

    // Ensures that Exceptions are properly handled by the whoops exception
    // subscriber.
    $this->drupalGet('whoops/exception');
    $this->assertSession()->statusCodeEquals(500);
    $this->assertWhoopsErrorPage('Tests exception handling');

    // Ensures that non-fatal php error are not caught by whoops error handler
    // and the core error handler is used.
    $this->setExpectedException('\Exception', 'Notice: Undefined variable: undefined');
    $this->drupalGet('whoops/error');
    $this->assertSession()->statusCodeEquals(200);
    $this->assertNoWhoopsErrorPage();
    $this->assertSession()->pageTextContains('Notice: Undefined variable: undefined in Drupal\whoops_test\Controller\WhoopsTestController->error()');
  }

  /**
   * Tests whoops json exception handling.
   *
   * Note: php fatal error are not handled by the json exception subscriber
   * and are instead handled by the default exception subscriber.
   */
  public function testWhoopsJson() {
    $options = ['query' => ['_format' => 'json']];

    // Ensures that fatal php error are not handled json exception subscriber
    // and are instead handled by the default exception subscriber.
    $this->drupalGet('whoops/fatal-error', $options);
    $this->assertSession()->statusCodeEquals(500);
    $this->assertWhoopsErrorPage('Call to undefined function Drupal\whoops_test\Controller\undefined()');

    // Ensures that HttpExceptions not handled by exception subscribers
    // registered before the whoops exception subscriber (e.g when the http
    // status code is not handled) are caught and the http status code is
    // preserved.
    $this->drupalGet('whoops/http-exception', $options);
    $this->assertSession()->statusCodeEquals(418);
    $json = $this->getSession()->getPage()->getContent();
    $this->assertJson($json);
    $content = json_decode($json, TRUE);
    $this->assertNotEmpty($content['error']);
    $this->assertEquals('Symfony\\Component\\HttpKernel\\Exception\\HttpException', $content['error']['type']);
    $this->assertEquals('I\'m a teapot', $content['error']['message']);
    $this->assertNotEmpty($content['error']['trace']);

    // Ensures that Exceptions are properly handled by the whoops exception
    // subscriber.
    $this->drupalGet('whoops/exception', $options);
    $this->assertSession()->statusCodeEquals(500);
    $json = $this->getSession()->getPage()->getContent();
    $this->assertJson($json);
    $content = json_decode($json, TRUE);
    $this->assertNotEmpty($content['error']);
    $this->assertEquals('RuntimeException', $content['error']['type']);
    $this->assertEquals('Tests exception handling', $content['error']['message']);
    $this->assertNotEmpty($content['error']['trace']);

    // Ensures that Exceptions are properly handled by the whoops exception
    // subscriber when hal_json format is specified.
    $this->drupalGet('whoops/exception', ['query' => ['_format' => 'hal_json']]);
    $this->assertSession()->statusCodeEquals(500);
    $json = $this->getSession()->getPage()->getContent();
    $this->assertJson($json);
    $content = json_decode($json, TRUE);
    $this->assertNotEmpty($content['error']);
    $this->assertEquals('RuntimeException', $content['error']['type']);
    $this->assertEquals('Tests exception handling', $content['error']['message']);
    $this->assertNotEmpty($content['error']['trace']);
  }

  /**
   * Tests that the status page shows a warning when whoops is enabled.
   */
  public function testStatusPage() {
    $admin_user = $this->drupalCreateUser(['administer site configuration']);
    $this->drupalLogin($admin_user);

    $this->drupalGet('admin/reports/status');
    $this->assertSession()->statusCodeEquals(200, 'The status page is reachable.');

    $this->assertSession()->pageTextContains(t('Whoops module enabled'));
    $this->assertSession()->pageTextContains(t('The module registers an error handler which provide debug information, therefore it is not suitable for a production environment'));
  }

  /**
   * Tests whether the current page is a whoops error page.
   *
   * @param string $message
   *   The exception message to check.
   */
  protected function assertWhoopsErrorPage($message) {
    $this->assertSession()->titleEquals('Whoops! There was an error.');
    $this->assertSession()->pageTextContains($message);
    $this->assertNotEmpty($this->cssSelect('.Whoops .stack-container'));
    $this->assertNotEmpty($this->cssSelect('.Whoops .frames-container'));
    $this->assertNotEmpty($this->cssSelect('.Whoops .details-container'));
  }

  /**
   * Tests whether the current page is not a whoops error page.
   */
  protected function assertNoWhoopsErrorPage() {
    $this->assertSession()->pageTextNotContains('Whoops! There was an error.');
    $this->assertEmpty($this->cssSelect('.Whoops .stack-container'));
    $this->assertEmpty($this->cssSelect('.Whoops .frames-container'));
    $this->assertEmpty($this->cssSelect('.Whoops .details-container'));
  }

}
