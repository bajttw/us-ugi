<?php

namespace AppBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use AppBundle\Utils\Utils;
use AppBundle\Entity\ServiceOrders;
class MaterialsController extends AppController
{
    const en='materials';
    const ec='Materials';

    public static function getFilters($type='index', $options=[]){
        $filters=[];
        return $filters;
    }

//  <editor-fold defaultstate="collapsed" desc="Custom functions">
    
    
// </editor-fold>   

    
}
