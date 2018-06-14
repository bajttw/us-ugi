<?php
namespace AppBundle\Form\DataTransformer;

use Doctrine\Common\Persistence\ObjectManager;
use Symfony\Component\Form\DataTransformerInterface;

class EntityToHiddenTransformer implements DataTransformerInterface
{
    protected $objectManager;
    private $entityClass;
    private $options = [];

    public function __construct(ObjectManager $objectManager, $entityClass, $options = [])
    {
        $this->objectManager = $objectManager;
        $this->entityClass = $entityClass;
        $this->options = array_replace(['shortNames' => 'dic' ], $options);
    }

    public function transform($entity)
    {
        if (null === $entity) {
            return;
        }
        return $entity->getData(true, $this->options);
    }

    public function reverseTransform($data)
    {
        $entityData = json_decode($data, true);
        $nameSpace = $this->entityClass;
        $entity = null;
        if ($entityData != null) {
//            $id=$entityData['id'];
            $id = array_key_exists('id', $entityData) ? $entityData['id'] : $entityData['v'];
            if ($id != null) {
                $entity = $this->objectManager->getRepository($nameSpace)->find($id);
            } else {
                $entity = new $nameSpace();
            }
            $entity->setData($entityData);
        }
        return $entity;
    }
}
