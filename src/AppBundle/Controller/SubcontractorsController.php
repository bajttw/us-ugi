<?php

namespace AppBundle\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Form\FormError;

class SubcontractorsController extends AppController{

    const en='subcontractors';
    const ec='Subcontractors';

    public static function getFilters($type='index', $options=[]){
        $id=array_key_exists('id', $options) ? $options['id'] : null;
        $filters=[
        ];
        $fs=[
            'active' => self::$activeFilter,
        ];
        switch($type){
            case 'index':
                foreach(['active'] as $f){
                    $filters[]=$fs[$f];
                }
            break;
        }
        return $filters;
    }

    public static function getActions($type = 'index', $options=[]){
        $actions= [
            'edit' => [ 'action' => 'edit', 'type' => 'm', 'target' => self::en],
            'delete' => [ 'action' => 'delete', 'type' => 'm', 'target' => self::en]
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

    public static function getModal(){
        return [
            "dialog_attr" => [
                'class' => 'modal-xl'
            ]
        ];
    }
   
//  <editor-fold defaultstate="collapsed" desc="Custom functions">
    
    protected function customMessages(&$messages, $type){
        switch ($type){
            case 'create':
            case 'update':
                if(!is_array($messages['message'])){
                    $messages['message'] = [$messages['message']];
                }
                $messages['message'][] = "<strong>".$this->entity->getName()."</strong>";
                $messages['message'][] = $this->trans($this->messegeText('updated_post'));    
            break;
                
        }
        return $messages;
    }

    protected function setCustomFormOptions(){
        $this->addModalsField([
            [
                'name' => 'comment',
                'fieldtype' => 'textarea'
            ]
        ]);
        return $this;
    }


// </editor-fold>   
    
// <editor-fold defaultstate="collapsed" desc="Actions">  
    

 
// </editor-fold>
}
