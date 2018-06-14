<?php
namespace AppBundle\Form;

use AppBundle\Utils\Utils;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CollectionType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Form\FormView;
use Symfony\Component\OptionsResolver\OptionsResolver;

class UploadsType extends AbstractType
{
    //    private $om;

    //    public function __construct(ObjectManager $om) {
    //        $this->om = $om;
    //    }

    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        //        $transformer=new DataTransformer\UploadsToHiddenTransformer($options['em'], "SystemBundle\\Entity\\Uploads");
        //        $builder->addModelTransformer( $transformer );

    }

    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults(array(
            'en' => 'uploads',
            'entry_type' => EntityHiddenType::class,
            'entry_options' => [
                'entity_class' => "AppBundle\\Entity\\Uploads",
            ],
            'form_admin' => false,
            'allow_add' => true,
            'allow_delete' => true,
            'prototype' => true,
            'prototype_name' => '__un__',
            'by_reference' => false,
            'error_bubbling' => true,
            'attr' => [
                'data-options' => json_encode([
                    'disp' => true,
                    'control' => [
                        'text' => 'Z',
                    ],
                    'widget' => [
                        'type' => 'upload',
                        'options' => [
                            'multiple' => true,
                        ],
                    ],
                ]),
            ],
        ));
    }

    /**
     * {@inheritdoc}
     */
    public function buildView(FormView $view, FormInterface $form, array $options)
    {
        parent::buildView($view, $form, $options);
        $def_data_options = [
            'disp' => true,
            'control' => [
                'text' => 'Z',
            ],
            'widget' => [
                'type' => 'upload',
                'options' => [
                    'multiple' => true
                ]
            ]
        ];
        $data_options = Utils::deep_array_value(['attr', 'data-options'], $options);
        if ($data_options) {
            if (\is_string($data_options)) {
                $data_options = \json_decode($data_options);
            }
            $data_options = json_encode(\is_array($data_options) ? \array_replace_recursive($def_data_options, $data_options) : $def_data_options);
        } else {
            $data_options = json_encode($def_data_options);
        }

        $view->vars['attr']['data-options'] = $data_options;
        Utils::deep_array_value_set('title', $view->vars['attr'], $options['en'] . '.title.uploads');

        // $view->vars['attr']['data-form-fields'] = json_encode([ 'name', 'active', 'street', 'city', 'zipCode', 'nip', 'contact', 'tel', 'mobile', 'email', 'code', 'active', 'ways', 'nrOrderGenerator', 'clientNrOrder', 'nrOrder', 'clientNrOrderGenerator', 'uploads']);

    }
    public function getParent()
    {
        return CollectionType::class;
    }
    /**
     * {@inheritdoc}
     */
    public function getBlockPrefix()
    {
        return 'appbundle_uploads';
    }
}
