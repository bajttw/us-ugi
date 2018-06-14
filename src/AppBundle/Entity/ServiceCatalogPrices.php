<?php

namespace AppBundle\Entity;

/**
 * ServiceCatalogPrices
 */
class ServiceCatalogPrices extends AppEntity
{
    const en='servicecatalogprices';
    const ec='ServiceCatalogPrices';

 // <editor-fold defaultstate="collapsed" desc="Fields utils">    
    public static $shortNames=[
        'id' => 'id',
        'value' => 'v',
        'childs' => [
            'serviceCatalog' => 'ServiceCatalog',
            'priceList' => 'PriceLists'
        ]
    ];
 // </editor-fold>  

 // <editor-fold defaultstate="collapsed" desc="Variables"> 
    /**
     * @var integer
     */
    private $id;

    /**
     * @var float
     */
    private $value = 0;

    /**
     * @var \AppBundle\Entity\PriceLists
     */
    private $priceList;

    /**
     * @var \AppBundle\Entity\ServiceCatalog
     */
    private $serviceCatalog;
 // </editor-fold>  

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
     * Set value
     *
     * @param float $value
     *
     * @return ServiceCatalogPrices
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
     * Set priceList
     *
     * @param \AppBundle\Entity\PriceLists $priceList
     *
     * @return ServiceCatalogPrices
     */
    public function setPriceList(\AppBundle\Entity\PriceLists $priceList = null)
    {
        $this->priceList = $priceList;

        return $this;
    }

    /**
     * Get priceList
     *
     * @return \AppBundle\Entity\PriceLists
     */
    public function getPriceList()
    {
        return $this->priceList;
    }

    /**
     * Set serviceCatalog
     *
     * @param \AppBundle\Entity\ServiceCatalog $serviceCatalog
     *
     * @return ServiceCatalogPrices
     */
    public function setServiceCatalog(\AppBundle\Entity\ServiceCatalog $serviceCatalog = null)
    {
        $this->serviceCatalog = $serviceCatalog;

        return $this;
    }

    /**
     * Get serviceCatalog
     *
     * @return \AppBundle\Entity\ServiceCatalog
     */
    public function getServiceCatalog()
    {
        return $this->serviceCatalog;
    }
 // </editor-fold>  
    
}
