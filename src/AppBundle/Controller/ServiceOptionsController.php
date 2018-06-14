<?php

namespace AppBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;

class ServiceOptionsController extends AppController
{
    const en='serviceoptions';
    const ec='ServiceOptions';

    public static function getFilters($type='index', $options=[]){
        $filters=[
        ];
        return $filters;
    }

    
}
