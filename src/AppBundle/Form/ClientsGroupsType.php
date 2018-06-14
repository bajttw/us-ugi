<?php

namespace AppBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Form\FormView;

class ClientsGroupsType extends AbstractType
{
    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $delete = $options['method'] == 'DELETE';
        $builder
            ->add('name', null, ['label' => "clientsgroups.label.name"])
            ->add('code', null, ['label' => "clientsgroups.label.name"])
            ->add('description', null, ['label' => "clientsgroups.label.description"])
        ;
    }

    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => 'AppBundle\Entity\ClientsGroups',
            'form_admin' => false,
            'em' => null,
            'entities_settings' => null,
            'translator' => null,
        ]);
    }

    /**
     * {@inheritdoc}
     */
    public function getBlockPrefix()
    {
        return 'appbundle_clientsgroups';
    }

}
