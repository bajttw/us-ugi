<?php

namespace AppBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class UsersGroupsType extends AbstractType
{
    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $delete = $options['method'] == 'DELETE';
        $builder
            ->add('name', null, ['label' => "usersgroups.label.name"])
            ->add('code', null, ['label' => "usersgroups.label.code"])
            ->add('description', null, ['label' => "usersgroups.label.description"])
        ;
    }

    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => 'AppBundle\Entity\UsersGroups',
            'form_admin' => false,
            'em' => null,
            'entities_settings' => null,
            'translator' => null
        ]);
    }

    /**
     * {@inheritdoc}
     */
    public function getBlockPrefix()
    {
        return 'appbundle_usersgroups';
    }

}
