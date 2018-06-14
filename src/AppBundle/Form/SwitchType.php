<?php
namespace AppBundle\Form;

use AppBundle\Utils\Utils;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Form\FormView;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Translation\TranslatorInterface;

class SwitchType extends AbstractType
{
    private $translator;
    public function __construct(TranslatorInterface $translator)
    {
        $this->translator = $translator;
    }
    /**
     * {@inheritdoc}
     */
    public function buildView(FormView $view, FormInterface $form, array $options)
    {
        $trans_prefix = $options['entity_name'] ? $options['entity_name'] . '.' : '';
        $data_opt = [];
        if (Utils::deep_array_key_exists('attr.data-options', $options, '.')) {
            $data_opt = \json_decode($options['attr']['data-options'], true);
        }
        $view->vars['attr'] = \array_replace_recursive($view->vars['attr'], [
            'data-type' => 'bool',
            'data-options' => json_encode(
                array_replace_recursive(
                    [
                        'widget' => [
                            'type' => 'switch',
                            'options' => [
                                'onColor' => 'info',
                                'offColor' => 'default',
                                'onText' => $this->translator->trans($trans_prefix . 'label.' . $view->vars['name'] . '_yes'),
                                'offText' => $this->translator->trans($trans_prefix . 'label.' . $view->vars['name'] . '_no'),
                                'inverse' => true,
                            ],
                        ],
                    ],
                    $data_opt
                )
            )
        ]);
    }

    public function buildForm(FormBuilderInterface $builder, array $options)
    {
    }

    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {

        $resolver->setDefaults([
            'entity_name' => null,
            'required' => false,
            'label_attr' => [
                'class' => 'checkbox-inline'
            ]
        ]);
    }

    public function getParent()
    {
        return CheckBoxType::class;
    }

    /**
     * {@inheritdoc}
     */
    public function getBlockPrefix()
    {
        return 'switch';
    }

}
