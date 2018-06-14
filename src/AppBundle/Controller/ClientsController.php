<?php

namespace AppBundle\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Form\FormError;
use AppBundle\Utils\Utils;

class ClientsController extends AppController{
    const en='clients';
    const ec='Clients';

    public static function getFilters($type='index', $options=[]){
        $id=array_key_exists('id', $options) ? $options['id'] : null;
        $filters=[
        ];
        $fs=[
            'active' => self::$activeFilter,
            'users' =>[
                'name' => 'users.id',
                'source' => [
                    'type' => 'entity',
                    'query' => 'Users',
                    'options' => [
                        'filters' => [
                            'type' => [
                                'condition' => 'gte',
                                'value' => '2'
                            ],
                            'enabled' => [ 'value' => true]
                        ]
                        
                    ]
                ],
                'attr' => [
                    'multiple' => 'multiple'
                ],
                'd' => [
                    'widget' => 'multiselect'                
                ]
            ],
            'regular' =>[
                'name' => 'regular',
                'data' => [
                    ['v' => '1', 'n' => 'stały'],
                    ['v' => '0', 'n' => 'zwykły']
                ],
                'd' => [
                    'widget' => 'multiselect'
                ],
                'attr' => [
                    'multiple' => 'multiple'
                ]
            ],
            'serviceorders.status' => [
                'name' => 'serviceOrders.status',
                'setValue' => [
                    'type' => 'settings',
                    'query' => 'clients-filters-serviceOrdersStatus-value'
                ],                
                'source' => [
                    'type' => 'settings',
                    'query' => 'serviceorders-dictionaries-status'
                ],
                'attr' => [
                    'multiple' => 'multiple'
                ],
                'd' => [
                    'widget' => 'multiselect'                
                ]
            ]
        ];
        switch($type){
            case 'index':
            case 'service':
                foreach(['regular', 'serviceorders.status'] as $f){
                    self::addFilter($filters, $fs[$f], $f);
                }
            break;
            case 'index':
            default:
                foreach(['active', 'regular', 'serviceorders.status'] as $f){
                    self::addFilter($filters, $fs[$f], $f);
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
                $messages['message'].=" <i>".$this->entity->getName()."</i>";
            break;        
                
        }
        return $messages;
    }

    protected function customCreateAction(&$dataReturn){
        $dataReturn=['show' => 1];
        $email=$this->entity->getEmail();
        if ($email){
            $userManager = $this->get('fos_user.user_manager');
            $user=$userManager->findUserByEmail($email);
            if ($userManager->findUserByEmail($email) == null){
                $defaultPass=$this->getSetting('password-default', true);
                //            $this->getEntityManager()->persist($this->entity);
                $user= $userManager->createUser();
                $user->addClient($this->entity);
                $user->setUsername($this->entity->getEmail());
                $user->setEmail($this->entity->getEmail());
            $user->setRoles(['ROLE_USER']);
            $user->setPlainPassword($defaultPass);
            try {
                $userManager->updateUser($user, true);
                    $dataReturn['messages']['childs']=[
                        $this->responseMessage([
                            'title' => $this->trans($this->titleText('user_created', 'Clients')),
                            'message' => [
                                $this->trans($this->messageText('login', 'Users'), [$user->getUsername()]),
                                $this->trans($this->messageText('password', 'Users'), [$defaultPass])

                            ]
                        ], null, false)
                    ];
                }catch(\Exception $e) {
                    $dataReturn['errors']['childs']=[ $this->errorMessage([
                        'title' => $this->trans($this->titleText('error.user_create')),
                        'message' => $e->getMessage()
                        ], null, false)
                    ];
                }
            }else{
                $error= new FormError($this->trans($this->messageText('email_exist', 'Users')));        
                $this->formSystem->get('email')->addError($error);
                $dataReturn['errors']['childs']= [ $this->errorMessage([
                    'title' => 'error.user_create',
                    'message' => 'email_exist'
                ])];
            }
        }
        return $dataReturn;
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

    private function genClientServicePanel($entityClassName, $active=false, $cid='__cid__'){
        $ens=self::getEntityNameSpaces($entityClassName);
        $controller=self::getEntityController($ens);
        return $this->genPanel($ens, [
            'active' => $active,
            'content' => $this->tmplPath('index', '', 'Panel'),
            'toolbars' => [
                $this->genToolbar( $ens, 'service', [ 'tmpl' => true, "cid" => $cid ]),
                $this->genFilterbar( $ens, 'service')
            ],
            'table' => $this->genTable($ens, 'panel', [
                'actions' => true,
                'export' => true,
                'd' => [
                    'ajax' => [
                        'url' => $this->getUrl('ajax', $ens, true, ["cid" => $cid])
                    ],
                    'filters' => $controller::getFilters('table_client', [ 'cid' => $cid ]) 
                ]
            ])
        ]);
    }
    
// <editor-fold defaultstate="collapsed" desc="Actions">  
    
    public function serviceAction(Request $request, $uid=0){
        if (!$this->preAction($request, 0, ['checkPrivilages' => 1] )) {
            return $this->responseAccessDenied();
        }
        $cns=$this->getEntityNameSpaces();
        $cid='__cid__';
        $tecn=['ServiceOrders', 'Services', 'Settings'];
        $tabs=[];
        $tabsOpt=[];
        for($i=0; $i < count($tecn); $i++){
            $tns=$this->getEntityNameSpaces($tecn[$i]);
            $ten=$this->getEntityName($tns);
            $tabs['client_'.$ten]=$this->genClientServicePanel($tns, $i==0, $cid);
            $tabsOpt[$ten]=['ajax' => false];
            $this->addEntityModal($tns);
        }
        $tabsOpt['edit']=['ajax' => true];
        $tabs['client_edit'] = $this->genPanel($cns, [
            'label' => $this->labelText('edit'),
            'd' => [
                'url' => json_encode([
                    'start' => $this->getUrl('edit', $cns, true, ["id" => $cid, "type" => "p"]),
                    'edit' => $this->getUrl('edit', $cns, true, ["id" => $cid, "type" => "p"]),
                    'new' => $this->getUrl('new', $cns, true, [ "type" => "p"])
                ])               
            ],
            'attr' =>[
                'id' => 'edit_panel'
            ]
        ]);
        $this->setTemplate('service', null)
            ->setRenderOptions([
                'title' => $this->titleText('service'),
                'panel_left' => $this->genPanel($cns, [
                    'content' => $this->tmplPath('panel', null),
                    'toolbars' => [
                        $this->genToolbar( ),
                        $this->genFilterbar(null, 'service')
                    ],
                    'table' => $this->genTable(null, 'panel', [
                        'actions' => true, 
                        'select' => 'single',
                        'd' => [
                            'ajax' => [
                                'url' => $this->getUrl('ajax_details', $cns, false)
                            ],
                            'filters' => [ 'active' => self::$activeHiddenFilter ]
                        ]
                    ])
                ] ),
                'panel_right' => [
                    'template' => $this->tmplPath('panel_service', null),
                    'tabs'=> [
                        'panels' => $tabs
                    ],
                    'attr' =>[
                        'id' => 'service_panel'
                    ],
                    'd' => [
                        'options' => json_encode([
                            'panels' => $tabsOpt
                        ])
                    ]
                ],
                'service' => [
                    'attr' => [
                        'id' => 'service'
                    ]
                ]
            ])
            ->addEntityModal();
        return $this->renderSystem();
    }
   
 
// </editor-fold>
}
