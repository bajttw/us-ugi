<?php
namespace AppBundle\Form\DataTransformer;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Persistence\ObjectManager;
use Symfony\Component\Form\DataTransformerInterface;

class UploadsToHiddenTransformer implements DataTransformerInterface
{
    protected $objectManager;
    private $entityClass;
    private $options = [];

    public function __construct(ObjectManager $objectManager, $options = [])
    {
        $this->objectManager = $objectManager;
        $this->entityClass = "AppBundle\\Entity\\Uploads";
        $this->options = array_replace(['shortNames' => true], $options);
    }

    public function transform($uploads)
    {
        if (null === $uploads) {
            return;
        }
        $uploadsData = new ArrayCollection();
        foreach ($uploads as $upload) {
            $uploadsData[] = $upload->getData(true, $this->options);
        }
        return $uploadsData;
    }

    public function reverseTransform($data)
    {
        $uploads = new ArrayCollection();
        foreach ($data as $json) {
            $uploadData = json_decode($json, true);
            if ($uploadData != null) {
                if ($uploadData['id'] != null) {
                    $upload = $this->objectManager
                        ->getRepository($this->entityClass)
                        ->find($uploadData);
                } else {
                    $upload = new $this->entityClass();
                }
                $upload->setData($uploadData);
                $uploads[] = $upload;
            }
        }
        return $uploads;
    }
}
