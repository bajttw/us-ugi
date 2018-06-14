<?php

namespace AppBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Form\FormView;
use Doctrine\ORM\EntityRepository;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\DataTransformer\DateTimeToStringTransformer;
use AppBundle\Form\DataTransformer\ToFloatTransformer;
use Symfony\Component\Form\Extension\Core\Type\CollectionType;
use AppBundle\Utils\Utils;

class ServiceOrdersType extends AbstractType
{
    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        if ($options['client_choice']){
            $builder->add('client', EntityType::class, [
                'class' => 'AppBundle:Clients',
                'label' => 'serviceorders.label.client',
                'choice_label' => 'name',   
                'placeholder' => 'serviceorders.label.choiceClient',                
                'attr' =>   [
                    'title' => 'clients.title.choice',
                    'data-options' => json_encode([
                        'widget' => [
                            'type' => 'multiselect'
                        ]
                    ])    
                ],
                'query_builder' => function (EntityRepository $er) {
                    return $er->createQueryBuilder('c')
                            ->where('c.active = true')
                        ->orderBy('c.name', 'ASC');
                }                
            ]);
        }else{
            $builder->add('client', EntityHiddenType::class, [
                'entity_class' => "AppBundle:Clients",
                'label' => 'serviceorders.label.client',
                'attr' => [
                    'readonly' => 'readonly',
                    'title' => 'serviceorders.title.client',
                    'data-type' => 'json',
                    'data-options' => json_encode([
                        'disp' => [
                            'type' => 'n'
                        ],
                        'details' => true
                    ])    
                ],
            ]);
        }
        $builder
           ->add('number', HiddenType::class, [
                'required' => false,
                'label' => "serviceorders.label.number",
                'attr' => [
                ]
            ])
            ->add('status', HiddenType::class , [
                'label' => "serviceorders.label.status",
                'attr' => [
                    'title' => 'serviceorders.title.status',
                    'data-type' => 'number'
                ]    
            ])
            ->add('type', HiddenType::class , [
                'label' => "serviceorders.label.type",
                'attr' => [
                    'title' => 'serviceorders.title.type',
                    'data-type' => 'number'
                ]    
            ])
            ->add('express', HiddenType::class , [
                'label' => "serviceorders.label.express",
                'attr' => [
                    'title' => 'serviceorders.title.express',
                    'data-type' => 'number'
                ]    
            ])
            ->add(
                $builder->create('created', HiddenType::class, [
                    'required' => false,
                    'label' => "serviceorders.label.created",
                    'attr' => [
                        'title' => 'serviceorders.title.created'
                    ]
                ])
                ->addModelTransformer(new DateTimeToStringTransformer(null, null, 'Y-m-d H:i'))
            )
            ->add(
                $builder->create('closed', HiddenType::class, [
                    'required' => false,
                    'label' => "serviceorders.label.closed",
                    'attr' => [
                        'title' => 'serviceorders.title.closed'
                    ]
                ])
                ->addModelTransformer(new DateTimeToStringTransformer(null, null, 'Y-m-d H:i'))
            )
            ->add(
                $builder->create('receipt', HiddenType::class, [
                    'required' => false,
                    'label' => "serviceorders.label.receipt",
                    'attr' => [
                        'title' => 'serviceorders.title.receipt'
                    ]
                ])
                ->addModelTransformer(new DateTimeToStringTransformer(null, null, 'Y-m-d H:i'))
            )
            ->add(
                $builder->create('paid', HiddenType::class, [
                    'required' => false,
                    'label' => "serviceorders.label.paid",
                    'attr' => [
                        'title' => 'serviceorders.title.paid'
                    ]
                ])
                ->addModelTransformer(new DateTimeToStringTransformer(null, null, 'Y-m-d H:i'))
            )
            ->add('bill', TextType::class, [
                'required' => false,
                'label' => 'serviceorders.label.bill',
                'attr' => [
                    'title' => 'serviceorders.title.bill'
                ]
            ]) 
            ->add('value', HiddenType::class, [
                'label' => "serviceorders.label.value",
                'attr' => [
                    'data-type' => 'float',
                    'title' => 'serviceorders.title.value',
                    'data-options' => json_encode([
                        'widget' => [
                            'type' => 'nettoinput',
                            'options' => [
                                'edit' => false,
                                'disp' => true
                            ]
                        ],
                    ])
                    
                ]
            ])
                
            ->add('title', TextType::class, [
                'required' => true,
                'label' => 'serviceorders.label.title',
                'attr' => [
                    'title' => 'serviceorders.title.title'
                ]
            ]) 
            ->add('description', TextareaType::class, [
                'required' => false,
                'label' => 'serviceorders.label.description',
                'attr' => [
                    'title' => 'serviceorders.title.description'
                ]
            ]) 
            ->add('accessory', TextareaType::class, [
                'required' => false,
                'label' => 'serviceorders.label.accessory',
                'attr' => [
                    'title' => 'serviceorders.title.accessory'
                ]
            ]) 
            ->add('services', CollectionType::class, [
                'entry_type'   => ServicesType::class,
                'entry_options'=> [
                    'service_order' => true,
                    'form_admin' => $options['form_admin'],  
                    'em' => $options['em'],
                    'label' => false,
                    'entities_settings' => $options['entities_settings']
                ],
                'attr' => [
                    'data-prototype-name' => '__pn__'                    
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
            ->add('externalServices', CollectionType::class, [
                'entry_type'   => ExternalServicesType::class,
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
            ->add('materials', CollectionType::class, [
                'entry_type'   => MaterialsType::class,
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
            // 'cascade_validation' => true,
            'data_class' => 'AppBundle\Entity\ServiceOrders',
            'form_admin' => false,            
            'em' => null,
            'entities_settings' =>null,
            'translator' =>null,
            'client_choice' => false
        ]);
    }
    
    /**
     * {@inheritdoc}
     */
    public function buildView(FormView $view, FormInterface $form, array $options)
    {    
        parent::buildView($view, $form, $options);
        $view->vars['exp_buttons'] = [ 
            'agreement' => [
                'icon' => "assignment_ind",
                'action' => 'pdf',
                'd' => [
                    'exp' => 'agreement'
                ]
            ],
            'report' => [
                'icon' => "assignment",
                'action' => 'pdf',
                'd' => [
                    'exp' => 'report'
                ]
            ]
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function getBlockPrefix()
    {
        return 'appbundle_serviceOrders';
    }


}
