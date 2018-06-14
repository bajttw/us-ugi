<?php

namespace AppBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Doctrine\ORM\EntityRepository;
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\DataTransformer\DateTimeToStringTransformer;
use AppBundle\Form\DataTransformer\FloatTransformer;
class MaterialsType extends AbstractType
{
    
    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $delete=$options['method'] == 'DELETE';
        $builder
        ->add(
            $builder->create('used', TextType::class, [
                'label' => false,
                'attr' => [
                    'title' => 'materials.title.used',
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
        ->add('name', null, [
            'label' => false
            
        ])
        ->add('value', HiddenType::class, [
            'label' => false,
            'attr' => [
                'autocomplete'=>'off',
                'data-type' => 'float',
                'data-options' => json_encode([
                    'widget' => [
                        'type' => 'nettoinput',
                        'options' => [
                        ]
                    ],
                ])
            ]
        ])
        ->add('discount', null, [
            'label' => false,
            'attr' => [
                'min' => 0,
                'max' => 100,
                'title' => 'materials.title.discount',
                'autocomplete'=>'off',
                'data-type' => 'number'
            ]
        ])
        ->add('summary', HiddenType::class, [
            'required' => false, 
            'label' => false,
            'attr' => [
                'data-type' => 'float',
                'title' => 'materials.title.summary',
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
            'label' => "materials.label.description"
        ])
        ->add('warranty', null, [
            'label' => false,
            'attr' => [
                'min' => 0,
                'max' => 36,
                'title' => 'materials.title.warranty',
                'autocomplete'=>'off',
                'data-type' => 'number'
            ]
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
            'data_class' => 'AppBundle\Entity\Materials',
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
        return 'appbundle_materials';
    }


}
