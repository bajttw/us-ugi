<?php

namespace AppBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;

class PriceListsController extends AppController
{
    const en='pricelists';
    const ec='PriceLists';

    public static function getFilters($type='index', $options=[]){
        $filters=[];
        return $filters;
    }

    public static function getActions($type='view', $options=[]){
        $actions=[];
        $all=[
            'edit' =>  [ 'action' => 'edit', 'type' => 'w' ],
            'show' =>  [ 'action' => 'show', 'browserAction' => true],
            'pdf' =>  [ 'action' => 'pdf', 'browserAction' => true ],
            'delete' =>  [ 'action' => 'delete', 'type' => 'm', 'target' => self::en ]
        ];
        switch($type){
            case 'index':
                $as=['show', 'pdf', 'edit', 'delete'];
            break;
            case 'view':
            default:
                $as=['show', 'pdf'];
        }
        foreach ($as as $a){
            $actions[$a]=$all[$a];
        }
        return $actions;
    }

    
    public static function getToolbarBtn($type='index', $options=[] )
    {
        return [
            [   
                'action' => 'new',
                'attr' => [
                    'class' => 'btn-primary',
                    'target' => '_blank'
                ],
                'routeParam' => [
                    'type' => 'w'
                ]
            ]
        ];
    }

 //  <editor-fold defaultstate="collapsed" desc="Custom functions">

    protected function customCreateActions(&$dataReturn){
        $dataReturn['toEdit'] = true;
        return $dataReturn;
    }

    protected function setCustomFormOptions(){
        $this->formOptions['attr']['data-form']=self::en;
        return $this;
    
    }   
    
}
