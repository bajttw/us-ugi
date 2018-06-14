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

class ExternalServicesType extends AbstractType
{
    
    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $delete=$options['method'] == 'DELETE';
        $builder->add('subcontractor', EntityType::class, [
            'label' => false,
            'class' => 'AppBundle:Subcontractors',
            'choice_label' => 'name',   
            'placeholder' => 'externalservices.label.subcontractorChoice',                
            'attr' =>   [
                'title' => 'externalservices.title.subcontractorChoice',
                'data-options' => json_encode([
                    'widget' => [
                        'type' => 'combobox'
                    ]
                ])    
            ],
            'query_builder' => function (EntityRepository $er) {
                return $er->createQueryBuilder('c')
                        ->where('c.active = true')
                    ->orderBy('c.name', 'ASC');
            }                
        ])
        ->add(
            $builder->create('consigned', TextType::class, [
                'label' => false,
                'attr' => [
                    'title' => 'externalservices.title.consigned',
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
        ->add(
            $builder->create('returned', TextType::class, [
                'label' => false,
                'required' => false,
                'attr' => [
                    'title' => 'externalservices.title.returned',
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
        ->add('number', null, [
            'label' => false,
            'required' => false,
            'attr' => [
                'title' => 'externalservices.title.number',
            ]
        ])
        ->add('cost', null, [
            'label' => false,
            'required' => false,
            'attr' => [
                'title' => 'externalservices.title.cost',
                'autocomplete'=>'off',
                'data-type' => 'float',
                'data-options' => json_encode([
                    'widget' => [
                        'type' => 'nettoinput',
                        'options' => [
                        ]
                    ]
                ])
        ]
        ])
        ->add('cartage', null, [
            'label' => false,
            'required' => false,
            'attr' => [
                'title' => 'externalservices.title.cartage',
                'autocomplete'=>'off',
                'data-type' => 'float',
                'data-options' => json_encode([
                    'widget' => [
                        'type' => 'nettoinput',
                        'options' => [
                        ]
                    ]
                ])
        ]
        ])
        ->add('serviceCharge', null, [
            'label' => false,
            'required' => false,
            'attr' => [
                'title' => 'externalservices.title.serviceCharge',
                'autocomplete'=>'off',
                'data-type' => 'float',
                'data-options' => json_encode([
                    'widget' => [
                        'type' => 'nettoinput',
                        'options' => [
                        ]
                    ]
                ])
        ]
        ])
        ->add('discount', null, [
            'label' => false,
            'required' => false,
            'attr' => [
                'min' => 0,
                'max' => 100,
                'title' => 'externalservices.title.discount',
                'autocomplete'=>'off',
                'data-type' => 'number',
                // 'data-options' => json_encode([
                //     'check_key' => '1'
                // ])
            ]
        ])
        ->add('summary', HiddenType::class, [
            'required' => false, 
            'label' => false,
            'attr' => [
                'data-type' => 'float',
                'title' => 'externalservices.title.summary',
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
            'required' => false,
            'label' => "services.label.description"
        ])
       ;
       foreach(['cost', 'cartage', 'serviceCharge', 'summary' ] as $n){
            $builder->get($n)->addModelTransformer(new FloatTransformer());
        }

    }
    
    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => 'AppBundle\Entity\ExternalServices',
			'cascade_validation' => true,
			'form_admin' => false,            
            'em' => null,
            'entities_settings' =>null,
            'translator' =>null,
        ]);
    }

    /**
     * {@inheritdoc}
     */
    public function getBlockPrefix()
    {
        return 'appbundle_externalServices';
    }


}
