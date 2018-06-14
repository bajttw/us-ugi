<?php

namespace AppBundle\Entity;
use Doctrine\Common\Collections\ArrayCollection;

/**
 * Subcontractors
 */
class Subcontractors extends AppEntity
{

    const en='subcontractors';
    const ec='Subcontractors';

 // <editor-fold defaultstate="collapsed" desc="Fields utils">    
    public static $dicNames=[
        'id' => 'v',
        'name' => 'n',
        'contact' => 'd'
    ];

    public static $shortNames=[
        'id' => 'id',
        'name' => 'n',
        'street' => 'as',
        'zipCode' => 'az',
        'city' => 'ac',
        'contact' => 'c',
        'tel' => 't',
        'email' => 'em',
		'active' => 'a',
        'description' => 'd',
        'childs' => [
            'externalServices' => 'ExternalServices'
        ]
        
    ];

    public static function getFields($type = null) {
        switch($type){
            case 'externalservices':
                $fields=[ 'id', 'name', 'street', 'zipCode', 'city', 'tel', 'contact' ];
            break;
            case 'dic':
                $fields= ['id', 'name', 'contact'];
            break;
            default:
                $fields=parent::getFields($type);
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
    private $name;

    /**
     * @var string
     */
    private $street;

    /**
     * @var string
     */
    private $zipCode;

    /**
     * @var string
     */
    private $city;

    /**
     * @var string
     */
    private $contact;

    /**
     * @var string
     */
    private $tel;

    /**
     * @var string
     */
    private $email;

    /**
     * @var boolean
     */
    private $active = true;

    /**
     * @var string
     */
    private $description;

    /**
     * @var \Doctrine\Common\Collections\Collection
     */
    private $externalServices;

  // </editor-fold>  
 
    /**
     * Constructor
     */
    public function __construct($options=[])
    {
        $this->externalService = new ArrayCollection();
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
     * Set name
     *
     * @param string $name
     *
     * @return Subcontractors
     */
    public function setName($name)
    {
        $this->name = $name;

        return $this;
    }

    /**
     * Get name
     *
     * @return string
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * Set street
     *
     * @param string $street
     *
     * @return Subcontractors
     */
    public function setStreet($street)
    {
        $this->street = $street;

        return $this;
    }

    /**
     * Get street
     *
     * @return string
     */
    public function getStreet()
    {
        return $this->street;
    }

    /**
     * Set zipCode
     *
     * @param string $zipCode
     *
     * @return Subcontractors
     */
    public function setZipCode($zipCode)
    {
        $this->zipCode = $zipCode;

        return $this;
    }

    /**
     * Get zipCode
     *
     * @return string
     */
    public function getZipCode()
    {
        return $this->zipCode;
    }

    /**
     * Set city
     *
     * @param string $city
     *
     * @return Subcontractors
     */
    public function setCity($city)
    {
        $this->city = $city;

        return $this;
    }

    /**
     * Get city
     *
     * @return string
     */
    public function getCity()
    {
        return $this->city;
    }

    /**
     * Set contact
     *
     * @param string $contact
     *
     * @return Subcontractors
     */
    public function setContact($contact)
    {
        $this->contact = $contact;

        return $this;
    }

    /**
     * Get contact
     *
     * @return string
     */
    public function getContact()
    {
        return $this->contact;
    }

    /**
     * Set tel
     *
     * @param string $tel
     *
     * @return Subcontractors
     */
    public function setTel($tel)
    {
        $this->tel = $tel;

        return $this;
    }

    /**
     * Get tel
     *
     * @return string
     */
    public function getTel()
    {
        return $this->tel;
    }

    /**
     * Set email
     *
     * @param string $email
     *
     * @return Subcontractors
     */
    public function setEmail($email)
    {
        $this->email = $email;

        return $this;
    }

    /**
     * Get email
     *
     * @return string
     */
    public function getEmail()
    {
        return $this->email;
    }

    /**
     * Set active
     *
     * @param boolean $active
     *
     * @return Subcontractors
     */
    public function setActive($active)
    {
        $this->active = $active;

        return $this;
    }

    /**
     * Get active
     *
     * @return boolean
     */
    public function getActive()
    {
        return $this->active;
    }

    /**
     * Set description
     *
     * @param string $description
     *
     * @return Subcontractors
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
     * Add externalService.
     *
     * @param \AppBundle\Entity\ExternalServices $externalService
     *
     * @return Subcontractors
     */
    public function addExternalService(\AppBundle\Entity\ExternalServices $externalService)
    {
        $this->externalServices[] = $externalService;

        return $this;
    }

    /**
     * Remove externalService.
     *
     * @param \AppBundle\Entity\ExternalServices $externalService
     *
     * @return boolean TRUE if this collection contained the specified element, FALSE otherwise.
     */
    public function removeExternalService(\AppBundle\Entity\ExternalServices $externalService)
    {
        return $this->externalServices->removeElement($externalService);
    }

    /**
     * Get externalServices
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getExternalServices()
    {
        return $this->externalServices;
    }
 // </editor-fold>       

}
