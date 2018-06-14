<?php
namespace AppBundle\Form\DataTransformer;

use Doctrine\Common\Persistence\ObjectManager;

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of UploadToIdTransformer
 *
 * @author Krzysiek
 */
class UploadToIdTransformer extends EntityToIdTransformer
{
    /**
     * @var ObjectManager
     */
    public function __construct(ObjectManager $objectManager)
    {
        parent::__construct($objectManager, "AppBundle\\Entity\\Uploads");
    }

}
