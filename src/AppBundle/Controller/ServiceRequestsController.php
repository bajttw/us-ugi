<?php

namespace AppBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;

class ServiceRequestsController extends AppController
{
    const en='servicerequests';
    const ec='ServiceRequests';

    public static function getFilters($type='index', $options=[]){
        $filters=[];
        return $filters;
    }

    public static function getActions($type='index', $options=[]){
        $actions= [
            [ 'action' => 'edit', 'type' => 'm', 'target' => self::en ],
            [ 'action' => 'delete', 'type' => 'm', 'target' => self::en]
        ];
        return $actions;
    }

    public static function getToolbarBtn($type='index', $options=[] ){
        return [
            [   
                'action' => 'new',
                'modal' => self::en,
                'attr' => [ 'class' => 'btn-primary' ]
            ]
        ];
    }

}
