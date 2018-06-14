<?php

namespace AppBundle\Entity;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\ORM\Mapping\ManyToOne;
use Doctrine\Common\Collections\ArrayCollection;
use AppBundle\Utils\Utils;

/**
 * Services
 */
class Services extends AppEntity
{
    const en='services';
    const ec='Services';
    const serviceOrderType = 10;

  // <editor-fold defaultstate="collapsed" desc="Fields utils">    
    public static $shortNames=[
        'id' => 'id',
        'performed' => 'p',
        'title' => 't',
        'duration' => 'du',
        'description' => 'd',
        'details' => 'dt',
        'options' => 'o',
        'value' => 'v',
        'discount' => 'ds',
        'summary' => 'sum',
        'serviceOrder' => 'so',
        'childs' => [
            'serviceOrder' => 'ServiceOrders',
            'options' => 'ServiceOptions'
        ]
    ];

    public static function getFields( $type=null){
        $fields=[];
        switch($type){
            case 'list':
                $fields= [
                    'id',
                    'title',
                    [ 
                        'name' => 'performed',
                        'prefix' => 'DATE_FORMAT(',
                        'sufix' => ", '%Y-%m-%d %H:%i')"
                    ],
                    'duration',
                    'value',
                    'discount',
                    'summary',
                    [
                        'name' => 'serviceOrder',
                        'joinField' => [
                            [ 'name' => 'number'],
                            [ 
                                'name' => 'closed',
                                'prefix' => 'DATE_FORMAT(',
                                'sufix' => ", '%Y-%m-%d')"
                            ]
                        ]
                    ],
                    [
                        'name' => 'serviceOrder.client',
                        'joinField' => [
                            [ 'name' => 'name']
                        ]
                    ]             
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
     * @var \DateTime
     */
    private $performed;

    /**
     * @var string
     */
    private $title;

    /**
     * @var int|null
     */
    private $duration = 0;

    /**
     * @var string
     */
    private $description;

    /**
     * @var string
     */
    private $details;

    /**
     * @var string
     */
    private $options;

    /**
     * @var float
     */
    private $value = 0;

    /**
     * @var integer
     */
    private $discount = 0;

    /**
     * @var float
     */
    private $summary = 0;

    /**
     * @var \AppBundle\Entity\ServiceOrders
    */
    private $serviceOrder;
 //end variables 

 // <editor-fold defaultstate="collapsed" desc="Variables extra"> 
    /**
     * @var \AppBundle\Entity\Clients
     */
    private $client;

    /**
     * @var string
     */
    private $serviceOrderId='-';

    /**
     * @var integer
     */
    private $serviceOrderType = self::serviceOrderType;
 //end variables 

    public function calc(){
        $this->summary=$this->value ? $this->value : 0;
        if(Utils::is_JSON_string($this->options)){
            $options=json_decode($this->options, true);
            $precent=0;
            $add=0;
            foreach($options as $o){
                if($o['type']== 1){
                    $precent+=$o['value'];
                }else{
                    $add+=$o['value'];
                }
            }
            if($this->summary > 0 && $precent != 0){
                $this->summary=$this->summary*(100 + $precent)/100;
            }   
            $this->summary+=$add;
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
     * Set performed
     *
     * @param \DateTime $performed
     *
     * @return Services
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
     * Set title
     *
     * @param string $title
     *
     * @return Services
     */
    public function setTitle($title)
    {
        $this->title = $title;

        return $this;
    }

    /**
     * Get title
     *
     * @return string
     */
    public function getTitle()
    {
        return $this->title;
    }

    /**
     * Set duration.
     *
     * @param int|null $duration
     *
     * @return Services
     */
    public function setDuration($duration = null)
    {
        $this->duration = $duration;

        return $this;
    }

    /**
     * Get duration.
     *
     * @return int|null
     */
    public function getDuration()
    {
        return $this->duration;
    }
    
    /**
     * Set description
     *
     * @param string $description
     *
     * @return Services
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
     * Set details
     *
     * @param string $details
     *
     * @return Services
     */
    public function setDetails($details)
    {
        $this->details = $details;

        return $this;
    }

    /**
     * Get details
     *
     * @return string
     */
    public function getDetails()
    {
        return $this->details;
    }

    /**
     * Set options
     *
     * @param string $options
     *
     * @return Services
     */
    public function setOptions($options)
    {
        $this->options = $options;

        return $this;
    }

    /**
     * Get options
     *
     * @return string
     */
    public function getOptions()
    {
        return $this->options;
    }
   
    /**
     * Set value
     *
     * @param float $value
     *
     * @return Services
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
     * Set discount
     *
     * @param integer $discount
     *
     * @return Services
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
     * @return Services
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
     * Set serviceOrder
     *
     * @param \AppBundle\Entity\ServiceOrders $serviceOrder
     *
     * @return Services
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
     * Set client
     *
     * @param \AppBundle\Entity\Clients $client
     *
     * @return ServiceOrders
     */
    public function setClient(\AppBundle\Entity\Clients $client = null)
    {
        $this->client = $client;

        return $this;
    }

    /**
     * Get client
     *
     * @return \AppBundle\Entity\Clients
     */
    public function getClient()
    {
        return $this->client;
    }

    /**
     * Set serviceOrderId
     *
     * @param string $serviceOrderId
     *
     * @return Services
     */
    public function setServiceOrderId( $serviceOrderId = '-')
    {
        $this->serviceOrderId = $serviceOrderId;

        return $this;
    }

    /**
     * Get serviceOrderId
     *
     * @return string
     */
    public function getServiceOrderId()
    {
        return $this->serviceOrderId;
    }

    /**
     * Set serviceOrderType
     *
     * @param integer $serviceOrderType
     *
     * @return Services
     */
    public function setServiceOrderType( $serviceOrderType = self::serviceOrderType)
    {
        $this->serviceOrderType = $serviceOrderType;

        return $this;
    }

    /**
     * Get serviceOrderType
     *
     * @return integer
     */
    public function getServiceOrderType()
    {
        return $this->serviceOrderType;
    }

 // </editor-fold>       

    /**
     * @ORM\PrePersist
     */
    public function prePersistServices()
    {
        if(is_null($this->performed)){
            $this->performed=new \DateTime();
        }
        $this->calc();
    }


    /**
     * @ORM\PreUpdate
     */
    public function preUpdateServices()
    {
        $this->calc();
    }
   

}
