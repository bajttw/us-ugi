<?php

namespace AppBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Form\FormView;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;

class SubcontractorsType extends AbstractType
{
    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('name', null, [
                'label' => 'subcontractors.label.name'
            ])
            ->add('street', null, [
                'label' => 'subcontractors.label.street'
            ])
            ->add('city', null, [
                'label' => 'subcontractors.label.city'
            ])
            ->add('zipCode', null, [
                'label' => 'subcontractors.label.zipCode'
            ])
            ->add('contact', null, [
                'label' => 'subcontractors.label.contact'
            ])
            ->add('tel', null, [
                'label' => 'subcontractors.label.tel'
            ])
            ->add('email', EmailType::class, [
                'required' => false,
                'label' => 'subcontractors.label.email'
            ])
        ;
        if ($options['form_admin']){
            $builder
            ->add('active', SwitchType::class, [ 
                'label' => "subcontractors.label.active",
                'entity_name' => 'subcontractors'
            ]);
            
        };
    }

    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => 'AppBundle\Entity\Subcontractors',
            'form_admin' => false,            
            'em' => null,
            'entities_settings' =>null,
            'translator' =>null
            
        ]);
    }

    /**
     * {@inheritdoc}
     */
    public function buildView(FormView $view, FormInterface $form, array $options)
    {    
        parent::buildView($view, $form, $options);
        $view->vars['attr']['data-form-fields'] = json_encode([ 'name', 'active', 'street', 'city', 'zipCode', 'contact', 'tel', 'email']);
    }
    
    /**
     * {@inheritdoc}
     */
    public function getBlockPrefix()
    {
        return 'appbundle_subcontractors';
    }
}
