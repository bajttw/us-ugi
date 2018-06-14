<?php

namespace AppBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Form\FormView;

use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
use Symfony\Component\Form\Extension\Core\DataTransformer\DateTimeToStringTransformer;
class ServiceCatalogType extends AbstractType
{
    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $delete=$options['method'] == 'DELETE';
        $builder
            ->add('title', null, [
                'label' => "servicecatalog.label.title"
                
            ])
            ->add('description', null, [ 
                'required' => false, 
                'label' => "servicecatalog.label.description"
            ])
            ->add('value', HiddenType::class, [
                'label' => "servicecatalog.label.value",
                'attr' => [
                    'autocomplete'=>'off',
                    'data-type' => 'float',
                    'data-options' => json_encode([
                        'check_key' => '1',
                        'widget' => [
                            'type' => 'nettoinput',
                            'options' => [
                            ]
                        ]
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
            'data_class' => 'AppBundle\Entity\ServiceCatalog',
            'form_admin' => false,            
            'em' => null,
            'entities_settings' =>null,
            'translator' =>null,
        ]);
    }

    /**
     * {@inheritdoc}
     */
    public function buildView(FormView $view, FormInterface $form, array $options)
    {    
        parent::buildView($view, $form, $options);
        $view->vars['attr']['data-form-fields'] = json_encode([ 'title', 'description', 'value' ]);
    }
    
    /**
     * {@inheritdoc}
     */
    public function getBlockPrefix()
    {
        return 'appbundle_serviceCatalog';
    }


}
