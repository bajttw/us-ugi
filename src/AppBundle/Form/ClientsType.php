<?php

namespace AppBundle\Form;

use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Form\FormView;
use Symfony\Component\OptionsResolver\OptionsResolver;

class ClientsType extends AbstractType
{
    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('name', null, [
                'label' => 'clients.label.name',
            ])
            ->add('street', null, [
                'label' => 'clients.label.street',
            ])
            ->add('city', null, [
                'label' => 'clients.label.city',
            ])
            ->add('zipCode', null, [
                'label' => 'clients.label.zipCode',
            ])
            ->add('nip', null, [
                'label' => 'clients.label.nip',
            ])
            ->add('contact', null, [
                'label' => 'clients.label.contact',
            ])
            ->add('tel', null, [
                'label' => 'clients.label.tel',
            ])
            ->add('mobile', null, [
                'label' => 'clients.label.mobile',
                'required' => false,
            ])
            ->add('email', EmailType::class, [
                'required' => false,
                'label' => 'clients.label.email',
            ])
        ;
        if ($options['form_admin']) {
            $builder
                ->add('code', null, [
                    'label' => 'clients.label.code',
                    'attr' => [
                        'class' => 'text-uppercase',
                    ],
                ])
                ->add('active', SwitchType::class, [
                    'label' => "clients.label.active",
                    'entity_name' => 'clients',
                ])
                ->add('regular', CheckboxType::class, [
                    'required' => false,
                    'label' => "clients.label.regular",
                    'label_attr' => [
                        'class' => 'checkbox-inline',
                    ],
                    'attr' => [
                        'data-options' => json_encode([
                            'widget' => [
                                'type' => 'switch',
                                'options' => [
                                    'onColor' => 'info',
                                    'offColor' => 'default',
                                    'onText' => 'tak',
                                    'offText' => 'nie',
                                ],
                            ],
                        ]),
                    ],
                ])
                ->add('clientGroups', EntityType::class, [
                    'class' => 'AppBundle\\Entity\\ClientsGroups',
                    'label' => 'clients.label.clientGroups',
                    'required' => false,
                    'choice_label' => 'name',
                    'multiple' => true,
                    'attr' => [
                        'data-options' => json_encode([
                            'widget' => [
                                'type' => 'multiselect',
                            ],
                        ]),
                    ],
                ])
            ;

        };
    }

    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => 'AppBundle\Entity\Clients',
            'form_admin' => false,
            'em' => null,
            'entities_settings' => null,
            'translator' => null,

        ]);
    }

    /**
     * {@inheritdoc}
     */
    public function buildView(FormView $view, FormInterface $form, array $options)
    {
        parent::buildView($view, $form, $options);
        $view->vars['attr']['data-form-fields'] = json_encode(['name', 'active', 'street', 'city', 'zipCode', 'nip', 'contact', 'tel', 'mobile', 'email', 'code', 'regular', 'clientGroups']);
    }

    /**
     * {@inheritdoc}
     */
    public function getBlockPrefix()
    {
        return 'appbundle_clients';
    }
}
