<?php

namespace AppBundle\Menu;

use Knp\Menu\FactoryInterface;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;

class Builder implements ContainerAwareInterface{
    use ContainerAwareTrait;
    public function clientMenu(FactoryInterface $factory, array $options){
        $menu = $factory->createItem('root');
        $menu->setChildrenAttribute('class', 'nav navbar-nav');
        $menu->addChild('clients.label.account', array())
            ->setAttribute('dropdown', true);
        $menu['clients.label.account']->addChild('clients.label.myAccount', array(
            'route' => 'client_clients_edit',
            'routeParameters' => array('cid' => $options['clientid'], 'id' => $options['clientid'] ),
            'linkAttributes' => array("data-target" => "#myModal", "data-toggle" => "modal"),        
            ));
        $menu['clients.label.account']->addChild('clients.label.users', array(
            'route' => 'client_users',
            'routeParameters' => array('cid' => $options['clientid']),
            ));
            //        $menu->addChild('Zamówienia', array(
            //            'route' => 'client_orders',
            //            'routeParameters' => array('cid' => $options['clientid'])
            //            ));

        return $menu;
    }
    public function employeeMenu(FactoryInterface $factory, array $options){
        $menu = $factory->createItem('root');
        $menu->setChildrenAttribute('class', 'nav navbar-nav');
        $menu->addChild('clients.label.clients', [  'route' => 'clients']);
        $menu->addChild('clients.label.service', [ 
            'route' => 'clients_service'
        ]);
        $menu->addChild('services.label.new', [
            'route' => 'services_new',
            'routeParameters' => ['type' => 'w'],
            'linkAttributes' => ['target' => '_blank']
        ]);
        $menu->addChild('serviceorders.label.index', ['route' => 'serviceorders'] );
        $menu->addChild('services.label.index', ['route' => 'services'] );
        $menu->addChild('settings.label.settings')
                ->setAttribute('dropdown', true);
        // $menu['Ustawienia']->addChild('Parametry', array(
        //     'route' => 'parameters_edit',
        //     'routeParameters' => array('id' => 1),
        //     'linkAttributes' => array("data-target" => "#myModal", "data-toggle" => "modal"),        
        // ));
        // $menu['settings.label.settings']->addChild('prices.label.prices', array('route' => 'serwis_prices'));
        return $menu;
    }

    public function adminMenu(FactoryInterface $factory, array $options){
        $menu = $factory->createItem('root');
        $menu->setChildrenAttribute('class', 'nav navbar-nav');
        $menu->addChild('clients.label.clients', [  'route' => 'app_admin_clients']);
        $menu->addChild('clients.label.service', [  'route' => 'app_admin_clients_service']);
        $menu->addChild('services.label.new', [
            'route' => 'app_admin_services_new',
            'routeParameters' => ['type' => 'w'],
            'linkAttributes' => ['target' => '_blank']
        ]);
        $menu->addChild('serviceorders.label.index', ['route' => 'app_admin_serviceorders'] );
        $menu->addChild('services.label.index', ['route' => 'app_admin_services'] );
        $menu->addChild('settings.label.settings')
                ->setAttribute('dropdown', true);
        $menu['settings.label.settings']->addChild('users.label.index', array('route' => 'app_admin_users'));
        $menu['settings.label.settings']->addChild('usersgroups.label.index', array('route' => 'app_admin_usersgroups'));
        $menu['settings.label.settings']->addChild('clientsgroups.label.index', array('route' => 'app_admin_clientsgroups'));
        $menu['settings.label.settings']->addChild('pricelists.label.index', array('route' => 'app_admin_pricelists'));
        $menu['settings.label.settings']->addChild('servicecatalog.label.index', array('route' => 'app_admin_servicecatalog'));
        $menu['settings.label.settings']->addChild('serviceoptions.label.index', array('route' => 'app_admin_serviceoptions'));
        $menu['settings.label.settings']->addChild('subcontractors.label.index', array('route' => 'app_admin_subcontractors'));
        $menu['settings.label.settings']->addChild('settings.label.index', array('route' => 'app_admin_settings'));
        // $menu->addChild('Użytkownicy', array('route' => 'users'));
        return $menu;
    }
}