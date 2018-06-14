<?php

namespace AppBundle\Form;

use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Component\Form\Extension\Core\Type\RepeatedType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Form\FormView;
use Symfony\Component\OptionsResolver\OptionsResolver;

class UsersType extends AbstractType
{
    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $admin = ($options['form_admin'] ? '1' : '0');

        $builder
            ->add('enabled', SwitchType::class, [
                'label' => "users.label.enabled",
                'entity_name' => 'users',
            ])
            // ->add('name', null, ['label' => 'users.label.name'])
            ->add('usernameCanonical', null, ['label' => 'users.label.usernameCanonical'])
            ->add('username', null, ['label' => 'users.label.username'])
            ->add('email', EmailType::class, ['label' => 'users.label.email'])
            ->add('plainPassword', RepeatedType::class, [
                'type' => PasswordType::class,
                'options' => array('attr' => array('class' => 'password-field')),
                'required' => false,
                'first_options' => [
                    'label' => 'users.label.password',
                    'attr' => [
                        'placeholder' => 'users.label.password',
                    ]
                ],
                'second_options' => [
                    'label' => 'users.label.password_confirmation',
                    'attr' => [
                        'placeholder' => 'users.label.password_confirmation',
                    ]
                ],
                'invalid_message' => 'users.label.password_mismatch',
            ])
            ->add('clients', EntityType::class, [
                'class' => 'AppBundle:Clients',
                'label' => 'users.label.clients',
                'required' => false,
                'choice_label' => 'name',
                'multiple' => true,
                'attr' => [
                    'data-options' => json_encode([
                        'widget' => [
                            'type' => 'multiselect',
                        ]
                    ])
                ]
            ]);

        if ($admin) {
            $builder
                ->add('roles', ChoiceType::class, [
                    'label' => "users.label.roles",
                    'choices' => [
                        'users.label.role_user' => 'ROLE_USER',
                        'users.label.role_admin' => 'ROLE_ADMIN',
                        'users.label.role_super_admin' => 'ROLE_SUPER_ADMIN'
                    ],
                    'multiple' => true,
                    'attr' => [
                        'data-options' => json_encode([
                            'widget' => [
                                'type' => 'multiselect'
                            ]
                        ])
                    ]
                ])
                ->add('userGroups', EntityType::class, [
                    'class' => 'AppBundle:UsersGroups',
                    'label' => "users.label.userGroups",
                    'required' => false,
                    'choice_label' => 'name',
                    'multiple' => true,
                    'attr' => [
                        'data-options' => json_encode([
                            'widget' => [
                                'type' => 'multiselect'
                            ]
                        ])
                    ]
                ]);

        }
    }

    /**
     * {@inheritdoc}
     */
    public function buildView(FormView $view, FormInterface $form, array $options)
    {
        parent::buildView($view, $form, $options);
        $view->vars['attr']['data-form-fields'] = json_encode(['name', 'username', 'usernameCanonical', 'email', 'plainPassword_first', 'roles', 'enabled', 'clients', 'type', 'userGroups']);
    }

    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults(array(
            'data_class' => 'AppBundle\Entity\Users',
            'form_admin' => false,
            'em' => null,
            'translator' => null,
            'entities_settings' => null
        ));
    }

    /**
     * {@inheritdoc}
     */
    public function getBlockPrefix()
    {
        return 'appbundle_users';
    }
}
