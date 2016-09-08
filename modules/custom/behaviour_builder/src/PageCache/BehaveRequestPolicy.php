<?php

namespace Drupal\behaviour_builder\PageCache;

use Drupal\Core\PageCache\RequestPolicyInterface;
use Symfony\Component\HttpFoundation\Request;

/**
 * A policy allowing delivery of cached pages when there is no session open.
 *
 * Do not serve cached pages to authenticated users, or to anonymous users when
 * CHOCOLATECHIPCOOKIE exist in the request header.
 */
class BehaveRequestPolicy implements RequestPolicyInterface {

  /**
   * {@inheritdoc}
   */
  public function check(Request $request) {
    if ($request->getRequestUri() == '/ide.html') {
      return self::DENY;
    }
  }
}
