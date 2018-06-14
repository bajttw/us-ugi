<?php
namespace AppBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Doctrine\Common\Persistence\ObjectManager;
use AppBundle\Form\DataTransformer\EntityToHiddenTransformer;
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
use AppBundle\Utils\Utils;

class EntityHiddenType extends AbstractType
{
    /**
     * @var ObjectManager
     */
    private $objectManager;
    
    /**
     * @var string
     */
    private $customBlockPrefix;

    /**
     * {@inheritdoc}
     */
    public function __construct(ObjectManager $objectManager)
    {
        $this->objectManager = $objectManager;
    }

    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $this->customBlockPrefix = Utils::deep_array_value('block_prefix', $options);
        $builder->addModelTransformer(new EntityToHiddenTransformer($this->objectManager, $options['entity_class'], $options['get_data_options']));
    }
    
    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver
            ->setRequired(['entity_class'])
            ->setDefaults([
                'block_prefix' => null,
                'get_data_options' => [],
                'invalid_message' => 'The entity does not exist.',
                'attr' => [
                    'data-type' => 'json'
                ]
        ]);
    }

    /**
     * {@inheritdoc}
     */
    public function getParent()
    {
        return HiddenType::class;
    }

    /**
     * {@inheritdoc}
     */
    public function getBlockPrefix()
    {
        return $this->customBlockPrefix ? $this->customBlockPrefix : 'entity_hidden';
    }
    
}
