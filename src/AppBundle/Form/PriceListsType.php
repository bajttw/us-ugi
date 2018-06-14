<?php

namespace AppBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Form\FormView;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\Extension\Core\Type\CollectionType;

class PriceListsType extends AbstractType
{
    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $delete=$options['method'] == 'DELETE';
        $builder
            ->add('title', null, [
                'label' => "pricelists.label.title"
            ])
            ->add('start', TextType::class, [
                'label' => "pricelists.label.start",
                'attr' => [
                    'data-options' => json_encode([
                        'widget' => [
                            'type' => 'datepicker',
                            'options' => [
                                'timePicker' =>  false,
                                'startDate' => true
                            ] 
                        ]
                    ])
                ]
            ])
            ->add('end', TextType::class, [
                'label' => "pricelists.label.end",
                'required' => false,
                'attr' => [
                    'data-options' => json_encode([
                        'widget' => [
                            'type' => 'datepicker',
                            'options' => [
                                'autoUpdateInput' => false,
                                'timePicker' =>  false,
                            ] 
                        ]
                    ])
                ]
            ])
            ->add('description', null, [
                'required' => false,
                'label' => "pricelists.label.description"
            ])
            ->add('clients', EntityType::class, [
                'class' => 'AppBundle:Clients',
                'label'     => 'pricelists.label.clients',
                'required' => false,
                'choice_label'     => 'name',
                'multiple'     => true,
                'attr' =>   [
                    'data-options' => json_encode([
                        'widget' =>  [
                            'type' => 'multiselect'
                        ]
                    ])
                ]
            ])
            ->add('clientsGroups', EntityType::class, [
                'class' => 'AppBundle:ClientsGroups',
                'label'     => 'pricelists.label.clientsGroups',
                'required' => false,
                'choice_label'     => 'name',
                'multiple'     => true,
                'attr' =>   [
                    'data-options' => json_encode([
                        'widget' =>  [
                            'type' => 'multiselect'
                        ]
                    ])
                ]
            ])
            ->add('serviceCatalogPrices', CollectionType::class, [
                'entry_type'   => ServiceCatalogPricesType::class,
                'entry_options'=> [
                    'form_admin' => $options['form_admin'],  
                    'em' => $options['em'],
                    'label' => false,
                    'entities_settings' => $options['entities_settings']
                    ],
                'label' => false,
                'allow_add' => true,
                'allow_delete' => true,
                'prototype' => true,
                'prototype_name' => '__pn__',
                // Post update
                'by_reference' => false,
                'error_bubbling' => true
            ]) 
            ->add('serviceOptionsPrices', CollectionType::class, [
                'entry_type'   => ServiceOptionsPricesType::class,
                'entry_options'=> [
                    'form_admin' => $options['form_admin'],  
                    'em' => $options['em'],
                    'label' => false,
                    'entities_settings' => $options['entities_settings']
                    ],
                'label' => false,
                'allow_add' => true,
                'allow_delete' => true,
                'prototype' => true,
                'prototype_name' => '__pn__',
                // Post update
                'by_reference' => false,
                'error_bubbling' => true
            ]) 

       ;
    }
    
    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => 'AppBundle\Entity\PriceLists',
            'form_admin' => false,            
            'em' => null,
            'entities_settings' =>null,
            'translator' =>null
        ]);
    }

    // /**
    //  * {@inheritdoc}
    //  */
    // public function buildView(FormView $view, FormInterface $form, array $options)
    // {    
    //     parent::buildView($view, $form, $options);
    //     $view->vars['attr']['data-form-fields'] = json_encode([ 'title', 'description', 'start', 'end' ]);
    // }

    /**
     * {@inheritdoc}
     */
    public function getBlockPrefix()
    {
        return 'appbundle_priceLists';
    }


}
