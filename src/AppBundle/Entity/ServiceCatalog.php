<?php

namespace AppBundle\Entity;

/**
 * ServiceCatalog
 */
class ServiceCatalog extends AppEntity
{
    const en='servicecatalog';
    const ec='ServiceCatalog';

 // <editor-fold defaultstate="collapsed" desc="Fields utils">    
    public static $shortNames=[
        'id' => 'id',
        'title' => 't',
        'description' => 'd',
        'details' => 'dt',
        'value' => 'v'
    ];
 // </editor-fold>  

 // <editor-fold defaultstate="collapsed" desc="Variables"> 
    /**
     * @var integer
     */
    private $id;

    /**
     * @var string
     */
    private $title;

    /**
     * @var string
     */
    private $description;

    /**
     * @var string|null
     */
    private $details;

    /**
     * @var float
     */
    private $value = 0;
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
     * Set title
     *
     * @param string $title
     *
     * @return ServiceCatalog
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
     * Set description
     *
     * @param string $description
     *
     * @return ServiceCatalog
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
     * Set details.
     *
     * @param string|null $details
     *
     * @return ServiceCatalog
     */
    public function setDetails($details = null)
    {
        $this->details = $details;

        return $this;
    }

    /**
     * Get details.
     *
     * @return string|null
     */
    public function getDetails()
    {
        return $this->details;
    }

    /**
     * Set value
     *
     * @param float $value
     *
     * @return ServiceCatalog
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
 // </editor-fold>  
}
