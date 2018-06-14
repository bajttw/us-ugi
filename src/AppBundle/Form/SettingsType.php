<?php

namespace AppBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Form\FormView;
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
use Symfony\Component\OptionsResolver\OptionsResolver;

class SettingsType extends AbstractType
{
    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $delete = $options['method'] == 'DELETE';
        $builder
            ->add('client', EntityHiddenType::class, [
                'entity_class' => "AppBundle\\Entity\\Clients",
                'required' => false,
                'attr' => [
                    'readonly' => 'readonly',
                    'data-type' => 'json',
                    'data-options' => json_encode([
                        'disp' => [
                            'type' => 'n',
                        ],
                    ]),
                ],
            ])
            ->add('name', null, ['label' => "settings.label.name"])
            ->add('value', null, [
                'label' => "settings.label.value",
                'attr' => [
                    'data-options' => json_encode([
                        'widget' => [
                            'type' => 'jsonedit',
                        ],
                    ]),
                ],
            ])
            ->add('description', null, ['label' => "settings.label.description"])
        ;
    }

    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => 'AppBundle\Entity\Settings',
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
        $view->vars['attr']['data-form-fields'] = json_encode(['client', 'name', 'value', 'description']);
    }

    /**
     * {@inheritdoc}
     */
    public function getBlockPrefix()
    {
        return 'appbundle_settings';
    }

}
