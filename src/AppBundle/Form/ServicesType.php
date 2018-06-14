<?php

namespace AppBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Doctrine\ORM\EntityRepository;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\DataTransformer\DateTimeToStringTransformer;
use AppBundle\Form\DataTransformer\FloatTransformer;
class ServicesType extends AbstractType
{
    
    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $delete=$options['method'] == 'DELETE';
        if(!$options['service_order']){
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
                                ->andWhere('c.regular = true')
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
                            ]
                        ])    
                    ],
                ]);
            }
            $builder->add('serviceOrderId', HiddenType::class, [
                'required' => false,
                'label' => 'services.label.serviceOrder',
                'attr' =>   [
                    'title' => 'services.title.serviceOrder',
                    'data-options' => json_encode([
                        'widget' => [
                            'type' => 'combobox',
                            'options' => [
                                'dictionary' => $options['service_orders_dic'],
                                'customItems' => [
                                    'items' => [
                                        [
                                            'v' => '-',
                                            'n' => 'nowe zlecenie'
                                        ]
                                    ]
                                ]
                            ]
                        ]
                    ])    
                ]
            ])
            ->add('serviceOrderType', HiddenType::class, [
                'required' => false,
                'label' => 'services.label.serviceOrderType',
                'attr' =>   [
                    'title' => 'services.title.serviceOrderType',
                    'data-options' => json_encode([
                        'widget' => [
                            'type' => 'combobox',
                            'options' => [
                                'dictionary' => $options['service_order_types'],
                                'customItems' => [
                                    'items' => [
                                        [
                                            'v' => '-',
                                            'n' => 'dowolny'
                                        ]
                                    ]
                                ]
                                
                            ]
                        ]
                    ])    
                ]
            ]);
        }       
        $builder
            ->add(
                $builder->create('performed', TextType::class, [
                    'label' => $options['service_order'] ? false : "services.label.performed",
                    'attr' => [
                        'title' => 'services.title.performed',
                        'data-options' => json_encode([
                            'widget' => [
                                'type' => 'datepicker',
                                'options' => [
                                    'locale' => [
                                        'format' => 'YYYY-MM-DD HH:mm'
                                    ],
                                    'startDate' => true,
                                    'timePicker' =>  true,
                                    'timePicker24Hour' => true
    
                                ]
                            ],
                        ])
                    ]
                ])
                ->addModelTransformer(new DateTimeToStringTransformer(null, null, 'Y-m-d H:i'))
            )
            ->add('title', null, [
                'label' => $options['service_order'] ? false : "services.label.title",
                'attr' => [
                    'data-name' => 'title',
                    'data-edit' => '1'
                ]            
            ])
            ->add('options', HiddenType::class, [ 
                'required' => false, 
                'attr' => [
                    'title' => 'services.title.options',
                    'data-type' => 'ajson'
                ],
                // 'data-options' => json_encode([
                //     type
                // ]),
                'label' => "services.label.options"
            ])
            ->add('value', TextType::class, [
                'label' => $options['service_order'] ? false : "services.label.value",
                'attr' => [
                    'autocomplete'=>'off',
                    'data-type' => 'float',
                    'data-name' => 'value',
                    'data-edit' => '1',
                    'data-options' => json_encode([
                        "autocorrect" => true,
                        'widget' => [
                            'type' => 'nettoinput',
                            'options' => [
                            ]
                        ]
                    ])
                ]
            ])
            ->add('discount', null, [
                'label' => $options['service_order'] ? false : "services.label.discount",
                'attr' => [
                    'min' => 0,
                    'max' => 100,
                    'title' => 'services.title.discount',
                    'autocomplete'=>'off',
                    'data-type' => 'number'
                ]
            ])
            ->add('duration', null, [
                'label' => $options['service_order'] ? false : "services.label.duration",
                'attr' => [
                    'title' => 'services.title.duration',
                    'autocomplete'=>'off',
                    'data-type' => 'number'
                ]
            ])
            ->add('summary', HiddenType::class, [
                'required' => false, 
                'label' => $options['service_order'] ? false : "services.label.summary",
                'attr' => [
                    'data-type' => 'float',
                    'title' => 'services.title.summary',
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
            ->add('description', null, [
                'label' => "services.label.description"
            ])
            ->add('details', null, [
                'label' => "services.label.details"
            ])
       ;
       foreach(['value', 'summary'] as $n){
           $builder->get($n)->addModelTransformer(new FloatTransformer());
       }
    }
    
    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => 'AppBundle\Entity\Services',
			'cascade_validation' => true,
			'form_admin' => false,            
            'em' => null,
            'entities_settings' =>null,
            'translator' =>null,
            'service_order' => false,
            'service_orders_dic' => null,
            'service_order_types' => null,
            // 'clients_dic' => null,
            'client_choice' => false           
        ]);
    }

    /**
     * {@inheritdoc}
     */
    public function getBlockPrefix()
    {
        return 'appbundle_services';
    }


}
