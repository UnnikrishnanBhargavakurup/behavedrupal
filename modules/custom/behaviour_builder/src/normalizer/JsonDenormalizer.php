<?php

namespace Drupal\behaviour_builder\normalizer;

use Drupal\serialization\Normalizer\NormalizerBase;
use Symfony\Component\Serializer\Normalizer\DenormalizerInterface;

/**
 * Class JsonDenormalizer
 *
 * @todo Remove this class once https://www.drupal.org/node/2419825 is fixed.
 */
class JsonDenormalizer extends NormalizerBase implements DenormalizerInterface {

  /**
   * The interface or class that this Normalizer supports.
   *
   * @var array
   */
  protected $supportedInterfaceOrClass = array(__CLASS__);

  /**
   * {@inheritdoc}
   */
  public function normalize($object, $format = null, array $context = array()) {
    return parent::normalize($object, $format, $context);
  }

  /**
   * {@inheritdoc}
   */
  public function denormalize($data, $class, $format = NULL, array $context  = array()) {
    return $data;
  }
}