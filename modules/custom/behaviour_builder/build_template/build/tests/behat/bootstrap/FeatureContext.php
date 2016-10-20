<?php

use Behat\Behat\Tester\Exception\PendingException;
use Behat\Behat\Context\SnippetAcceptingContext;
use Behat\Behat\Definition\Call\Given;
use Behat\Gherkin\Node\PyStringNode;
use Behat\Gherkin\Node\TableNode;
use Drupal\DrupalExtension\Context\RawDrupalContext;
use Behat\Mink\Driver\Selenium2Driver;
use Behat\Behat\Hook\Scope\AfterStepScope;

use Behat\Behat\Hook\Scope\BeforeFeatureScope;
use Behat\Behat\Hook\Scope\AfterFeatureScope;

/**
 * Defines application features from the specific context.
 */
class FeatureContext extends RawDrupalContext implements SnippetAcceptingContext
{
  
  protected $screenshot_path;
  /**
   * Initializes context.
   *
   * Every scenario gets its own context instance.
   * You can also pass arbitrary arguments to the
   * context constructor through behat.yml.
   */
  public function __construct($parameters) {
    $this->screenshot_path = $parameters['screenshot_path'];
  }

  /**
   * Creates and authenticates a user with the given role via Drush.
   *
   * @Given /^I am logged in as a user named "(?P<username>[^"]*)" with the "(?P<role>[^"]*)" role that doesn't force password change$/
   */
  public function assertAuthenticatedByRole($username, $role) {

    $user = (object)array(
      'name' => $username,
      'pass' => $this->getRandom()->name(16),
      'role' => $role,
      'roles' => array($role),
    );
    $user->mail = "{$user->name}@example.com";
    // Create a new user.
    $this->userCreate($user);

    // Find the user
    $account = user_load_by_name($user->name);

    // Remove the "Force password change on next login" record.
    db_delete('password_policy_force_change')
      ->condition('uid', $account->uid)
      ->execute();
    db_delete('password_policy_expiration')
      ->condition('uid', $account->uid)
      ->execute();

    $this->login();

  }

  /**
   * @Then /^I logout$/
   */
  public function assertLogout() {
    $this->logout();
  }

  /**
   * @Given /^a user named "(?P<username>[^"]*)" with role "(?P<role>[^"]*)" exists$/
   */
  public function assertAccountCreated($username, $role) {
    if (!user_load_by_name($username)) {
      $user = (object)array(
        'name' => $username,
        'pass' => $this->getRandom()->name(16),
        'role' => $role,
        'roles' => array($role),
      );
      $user->mail = "{$user->name}@example.com";
      // Create a new user.
      $this->userCreate($user);
    }
  }

  /**
   * @Given /^I visit the user edit page for "(?P<username>[^"]*)"$/
   */
  public function iVisitTheUserEditPageFor($username) {
    $account = user_load_by_name($username);
    if (!empty($account->uid)) {
      $this->getSession()->visit($this->locatePath('/user/' . $account->uid . '/edit'));
    } else {
      throw new \Exception('No such user');
    }
  }

  /**
   * @Then /^I should be able to change the "(?P<role_name>[^"]*)" role$/
   */
  public function iShouldBeAbleToChangeTheRole($role_name) {
    $administrator_role = user_role_load_by_name($role_name);
    $this->assertSession()->elementExists('css', '#edit-roles-change-' . $administrator_role->rid);
  }

  /**
   * @Then /^I should not be able to change the "(?P<role_name>[^"]*)" role$/
   */
  public function iShouldNotBeAbleToChangeTheRole($role_name) {
    $administrator_role = user_role_load_by_name($role_name);
    $this->assertSession()->elementNotExists('css', '#edit-roles-change-' . $administrator_role->rid);
  }

  /**
   * @Then the :arg1 select list should be set to :arg2;
   */
  public function theSelectListShouldBeSetTo($arg1, $arg2) {
    try {
      $select = $this->getSession()->getPage()->find('css', '#' . $arg1);
    } catch (Exception $e) {
      throw new \Exception(sprintf("No select list with id '%s' found on the page '%s'.", $arg1, $this->getSession()->getCurrentUrl()));
    }
    if ($select->getValue() != $arg2) {
      throw new \Exception(sprintf("Select list with id '%s' was found but not set to value '%s'.", $arg1, $arg2));
    }
  }

  /**
   * Sets an id for the first iframe situated in the element specified by id.
   * Needed when wanting to fill in WYSIWYG editor situated in an iframe without identifier.
   *
   * @Given /^the iframe in element "(?P<element>[^"]*)" has id "(?P<id>[^"]*)"$/
   */
  public function theIframeInElementHasId($element_id, $iframe_id) {
    $function = <<<JS
(function(){
  var elem = document.getElementById("$element_id");
  var iframes = elem.getElementsByTagName('iframe');
  var f = iframes[0];
  f.id = "$iframe_id";
})()
JS;
    try {
      $this->getSession()->executeScript($function);
    }
    catch(Exception $e) {
      throw new \Exception(sprintf('No iframe found in the element "%s" on the page "%s".', $element_id, $this->getSession()->getCurrentUrl()));
    }
  }

  /**
   * Fills in WYSIWYG editor with specified id.
   *
   * @Given /^(?:|I )fill in "(?P<text>[^"]*)" in WYSIWYG editor "(?P<iframe>[^"]*)"$/
   */
  public function iFillInInWYSIWYGEditor($text, $iframe) {
    try {
      $this->getSession()->switchToIFrame($iframe);
    }
    catch (Exception $e) {
      throw new \Exception(sprintf("No iframe with id '%s' found on the page '%s'.", $iframe, $this->getSession()->getCurrentUrl()));
    }
    $this->getSession()->executeScript("document.body.innerHTML = '<p>" . $text . "</p>'");
    $this->getSession()->switchToIFrame();
  }

  /**
   * @Given /^I should be able to block the user$/
   */
  public function iShouldBeAbleToBlockTheUser() {
    $this->assertSession()->elementExists('css', 'input[name=status]');
  }

  /**
   * @Given /^I should not be able to block the user$/
   */
  public function iShouldNotBeAbleToBlockTheUser() {
    $this->assertSession()->elementNotExists('css', 'input[name=status]');
  }


  /**
   * @Given /^I visit the user cancel page for "(?P<username>[^"]*)"$/
   */
  public function iShouldNotBeAbleToCancelTheAccount($username) {
    $account = user_load_by_name($username);
    return new Given('I visit "/user/' + $account->uid + '/cancel"', function () {
    });
  }

  /**
   * @Then /^I should be able to cancel the account "(?P<username>[^"]*)"$/
   */
  public function iShouldBeAbleToCancelTheAccount($username) {
    $this->selectUserVBOCheckbox($username);
    $this->getSession()->getPage()->fillField('operation', 'action::views_bulk_operations_user_cancel_action');
    $this->getSession()->getPage()->pressButton('edit-submit--2');
    $this->assertSession()->elementExists('css', 'input[value=Next][type=submit]');
    return new Given('I should not see "is protected from cancellation, and was not cancelled."');
  }

  /**
   * @When I wait for :text to appear
   * @Then I should see :text appear
   * @param $text
   * @throws \Exception
   */
  public function iWaitForTextToAppear($text)
  {
    $this->spin(function(FeatureContext $context) use ($text) {
      try {
        $this->getSession()->getPage()->find('xpath', "//*[contains(text(), '". $text ."')]");
        //  $context->assertPageContainsText($text);
        return true;
      }
      catch(ResponseTextException $e) {
          // NOOP
      }
      return false;
    });
  }

  /**
   * @Given I set browser window size to :width x :height
   */
  public function iSetBrowserWindowSizeToX($width, $height) {
    return $this->getSession()->resizeWindow((int)$width, (int)$height, 'current');
  }

  /**
   * @When I query element with :cssselector and click
   */
  public function iQueryElementWithCSS($cssselector) {
    return $this->getSession()->getPage()->find('css', $cssselector)->click();
  }

  /**
   * Click on the element with the provided xpath query
   *
   * @When /^I click on the element with xpath "([^"]*)"$/
   */
  public function iClickOnTheElementWithXPath($xpath) {
      $session = $this->getSession(); // get the mink session
      $element = $session->getPage()->find(
        'xpath',
         $session->getSelectorsHandler()->selectorToXpath('xpath', $xpath)
      ); // runs the actual query and returns the element

      // errors must not pass silently
      if (null === $element) {
        throw new \InvalidArgumentException(sprintf('Could not evaluate XPath: "%s"', $xpath));
      }

      // ok, let's click on it
      $element->click();
  }

  /**
   * Click on the element with the provided CSS Selector
   *
   * @When /^I click on the element with css selector "([^"]*)"$/
   */
  public function iClickOnTheElementWithCSSSelector($cssSelector) {
    $session = $this->getSession();
    $element = $session->getPage()->find(
      'xpath',
      $session->getSelectorsHandler()->selectorToXpath('css', $cssSelector) // just changed xpath to css
    );
    if (null === $element) {
      throw new \InvalidArgumentException(sprintf('Could not evaluate CSS Selector: "%s"', $cssSelector));
    }
    $element->click();
  }

  /**
   * @When I execute js script :script 
   */
  public function iExecuteJSScript($script) {
    $this->getSession()->executeScript($script);
    return true;
  }

  /**
   * @When I wait for :text to disappear
   * @Then I should see :text disappear
   * @param $text
   * @throws \Exception
   */
  public function iWaitForTextToDisappear($text)
  {
    $this->spin(function(FeatureContext $context) use ($text) {
      try {
        return !$this->getSession()->getPage()->find('xpath', "//*[contains(text(), '". $text ."')]");
      }
      catch(ResponseTextException $e) {
        return true;
      }
      return false;
    });
  }

  /**
   * Based on Behat's own example
   * @see http://docs.behat.org/en/v2.5/cookbook/using_spin_functions.html#adding-a-timeout
   * @param $lambda
   * @param int $wait
   * @throws \Exception
   */
  public function spin($lambda, $wait = 60)
  {
    $time = time();
    $stopTime = $time + $wait;
    while (time() < $stopTime) {
      try {
        if ($lambda($this)) {
          return;
        }
      } 
      catch (\Exception $e) {
        // do nothing
      }
      usleep(250000);
    }

    throw new \Exception("Spin function timed out after {$wait} seconds");
  }

  /**
   * @AfterStep
   */
  public function takeScreenShotAfterFailedStep(afterStepScope $scope)
  {
    if (99 === $scope->getTestResult()->getResultCode()) {
      $driver = $this->getSession()->getDriver();
      if (!($driver instanceof Selenium2Driver)) {
        return;
      }
      $featureFolder = preg_replace('/\W/', '_', $scope->getFeature()->getTitle());
      $scenario = current($scope->getFeature()->getScenarios());
      $scenarioName = $scenario->getTitle();
      $fileName = preg_replace('/\W/', '_', $scenarioName) . '.png';
      $path = $this->screenshot_path .'/'. $featureFolder;
      //create screenshots directory if it doesn't exist
      if (!file_exists($path)) {
        mkdir($path, 0777, TRUE);
      }
      $this->getSession()->resizeWindow(1440, 900, 'current');
      file_put_contents($path .'/'. $fileName, $this->getSession()->getDriver()->getScreenshot());
    }
  }

  /**
   * @BeforeStep
   */
  public function beforeStep() 
  {
   $this->getSession()->getDriver()->maximizeWindow();
  }

  /**
   * Selects a user in the VBO list.
   *
   * @param string $username
   *
   * @throws \InvalidArgumentException
   *   When no such username exists or the checkbox can't be found.
   */
  protected function selectUserVBOCheckbox($username) {
    if ($account = user_load_by_name($username)) {
      if ($checkbox = $this->getSession()->getPage()->find('css', 'input[value=' . $account->uid . ']')) {
        $checkbox->check();
      } else {
        throw new \InvalidArgumentException(sprintf('No such checkbox %s', $username));
      }
    } else {
      throw new \InvalidArgumentException(sprintf('No such username %s', $username));
    }
  }
}

//https://thinkshout.com/blog/2014/10/getting-started-with-behat/
//http://kevinquillen.com/bdd/2014/06/08/your-first-behat-test
