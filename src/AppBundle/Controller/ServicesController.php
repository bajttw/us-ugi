<?php

namespace AppBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use AppBundle\Utils\Utils;
use AppBundle\Entity\ServiceOrders;
class ServicesController extends AppController
{
    const en='services';
    const ec='Services';
    const serviceOrderType = 10;

    public static function getFilters($type='index', $options=[]){
        $cid = Utils::deep_array_value('cid', $options);
        $isClient=$cid != null;
        $filters=[];
        $fs=[
            'performed' => [
                'name' => 'performed',
                'type' => 'input',
                'setValue' => [
                    'type' => 'settings',
                    'query' => 'services-filters-performed-value'
                ],                
                'source' => [
                    'type' => 'settings',
                    'query' => 'filters-dateRanges'
                ],
                'd' => [
                    'filter-options' => json_encode(['type' => 'date_period']),
                    'widget' => [
                        'type' => 'daterange',                       
                        'autoUpdateInput' => true
                    ]
                ]
            ],
            'clients.name' =>[
                'name' => 'serviceOrder.client.id',
                'source' => [
                    'type' => 'entity',
                    'query' => 'Clients',
                    'options' => [
                        'filters' => [
                            'regular' => [
                                'name' => 'regular',
                                'value' => true
                            ] 
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
            'hiddenRegularClients' => [
                'name' => 'serviceOrder.client.regular',
                'type' => 'hidden',
                'value' => 1
            ],
            'hiddenClient' => [
                'name' => 'serviceOrder.client',
                'type' => 'hidden',
                'value' => [ $cid ]
            ],
            'clients.regular' => [
                'name' => 'serviceOrder.client.regular',
                'attr' => [
                    'multiple' => 'multiple'
                ],
                'data' => [
                    ['v' => '1', 'n' => 'stały'],
                    ['v' => '0', 'n' => 'zwykły']
                ],
                'setValue' => [
                    'type' => 'settings',
                    'query' => 'services-filters-regularClients-value'
                ],                
                'd' => [
                    'widget' => 'multiselect'
                ]
            ],
            'serviceorders.state' =>[
                // 'label' => 'services.filter.serviceorders.closed1',
                'name' => 'serviceOrder.closed',
                'data' => [
                    ['v' => 0, 'n' => 'otwarte'],
                    ['v' => 1, 'n' => 'zamknięte']
                ],
                'setValue' => [
                    'type' => 'settings',
                    'query' => 'services-filters-serviceOrderState-value'
                ],                
                'd' => [
                    'widget' => 'multiselect',
                    'filter-options' => json_encode(['type' => 'set']),
                ]
            ]

        ];
        switch($type){
            case 'table_client':
                self::addFilter($filters, $fs['hiddenClient'], 'client');
            break;
            case 'index':
                foreach(['clients.regular', 'clients.name', 'serviceorders.state', 'performed' ] as $f){
                    self::addFilter($filters, $fs[$f], $f);
                }
            break;
            case 'service':
                foreach(['serviceorders.state', 'performed' ] as $f){
                    self::addFilter($filters, $fs[$f], $f);
                }
            break;            
            default:
        }
        return $filters;
    }

    public static function getToolbarBtn($type='index', $options=[] )
    {
        $cid = Utils::deep_array_value('cid', $options);
        $b=[
            'new' => [
                    'action' => 'new',
                    'isClient' => $cid ? true : false,
                    'modal' => static::en,
                    'attr' => [
                        'class' => 'btn-primary'
                    ],
                    'routeParam' => array_merge( ['type' => 'm' ], $cid ? [ 'cid' => $cid ] : [])
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


    public static function getActions($type = 'index', $options=[])
    {
        $actions = [
            ['action' => 'edit', 'type' => 'm', 'target' => static::en],
            ['action' => 'delete', 'type' => 'm', 'target' => static::en]
        ];

        return $actions;
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
    
    protected function customCreateAction(&$dataReturn){
        $dataReturn=[];
        $es=$this->getEntitySettings();
        $sons=$this->getEntityNameSpaces('ServiceOrders');
        $soid=intval($this->entity->getServiceOrderId());
        $serviceOrder=$this->getEntityManager()->getRepository($sons['path'])->find(intval($this->entity->getServiceOrderId()));
        if(!$serviceOrder){
            if (!$this->client) {
                // $this->client = $this->findClient(intval($this->entity->getClientId()));
                $this->client = $this->entity->getClient();
            }
            if($this->client){
                $serviceOrder=new $sons['nameSpace']([ 'controller' => $this, 'defaults' =>  Utils::deep_array_value('defaults', $this->getEntitySettings($sons))] );
                $serviceOrder->setClient($this->client);
                $serviceOrder->setType($this->entity->getServiceOrderType());
                $serviceOrder->setNumber($serviceOrder->genNumber());
                $dataReturn['messages']['childs']= [
                    [
                        'message' => [
                            $this->trans($this->messageText('created', $sons), [ $serviceOrder->getNumber(), $this->client->getName() ] )
                        ]
                    ]
                ];
                //     'message' => $this->trans($this->messageText('created', $sons)).' '.$serviceOrder->getNumber() 
            }else{
                $dataReturn['errors']['childs']=[ $this->errorMessage([
                    'title' => 'client',
                    'message' => 'clientNotFound'
                    ])
                ];
                
            }
        }
        $serviceOrder->addService($this->entity);
        return $dataReturn;
    }
    
    protected function customMessages(&$messages, $type){
        switch ($type){
            case 'create':
                $messages['message']=$this->trans($this->messageText($type), [$this->entity->getServiceOrder()->getNumber(), $this->entity->getServiceOrder()->getShowCreated()]);
            break;
        }
        return $messages;
    }

    protected function newCustomEntity(){
        $clientsDicOptions=[
            'as_array' => false,
            'by_id' => true,
            'filters' => [
                'regular' => [ 'value' => true]
            ]
        ];
        if ($this->isClient()){
            $this->entity->setClient($this->client);
            $soDic=$this->getEntityManager()->getRepository('AppBundle:ServiceOrders')->getDic([
                'filters' => [
                    'client' => [ 
                        'value' => $this->client->getId() 
                    ]
                ],
                'order' => 'created'
            ] );
            $this->formOptions['service_orders_dic']=$soDic;
            if( $soCount=count($soDic) > 0 ){
                for( $i=$soCount-1 ; $i >= 0 ; $i++){
                    if($soDic[$i]['t'] == self::serviceOrderType ){
                        $this->entity->setServiceOrderId($soDic[$i]['v']);
                        break;
                    }
                }
            }
        }else{
            $this->formOptions['client_choice'] = true;
        }
        $this->formOptions['service_order_types']=Utils::deep_array_value('dictionaries-type', $this->getEntitySettings('ServiceOrders'));
    }
    // protected function newCustomEntity(){
    //     $clientsDicOptions=[
    //         'as_array' => false,
    //         'by_id' => true,
    //         'filters' => [
    //             'regular' => [ 'value' => true]
    //         ]
    //     ];
    //     if ($this->isClient()){
    //         $clientId=$this->client->getId();
    //         $clientsDicOptions['filters']=['id' => ['value' => $this->client->getId() ] ];  
    //         $this->formOptions['service_orders_dic']=$this->getEntityManager()->getRepository('AppBundle:ServiceOrders')->getDic([
    //             'filters' => [
    //                 'client' => [ 
    //                     'value' => $clientId 
    //                 ]
    //             ]
    //         ] );
    //         if( count($this->formOptions['service_orders_dic'])>0 ){
    //             foreach( $this->formOptions['service_orders_dic'] as $so){
    //                 if(so['t']==10){
    //                     $this->entity->setServiceOrderId(so['v']);
    //                     break;
    //                 }
    //             }
    //         }
    //     }else{
    //         // $this->formOptions['clients_dic']=$this->getEntityManager()->getRepository(self::$appClientsPath)->getDic($clientsDicOptions);
    //         $this->formOptions['client_choice'] = true;
    //     }
    //     $this->formOptions['service_order_types']=Utils::deep_array_value('dictionaries-type', $this->getEntitySettings('ServiceOrders'));
    // }

    protected function setCustomFormOptions(){
        $sons=$this->getEntityNameSpaces("ServiceOptions");
        $this->setReturnUrl();
        $this->formOptions['attr']['data-form']=self::en;
        $this->formOptions['attr']['data-dic-service-orders']=$this->getUrl('dic', 'ServiceOrders');
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

        return $this;
    }

    
// </editor-fold>   

    
}
