<?php
namespace AppBundle\Form\DataTransformer;

use AppBundle\Utils\Utils;
use Doctrine\Common\Persistence\ObjectManager;
use Symfony\Component\Form\DataTransformerInterface;

class FloatTransformer implements DataTransformerInterface
{
    /**
     * @var ObjectManager
     */
    protected $objectManager;

    public function __construct()
    {

    }
    public function transform($value)
    {
        return $value;
    }
    public function reverseTransform($value)
    {
        return Utils::toFloat($value);
    }
}
