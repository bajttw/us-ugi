<?php

namespace AppBundle\Entity;

/**
 * ServiceOptionsPrices
 */
class ServiceOptionsPrices extends AppEntity
{
    const en='serviceoptionsprices';
    const ec='ServiceOptionsPrices';

 // <editor-fold defaultstate="collapsed" desc="Fields utils">    
    public static $shortNames=[
        'id' => 'id',
        'value' => 'v',
        'childs' => [
            'serviceOption' => 'ServiceOptions',
            'priceList' => 'PriceLists'
        ]
    ];
 // </editor-fold>  

 // <editor-fold defaultstate="collapsed" desc="Variables"> 
    /**
     * @var int
     */
    private $id;

    /**
     * @var float
     */
    private $value = 0;

    /**
     * @var \AppBundle\Entity\ServiceOptions
     */
    private $serviceOption;

    /**
     * @var \AppBundle\Entity\PriceLists
     */
    private $priceList;
 // </editor-fold>  


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
     * Set value.
     *
     * @param float $value
     *
     * @return ServiceOptionsPrices
     */
    public function setValue($value)
    {
        $this->value = $value;

        return $this;
    }

    /**
     * Get value.
     *
     * @return float
     */
    public function getValue()
    {
        return $this->value;
    }

    /**
     * Set priceList.
     *
     * @param \AppBundle\Entity\PriceLists|null $priceList
     *
     * @return ServiceOptionsPrices
     */
    public function setPriceList(\AppBundle\Entity\PriceLists $priceList = null)
    {
        $this->priceList = $priceList;

        return $this;
    }

    /**
     * Get priceList.
     *
     * @return \AppBundle\Entity\PriceLists|null
     */
    public function getPriceList()
    {
        return $this->priceList;
    }

    /**
     * Set serviceOption.
     *
     * @param \AppBundle\Entity\ServiceOptions|null $serviceOption
     *
     * @return ServiceOptionsPrices
     */
    public function setServiceOption(\AppBundle\Entity\ServiceOptions $serviceOption = null)
    {
        $this->serviceOption = $serviceOption;
        return $this;
    }

    /**
     * Get serviceOptions.
     *
     * @return \AppBundle\Entity\ServiceOptions|null
     */
    public function getServiceOptions()
    {
        return $this->serviceOption;
    }
 // </editor-fold>  


    /**
     * Get serviceOption.
     *
     * @return \AppBundle\Entity\ServiceOptions|null
     */
    public function getServiceOption()
    {
        return $this->serviceOption;
    }
}
