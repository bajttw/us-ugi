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
class ServiceOptionsType extends AbstractType
{
    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $delete=$options['method'] == 'DELETE';
        $builder
            ->add('name', null, [
                'label' => "serviceoptions.label.name"
                
            ])
            ->add('description', null, [ 
                'required' => false, 
                'label' => "serviceoptions.label.description"
            ])
            ->add('type', null , [
                'label' => "serviceoptions.label.type",
                'attr' => [
                    'title' => 'serviceoptions.title.type',
                    'data-options' => json_encode([
                        'widget' => [
                            'type' => 'combobox',
                            'options' => [
                            ]
                        ]
                    ])
                ]    
            ])
            ->add('value', null, [
                'label' => "serviceoptions.label.value",
                'attr' => [
                    'autocomplete'=>'off',
                    'data-type' => 'float',
                    'data-options' => json_encode([
                        'check_key' => '1'
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
            'data_class' => 'AppBundle\Entity\ServiceOptions',
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
        $view->vars['attr']['data-form-fields'] = json_encode([ 'name', 'description', [ 'name' => 'type', 'options' => ['dictionary' => true ]], 'value' ]);
    }
    
    /**
     * {@inheritdoc}
     */
    public function getBlockPrefix()
    {
        return 'appbundle_serviceOptions';
    }


}
