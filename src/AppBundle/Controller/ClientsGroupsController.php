<?php

namespace AppBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;

class ClientsGroupsController extends AppController
{
    const en='clientsgroups';
    const ec='ClientsGroups';

    public static function getFilters($type='index', $options=[]){
        $filters=[];
        return $filters;
    }

}
