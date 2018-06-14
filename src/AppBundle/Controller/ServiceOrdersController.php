<?php

namespace AppBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;

use AppBundle\Utils\Utils;

class ServiceOrdersController extends AppController
{
    const en='serviceorders';
    const ec='ServiceOrders';
    
    public $ownTemplate=['edit', 'Window/edit', 'show', 'Modal/show'];
    
    public static function getFilters($type='index', $options=[]){
        $id = Utils::deep_array_value('id', $options);
        $cid = Utils::deep_array_value('cid', $options);
        $isClient=$cid != null;
        $filters=[];
        $fs=[
            'clients.name' =>[
                'name' => 'client',
                'source' => [
                    'type' => 'entity',
                    'query' => 'Clients',
                ],
                'attr' => [
                    'multiple' => 'multiple'
                ],
                'd' => [
                    'widget' => 'multiselect'                
                ]
            ],
            'clients.regular' =>[
                'name' => 'client.regular',
                'data' => [
                    [ 'v' => '1', 'n' => 'stały' ],
                    [ 'v' => '0', 'n' => 'zwykły' ]
                ],
                'attr' => [
                    'multiple' => 'multiple'
                ],
                'd' => [
                    'widget' => 'multiselect',
                    'def-value' => '1'               
                ]
            ],
            'status' => [
                'name' => 'status',
                'setValue' => [
                    'type' => 'settings',
                    'query' => 'serviceorders-filters-status-value'
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
            ],
            'express' => [
                'name' => 'express',
                'setValue' => [
                    'type' => 'settings',
                    'query' => 'serviceorders-filters-express-value'
                ],                
                'source' => [
                    'type' => 'settings',
                    'query' => 'serviceorders-dictionaries-express'
                ],
                'attr' => [
                    'multiple' => 'multiple'
                ],
                'd' => [
                    'widget' => 'multiselect'                
                ]
            ],
            'type' => [
                'name' => 'type',
                'setValue' => [
                    'type' => 'settings',
                    'query' => 'serviceorders-filters-type-value'
                ],                
                'source' => [
                    'type' => 'settings',
                    'query' => 'serviceorders-dictionaries-type'
                ],
                'attr' => [
                    'multiple' => 'multiple'
                ],
                'd' => [
                    'widget' => 'multiselect'                
                ]
            ],
            'created' => [
                'name' => 'created',
                'type' => 'input',
                'setValue' => [
                    'type' => 'settings',
                    'query' => 'serviceorders-filters-created-value'
                ],                
                'source' => [
                    'type' => 'settings',
                    'query' => 'serviceorders-filters-dateRanges'
                ],
                'd' => [
                    'filter-options' => json_encode(['type' => 'date_period']),
                    'widget' => 'daterange'
                ]
            ],
            'closed' => [
                'name' => 'closed',
                'type' => 'input',
                'setValue' => [
                    'type' => 'settings',
                    'query' => 'serviceorders-filters-closed-value'
                ],                
                'source' => [
                    'type' => 'settings',
                    'query' => 'serviceorders-filters-dateRanges'
                ],
                'd' => [
                    'filter-options' => json_encode(['type' => 'date_period']),
                    'widget' => 'daterange'
                ]
            ]
        ];
        
        switch($type){
            case 'index':
                foreach(['clients.regular', 'clients.name', 'status', 'created', 'type', 'express'] as $f){
                    self::addFilter($filters, $fs[$f], $f);
                }
            break;
            case 'table_client':
                self::addFilter($filters, self::genFilter('client_hidden', $options), 'client');
            break;
            case 'service':
            default:
                foreach(['status', 'created', 'type', 'express'] as $f){
                    self::addFilter($filters, $fs[$f], $f);
                }
        }
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
        $cid = Utils::deep_array_value('cid', $options);
        $b=[
            'new' => [
                    'action' => 'new',
                    'isClient' => $cid ? true : false,
                    'attr' => [
                        'class' => 'btn-primary',
                        'target' => '_blank'
                    ],
                    'routeParam' => array_merge( ['type' => 'w' ], $cid ? [ 'cid' => $cid ] : [])
                ]
            ];
        $btns=[];
        switch($type){
            default:
                foreach(['new'] as $n){
                    $btns[]=$b[$n];
                }
        }
        return $btns;
    }

    public static function getModal(){
        return [
            'name' => self::en, 
            'dialog_attr'=>[
                'class' => 'modal-xl'
            ]
        ];
    }
    
//  <editor-fold defaultstate="collapsed" desc="Custom functions">
    
    protected function customMessages(&$messages, $type){
        switch ($type){
            case 'create':
            case 'update':
                $messages['message']=$this->trans($this->messageText($type), [$this->entity->getNumber(), $this->entity->getClient()->getName()]);
            break;
        }
        return $messages;
    }
 
    protected function customCreateAction(&$dataReturn){
        $dataReturn['toEdit'] = true;
        return $dataReturn;
    }   

    protected function customEditAction(Request $request, $id, $cid = 0){
        $this->renderOptions['entity_data']=$this->entity->getShowData();
    }
    
    protected function newCustomEntity(){
        if ($this->isClient()){
            $this->entity->setClient($this->client);        
        }
        return $this;
    }

    protected function setCustomFormOptions(){
        $this->renderOptions['upload_route'] = 'uploads_uploadfile';
        $this->setReturnUrl();
        $this->formOptions['attr']['data-admin']=$this->isAdmin();
        $this->formOptions['attr']['data-form']=self::en;
        $this->formOptions['attr']['style']="min-width: 1200px;";
        $this->formOptions['client_choice']=!($this->isClient() || $this->entity->getClient());
        $scns=$this->getEntityNameSpaces("ServiceCatalog");
        $sons=$this->getEntityNameSpaces("ServiceOptions");
        $this->addModal([
            'name' => $scns['name'], 
            'en' => $scns['name'], 
            'ecn' => $scns['className'],
            'fieldtype' => 'ajson',
            'addBtn' => [
                'attr' => [
                    'class' => 'btn-success'
                ]
            ],
            'content' => $this->tmplPath('modalTable', '', 'Modal', self::$bundleName),
            'table' => $this->genTable($scns, 'panel', [
                'd' => [ 
                    'ajax' => [
                        'url' => $this->getUrl('ajax', $scns, false)
                    ]
                ],
                'select' => 'multi',
                'actions' => false
            ]),
            'dialog_attr'=>[
                'class' => 'modal-xl'
            ]
        ]);
        $this->addModal([
            'name' => $sons['name'], 
            'en' => $sons['name'],
            'ecn' => $sons['className'],
            'fieldtype' => 'ajson',
            'content' => $this->tmplPath('serviceOptions', '', 'Modal', self::$bundleName),
            'table' => $this->genTable($sons, 'panel', [
                'd' => [ 
                    'ajax' => [
                        'url' => $this->getUrl('ajax', $sons, false)
                    ]
                ],
                'select' => 'multi',
                'actions' => false
            ]),
            'dialog_attr'=>[
                'class' => 'modal-xl'
            ]
        ]);
        $this->addModalsField([
            [
                'name' => 'date',
                'fieldtype' => 'text',
                'field_attr' => [
                    'data-widget' => 'datepicker',
                    'data-options' => json_encode([
                        'locale' => [
                            'format' => 'YYYY-MM-DD HH:mm'
                        ],
                        'startDate' => true,
                        'timePicker' =>  true,
                        'timePicker24Hour' => true
                    ])
                ]
            ],
            [
                'name' => 'text',
                'fieldtype' => 'text',
                'field_attr' => [
                ]
            ]
        ]);
        return $this;
    }

    
// </editor-fold>   

//  <editor-fold defaultstate="collapsed" desc="Actions">
    
    public function clientIndexAction(Request $request, $cid){
        if (!$this->preAction($request, $cid)) {
            return false;
        }
        $this->setTemplate('index');
        $this->setRenderOptions([
            'title' => $this->titleText('client_index'),
            'toolbars' => [
                $this->genToolbar(null, 'client_index')
            ],
            'table' => $this->genTable(null, 'index', [
                'actions' => 'index',
                'd' => [
                    'ajax' => [
                        'url' => $this->getUrl('ajax', null, true, [
                            "cid" => $cid
                        ]),
                        'dataSrc' => ''
                    ]
                ],            
                'filters' => $this->getFilters('table_client', [
                    'cid' => $cid
                ])
            ])
        ])
            ->addEntityModal();
        return $this->renderSystem();
    }

// </editor-fold>   

}
