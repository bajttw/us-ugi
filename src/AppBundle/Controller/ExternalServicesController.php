<?php

namespace AppBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use AppBundle\Utils\Utils;
use AppBundle\Entity\ServiceOrders;
class ExternalServicesController extends AppController
{
    const en='externalservices';
    const ec='ExternalServices';

    public static function getFilters($type='index', $options=[]){
        $filters=[];
        return $filters;
    }

//  <editor-fold defaultstate="collapsed" desc="Custom functions">
    
    
// </editor-fold>   

    
}
