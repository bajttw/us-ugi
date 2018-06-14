<?php

namespace AppBundle\Entity;
use Doctrine\ORM\Mapping as ORM;

/**
 * Materials
 */
class Materials extends AppEntity
{
    const en='materials';
    const ec='Materials';

 // <editor-fold defaultstate="collapsed" desc="Fields utils">    
    public static $shortNames=[
        'id' => 'id',
        'used' => 'p',
        'name' => 'n',
        'description' => 'd',
        'value' => 'v',
        'discount' => 'ds',
        'summary' => 'sum',
        'warranty' => 'w',
        'childs' => [
            'serviceOrder' => 'ServiceOrders',
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
    private $used;

    /**
     * @var string
     */
    private $name;

    /**
     * @var string|null
     */
    private $description;

    /**
     * @var float|null
     */
    private $value = 0;

    /**
     * @var int|null
     */
    private $discount = 0;

    /**
     * @var float
     */
    private $summary = 0;

    /**
     * @var int
     */
    private $warranty = 0;

    /**
     * @var \AppBundle\Entity\ServiceOrders
     */
    private $serviceOrder;
 // </editor-fold>

    public function calc(){
        $this->summary=$this->value ? $this->value : 0;
        if($this->summary > 0 && $this->discount > 0){
            if($this->discount < 100){
                $this->summary=$this->summary*(100 - $this->discount)/100;
            }else{
                $this->summary=0;
            }
        }
        return $this->summary;
    }

 // <editor-fold defaultstate="collapsed" desc="Fields functions"> 
    /**
     * Get id.
     *
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }
  
    /**
     * Set used.
     *
     * @param \DateTime $used
     *
     * @return Materials
     */
    public function setUsed($used)
    {
        $this->used = $used;

        return $this;
    }

    /**
     * Get used.
     *
     * @return \DateTime
     */
    public function getUsed()
    {
        return $this->used;
    }

    /**
     * Set name.
     *
     * @param string $name
     *
     * @return Materials
     */
    public function setName($name)
    {
        $this->name = $name;

        return $this;
    }

    /**
     * Get name.
     *
     * @return string
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * Set description.
     *
     * @param string|null $description
     *
     * @return Materials
     */
    public function setDescription($description = null)
    {
        $this->description = $description;

        return $this;
    }

    /**
     * Get description.
     *
     * @return string|null
     */
    public function getDescription()
    {
        return $this->description;
    }

    /**
     * Set value.
     *
     * @param float|null $value
     *
     * @return Materials
     */
    public function setValue($value = null)
    {
        $this->value = $value;

        return $this;
    }

    /**
     * Get value.
     *
     * @return float|null
     */
    public function getValue()
    {
        return $this->value;
    }

    /**
     * Set discount.
     *
     * @param int|null $discount
     *
     * @return Materials
     */
    public function setDiscount($discount = null)
    {
        $this->discount = $discount;

        return $this;
    }

    /**
     * Get discount.
     *
     * @return int|null
     */
    public function getDiscount()
    {
        return $this->discount;
    }

    /**
     * Set summary.
     *
     * @param float $summary
     *
     * @return Materials
     */
    public function setSummary($summary)
    {
        $this->summary = $summary;

        return $this;
    }

    /**
     * Get summary.
     *
     * @return float
     */
    public function getSummary()
    {
        return $this->summary;
    }

    /**
     * Set warranty.
     *
     * @param int $warranty
     *
     * @return Materials
     */
    public function setWarranty($warranty)
    {
        $this->warranty = $warranty;

        return $this;
    }

    /**
     * Get warranty.
     *
     * @return int
     */
    public function getWarranty()
    {
        return $this->warranty;
    }

    /**
     * Set serviceOrder.
     *
     * @param \AppBundle\Entity\ServiceOrders|null $serviceOrder
     *
     * @return Materials
     */
    public function setServiceOrder(\AppBundle\Entity\ServiceOrders $serviceOrder = null)
    {
        $this->serviceOrder = $serviceOrder;

        return $this;
    }

    /**
     * Get serviceOrder.
     *
     * @return \AppBundle\Entity\ServiceOrders|null
     */
    public function getServiceOrder()
    {
        return $this->serviceOrder;
    }
 // </editor-fold>


    /**
     * @ORM\PrePersist
     */
    public function prePersistMaterials()
    {
        if(is_null($this->used)){
            $this->used=new \DateTime();
        }
        $this->calc();
    }
}
