<?php

namespace AppBundle\Entity;
use Doctrine\ORM\Mapping as ORM;

/**
 * ExternalServices
 */
class ExternalServices extends AppEntity
{
    const en='externalservices';
    const ec='ExternalServices';
 
 //  <editor-fold defaultstate="collapsed" desc="Fields utils">    
    public static $shortNames=[
        'id' => 'id',
        'number' => 'nr',
        'consigned' => 'c',
        'returned' => 'r',
        'description' => 'd',
        'cost' => 'c',
        'cartage' => 'cc',
        'serviceCharge' => 'csc',
        'discount' => 'ds',
        'summary' => 's',
        'childs' => [
            'subcontractor' => 'Subcontractors',
            'serviceOrder' => 'ServiceOrders'
        ]
    ];

    public static function getFields( $type=null){
        $fields=[];
        switch($type){
            case 'active':
                $fields=[ 'id', 'title' ];
            break;
            case 'list':
                $fields= [
                    'id',
                    'number',
                    [ 
                        'name' => 'consigned',
                        'prefix' => 'DATE_FORMAT(',
                        'sufix' => ", '%Y-%m-%d')"
                    ],
                    [ 
                        'name' => 'returned',
                        'prefix' => 'DATE_FORMAT(',
                        'sufix' => ", '%Y-%m-%d')"
                    ],                    
                    'number',
                    'description',
                    'cost',
                    'cartage',
                    'serviceCharge'
                ];
            break;
            default:
                $fields= parent::getFields($type);
        }
        return $fields;
    }  
 // </editor-fold>  

 // <editor-fold defaultstate="collapsed" desc="Variables"> 
    /**
     * @var integer
     */
    private $id;

    /**
     * @var string
     */
    private $number;

    /**
     * @var \DateTime
     */
    private $consigned;

    /**
     * @var \DateTime
     */
    private $returned;

    /**
     * @var string
     */
    private $description;

    /**
     * @var float
     */
    private $cost = 0;

    /**
     * @var float
     */
    private $cartage = 0;

    /**
     * @var float
     */
    private $serviceCharge = 0;

    /**
     * @var integer
     */
    private $discount = 0;
    
    /**
     * @var float
     */
    private $summary = 0;
    
    /**
     * @var \AppBundle\Entity\Subcontractors
     */
    private $subcontractor;

    /**
     * @var \AppBundle\Entity\ServiceOrders
     */
    private $serviceOrder;
 // </editor-fold>

    public function calc(){
        $this->summary=0;
        foreach(['cost', 'cartage', 'serviceCharge'] as $fn){
            $this->summary+=$this->$fn ? $this->$fn : 0;
        }
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
     * Get id
     *
     * @return integer
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Set number
     *
     * @param string $number
     *
     * @return ExternalServices
     */
    public function setNumber($number)
    {
        $this->number = $number;

        return $this;
    }

    /**
     * Get number
     *
     * @return string
     */
    public function getNumber()
    {
        return $this->number;
    }

    /**
     * Set consigned
     *
     * @param \DateTime $consigned
     *
     * @return ExternalServices
     */
    public function setConsigned($consigned)
    {
        $this->consigned = $consigned;

        return $this;
    }

    /**
     * Get consigned
     *
     * @return \DateTime
     */
    public function getConsigned()
    {
        return $this->consigned;
    }

    /**
     * Set returned
     *
     * @param \DateTime $returned
     *
     * @return ExternalServices
     */
    public function setReturned($returned)
    {
        $this->returned = $returned;

        return $this;
    }

    /**
     * Get returned
     *
     * @return \DateTime
     */
    public function getReturned()
    {
        return $this->returned;
    }

    /**
     * Set description
     *
     * @param string $description
     *
     * @return ExternalServices
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
     * Set cost
     *
     * @param float $cost
     *
     * @return ExternalServices
     */
    public function setCost($cost)
    {
        $this->cost = $cost;

        return $this;
    }

    /**
     * Get cost
     *
     * @return float
     */
    public function getCost()
    {
        return $this->cost;
    }

    /**
     * Set cartage
     *
     * @param float $cartage
     *
     * @return ExternalServices
     */
    public function setCartage($cartage)
    {
        $this->cartage = $cartage;

        return $this;
    }

    /**
     * Get cartage
     *
     * @return float
     */
    public function getCartage()
    {
        return $this->cartage;
    }

    /**
     * Set serviceCharge
     *
     * @param float $serviceCharge
     *
     * @return ExternalServices
     */
    public function setServiceCharge($serviceCharge)
    {
        $this->serviceCharge = $serviceCharge;

        return $this;
    }

    /**
     * Get serviceCharge
     *
     * @return float
     */
    public function getServiceCharge()
    {
        return $this->serviceCharge;
    }

    /**
     * Set discount
     *
     * @param integer $discount
     *
     * @return ExternalServices
     */
    public function setDiscount($discount)
    {
        if(is_int($discount) && $discount > 100){
            $this->discount=100;
        }else{
            $this->discount = $discount;
        }
        return $this;
    }

    /**
     * Get discount
     *
     * @return integer
     */
    public function getDiscount()
    {
        return $this->discount;
    }

    /**
     * Set summary
     *
     * @param float $summary
     *
     * @return ExternalServices
     */
    public function setSummary($summary)
    {
        $this->summary = $summary;

        return $this;
    }

    /**
     * Get summary
     *
     * @return float
     */
    public function getSummary()
    {
        return $this->summary;
    }

    /**
     * Set subcontractor
     *
     * @param \AppBundle\Entity\Subcontractors $subcontractor
     *
     * @return ExternalServices
     */
    public function setSubcontractor(\AppBundle\Entity\Subcontractors $subcontractor = null)
    {
        $this->subcontractor = $subcontractor;

        return $this;
    }

    /**
     * Get subcontractor
     *
     * @return \AppBundle\Entity\Subcontractors
     */
    public function getSubcontractor()
    {
        return $this->subcontractor;
    }

    /**
     * Set serviceOrder
     *
     * @param \AppBundle\Entity\ServiceOrders $serviceOrder
     *
     * @return ExternalServices
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
 // </editor-fold>
    

    /**
     * @ORM\PrePersist
     */
    public function prePersistExternalServices()
    {
        if(is_null($this->consigned)){
            $this->consigned=new \DateTime();
        }
        $this->calc();
    }
}
