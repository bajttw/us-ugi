<?php

namespace AppBundle\Entity;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;

/**
 * Payments
 */
class Payments extends AppEntity
{
    const en='payments';
    const ec='Payments';

 // <editor-fold defaultstate="collapsed" desc="Fields utils">    
    public static $shortNames=[
        'id' => 'id',
        'performed' => 'p',
        'type' => 't',
        'description' => 'd',
        'value' => 'v',
        'childs' => [
            'serviceOrder' => 'ServiceOrders',
            'notes' => 'Notes'
        ]
    ];
 // </editor-fold>  

 // <editor-fold defaultstate="collapsed" desc="Variables"> 
    /**
     * @var integer
     */
    private $id;

    /**
     * @var \DateTime
     */
    private $performed;

    /**
     * @var integer
     */
    private $type = 0;

    /**
     * @var string
     */
    private $description;

    /**
     * @var float
     */
    private $value = 0;

    /**
     * @var \AppBundle\Entity\ServiceOrders
     */
    private $serviceOrder;

    /**
     * @var \Doctrine\Common\Collections\Collection
     */
    private $notes;
 // </editor-fold>  

    /**
     * Constructor
     */
    public function __construct($options=[])
    {
        $this->notes = new ArrayCollection();
        parent::__construct($options);
    }

 // <editor-fold defaultstate="collapsed" desc="Fields functions"> 
    /**
     * Get id
     *
     * @return integer
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Set performed
     *
     * @param \DateTime $performed
     *
     * @return Payments
     */
    public function setPerformed($performed)
    {
        $this->performed = $performed;

        return $this;
    }

    /**
     * Get performed
     *
     * @return \DateTime
     */
    public function getPerformed()
    {
        return $this->performed;
    }

    /**
     * Set type
     *
     * @param integer $type
     *
     * @return Payments
     */
    public function setType($type)
    {
        $this->type = $type;

        return $this;
    }

    /**
     * Get type
     *
     * @return integer
     */
    public function getType()
    {
        return $this->type;
    }

    /**
     * Set description
     *
     * @param string $description
     *
     * @return Payments
     */
    public function setDescription($description)
    {
        $this->description = $description;

        return $this;
    }

    /**
     * Get description
     *
     * @return string
     */
    public function getDescription()
    {
        return $this->description;
    }

    /**
     * Set value
     *
     * @param float $value
     *
     * @return Payments
     */
    public function setValue($value)
    {
        $this->value = $value;

        return $this;
    }

    /**
     * Get value
     *
     * @return float
     */
    public function getValue()
    {
        return $this->value;
    }

    /**
     * Set serviceOrder
     *
     * @param \AppBundle\Entity\ServiceOrders $serviceOrder
     *
     * @return Payments
     */
    public function setServiceOrder(\AppBundle\Entity\ServiceOrders $serviceOrder = null)
    {
        $this->serviceOrder = $serviceOrder;

        return $this;
    }

    /**
     * Get serviceOrder
     *
     * @return \AppBundle\Entity\ServiceOrders
     */
    public function getServiceOrder()
    {
        return $this->serviceOrder;
    }

    /**
     * Add note
     *
     * @param \AppBundle\Entity\Notes $note
     *
     * @return Payments
     */
    public function addNote(\AppBundle\Entity\Notes $note)
    {
        $this->notes[] = $note;

        return $this;
    }

    /**
     * Remove note
     *
     * @param \AppBundle\Entity\Notes $note
     */
    public function removeNote(\AppBundle\Entity\Notes $note)
    {
        $this->notes->removeElement($note);
    }

    /**
     * Get notes
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getNotes()
    {
        return $this->notes;
    }
 // </editor-fold>

    /**
     * @ORM\PrePersist
     */
    public function prePersistPayments()
    {
        if(is_null($this->performed)){
            $this->performed=new \DateTime();
        }
    }

    /**
     * @ORM\PreUpdate
     */
    public function preUpdatePayments()
    {
        // Add your code here
    }
}
