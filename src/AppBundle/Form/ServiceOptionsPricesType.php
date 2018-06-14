<?php

namespace AppBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Doctrine\ORM\EntityRepository;
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\DataTransformer\DateTimeToStringTransformer;
class ServiceOptionsPricesType extends AbstractType
{
    
    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $delete=$options['method'] == 'DELETE';
        $builder->add('serviceOption', EntityHiddenType::class, [
            'class' => "AppBundle:ServiceOptions",
            'label' => false,
            'attr' => [
                'readonly' => 'readonly',
                'title' => 'serviceoptionsprices.title.serviceOptions',
                'data-type' => 'json',
                'data-options' => json_encode([
                    'disp' => [
                        'type' => 'n'
                    ]
                ])    
            ],
        ])
        ->add('value', null, [
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
       ;
    }
    
    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => 'AppBundle\Entity\ServiceOptionsPrices',
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
        return 'appbundle_serviceOptionsPrices';
    }


}
