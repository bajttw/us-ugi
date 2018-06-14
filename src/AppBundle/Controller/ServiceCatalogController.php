<?php

namespace AppBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;

class ServiceCatalogController extends AppController
{
    const en='servicecatalog';
    const ec='ServiceCatalog';

    public static function getFilters($type='index', $options=[]){
        $filters=[
        ];
        return $filters;
    }

    
}
