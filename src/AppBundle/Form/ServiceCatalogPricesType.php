<?php

namespace AppBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Doctrine\ORM\EntityRepository;
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\DataTransformer\DateTimeToStringTransformer;
class ServiceCatalogPricesType extends AbstractType
{
    
    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $delete=$options['method'] == 'DELETE';
        $builder->add('serviceCatalog', EntityHiddenType::class, [
            'class' => "AppBundle:ServiceCatalog",
            'label' => false,
            'attr' => [
                'readonly' => 'readonly',
                'title' => 'servicecatalogprices.title.serviceCatalog',
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
            'data_class' => 'AppBundle\Entity\ServiceCatalogPrices',
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
        return 'appbundle_serviceCatalogPrices';
    }


}
