<?php
namespace AppBundle\Form\DataTransformer;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Persistence\ObjectManager;
use Symfony\Component\Form\DataTransformerInterface;

class EntitiesToHiddenTransformer implements DataTransformerInterface
{
    protected $objectManager;
    private $entityClass;
    private $options = [];

    public function __construct(ObjectManager $objectManager, $entityClass, $options = [])
    {
        $this->objectManager = $objectManager;
        $this->entityClass = $entityClass;
        $this->options = array_replace(['shortNames' => true], $options);
    }

    public function transform($entities)
    {
        if (null === $entities) {
            return;
        }
        $entitiesData = new ArrayCollection();
        foreach ($entities as $entity) {
            $entitiesData[] = $entity->getData(true, $this->options);
        }
        return $entitiesData;
    }

    public function reverseTransform($data)
    {
        $entities = new ArrayCollection();
        $nameSpace = $this->entityClass;
        foreach ($data as $json) {
            $entityData = json_decode($json, true);
            if ($entityData != null) {
                $id = $entityData['id'];
                if ($id != null) {
                    $entity = $this->objectManager->getRepository($nameSpace)->find($id);
                } else {
                    $entity = new $nameSpace();
                }
                $entity->setData($entityData);
                $entities[] = $entity;
            }
        }
        return $entities;
    }
}
