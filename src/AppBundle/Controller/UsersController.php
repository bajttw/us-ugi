<?php

namespace AppBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;

use AppBundle\Entity\Users;

/**
 * Users controller.
 *
 */
class UsersController extends AppController
{
    const en='users';
    const ec='Users';
    
    public static function getModal(){
        return [
            "dialog_attr" => [
                'class' => 'modal-xl'
            ]
        ];
    }
    
    protected function customUpdateAction(&$dataReturn){
        $userManager = $this->get('fos_user.user_manager');
        $userManager->updateUser($this->entity, true);
        return $dataReturn;
    }

//  <editor-fold defaultstate="collapsed" desc="Custom functions">
    
    protected function customMessages(&$messages, $type){
        switch ($type){
            case 'create':
            case 'update':
                $messages['message'].=" <i>".$this->entity->getUsername()."</i>";
            break;
                
        }
        return $messages;
    }

    
    protected function customNewEntity(){
        if ($this->isClient()){
            $this->entity->addClient($this->client);
            $this->entity->setRoles(['ROLE_USER']);
        }else{
            $this->entity->setRoles(['ROLE_ADMIN']);
        }
        return $this;
    }


// </editor-fold>   
    

}
