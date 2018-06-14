<?php
namespace AppBundle\Entity;
use Doctrine\Common\Collections\ArrayCollection;

/**
 * Clients
 */
class Clients extends AppEntity
{
    const en = 'clients';
    const ec = 'Clients';

    //  <editor-fold defaultstate="collapsed" desc="Fields utils">
    public static $dicNames = [
        'id' => 'v',
        'code' => 'cc',
        'name' => 'n',
        'nip' => 'd'
    ];

    public static $shortNames = [
        'id' => 'id',
        'code' => 'cc',
        'name' => 'n',
        'street' => 'as',
        'zipCode' => 'az',
        'city' => 'ac',
        'nip' => 'nip',
        'contact' => 'c',
        'tel' => 't',
        'mobile' => 'm',
        'email' => 'em',
        'active' => 'a',
        'regular' => 'r',
        'description' => 'd',
        'childs' => [
            'clientGroups' => 'ClientsGroups',
            'users' => 'Users',
            'settings' => 'Settings',
            'priceLists' => 'PriceLists',
            'serviceOrders' => 'ServiceOrders',
            'serviceRequests' => 'ServiceRequests',
            'notes' => 'Notes'
        ]

    ];

    public static function getFields($type = null) {
        switch($type){
            case 'serviceorders':
                $fields = ['id', 'code', 'name', 'street', 'zipCode', 'city', 'tel', 'mobile'];
            break;
            case 'details':
            case 'list':
                return parent::getFields($type);
            break;
            case 'data':
            case 'dic':
            default:
                $fields= ['id', 'code', 'name', 'nip'];
        }
        return $fields;
    }
 // </editor-fold>       

 //  <editor-fold defaultstate="collapsed" desc="Variables">    
    
    /**
     * @var integer
     */
    private $id;

    /**
     * @var string
     */
    private $code = 'N';

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
    private $nip;

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
    private $mobile;

    /**
     * @var string
     */
    private $email;

    /**
     * @var boolean
     */
    private $active = true;

    /**
     * @var boolean
     */
    private $regular = false;

    /**
     * @var string
     */
    private $description;

    /**
     * @var \Doctrine\Common\Collections\Collection
     */
    private $clientGroups;

    /**
     * @var \Doctrine\Common\Collections\Collection
     */
    private $users;

    /**
     * @var \Doctrine\Common\Collections\Collection
     */
    private $settings;

    /**
     * @var \Doctrine\Common\Collections\Collection
     */
    private $priceLists;

    /**
     * @var \Doctrine\Common\Collections\Collection
     */
    private $serviceOrders;

    /**
     * @var \Doctrine\Common\Collections\Collection
     */
    private $serviceRequests;

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
        $this->clientGroups = new ArrayCollection();
        $this->users = new ArrayCollection();
        $this->settings = new ArrayCollection();
        $this->priceLists = new ArrayCollection();
        $this->serviceOrders = new ArrayCollection();
        $this->serviceRequests = new ArrayCollection();
        $this->notes = new ArrayCollection();
        parent::__construct($options);
    }

    public function __toString()
    {
        return $this->getName();
    }

    public function getData($jsonEncode=true, $options=[]){
        return parent::getData($jsonEncode, array_replace([ 
                'shortNames' => 'dic'
            ],
            $options
        ));
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
     * Set code
     *
     * @param string $code
     *
     * @return Clients
     */
    public function setCode($code)
    {
        $this->code = $code;

        return $this;
    }

    /**
     * Get code
     *
     * @return string
     */
    public function getCode()
    {
        return $this->code;
    }

    /**
     * Set name
     *
     * @param string $name
     *
     * @return Clients
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
     * @return Clients
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
     * @return Clients
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
     * @return Clients
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
     * Set nip
     *
     * @param string $nip
     *
     * @return Clients
     */
    public function setNip($nip)
    {
        $this->nip = $nip;
        return $this;
    }

    /**
     * Get nip
     *
     * @return string
     */
    public function getNip()
    {
        return $this->nip;
    }

    /**
     * Set contact
     *
     * @param string $contact
     *
     * @return Clients
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
     * @return Clients
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
     * Set mobile
     *
     * @param string $mobile
     *
     * @return Clients
     */
    public function setMobile($mobile)
    {
        $this->mobile = $mobile;

        return $this;
    }

    /**
     * Get mobile
     *
     * @return string
     */
    public function getMobile()
    {
        return $this->mobile;
    }

    /**
     * Set email
     *
     * @param string $email
     *
     * @return Clients
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
     * @return Clients
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
     * Set regular
     *
     * @param boolean $regular
     *
     * @return Clients
     */
    public function setRegular($regular)
    {
        $this->regular = $regular;

        return $this;
    }

    /**
     * Get regular
     *
     * @return boolean
     */
    public function getRegular()
    {
        return $this->regular;
    }

    /**
     * Set description
     *
     * @param string $description
     *
     * @return Clients
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
     * Add clientGroup.
     *
     * @param \AppBundle\Entity\ClientsGroups $clientGroup
     *
     * @return Clients
     */
    public function addClientGroup(\AppBundle\Entity\ClientsGroups $clientGroup)
    {
        $this->clientGroups[] = $clientGroup;

        return $this;
    }

    /**
     * Remove clientGroup.
     *
     * @param \AppBundle\Entity\ClientsGroups $clientGroup
     *
     * @return boolean TRUE if this collection contained the specified element, FALSE otherwise.
     */
    public function removeClientGroup(\AppBundle\Entity\ClientsGroups $clientGroup)
    {
        return $this->clientGroups->removeElement($clientGroup);
    }

    /**
     * Get clientGroups.
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getClientGroups()
    {
        return $this->clientGroups;
    }

    /**
     * Add user
     *
     * @param \AppBundle\Entity\Users $user
     *
     * @return Clients
     */
    public function addUser(\AppBundle\Entity\Users $user)
    {
        $user->setClient($this);
        $this->users->add($user);
        return $this;
    }

    /**
     * Remove user
     *
     * @param \AppBundle\Entity\Users $user
     */
    public function removeUser(\AppBundle\Entity\Users $user)
    {
        $this->users->removeElement($user);
    }

    /**
     * Get users
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getUsers()
    {
        return $this->users;
    }

    /**
     * Add setting
     *
     * @param \AppBundle\Entity\Settings $setting
     *
     * @return Clients
     */
    public function addSetting(\AppBundle\Entity\Settings $setting)
    {
        $this->settings[] = $setting;

        return $this;
    }

    /**
     * Remove setting
     *
     * @param \AppBundle\Entity\Settings $setting
     */
    public function removeSetting(\AppBundle\Entity\Settings $setting)
    {
        $this->settings->removeElement($setting);
    }

    /**
     * Get settings
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getSettings()
    {
        return $this->settings;
    }

    /**
     * Add priceList
     *
     * @param \AppBundle\Entity\PriceLists $priceList
     *
     * @return Clients
     */
    public function addPriceList(\AppBundle\Entity\PriceLists $priceList)
    {
        $this->priceLists[] = $priceList;

        return $this;
    }

    /**
     * Remove priceList
     *
     * @param \AppBundle\Entity\PriceLists $priceList
     */
    public function removePriceList(\AppBundle\Entity\PriceLists $priceList)
    {
        $this->priceLists->removeElement($priceList);
    }

    /**
     * Get priceLists
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getPriceLists()
    {
        return $this->priceLists;
    }

    /**
     * Add serviceOrder
     *
     * @param \AppBundle\Entity\ServiceOrders $serviceOrder
     *
     * @return Clients
     */
    public function addServiceOrder(\AppBundle\Entity\ServiceOrders $serviceOrder)
    {
        $this->serviceOrders[] = $serviceOrder;

        return $this;
    }

    /**
     * Remove serviceOrder
     *
     * @param \AppBundle\Entity\ServiceOrders $serviceOrder
     */
    public function removeServiceOrder(\AppBundle\Entity\ServiceOrders $serviceOrder)
    {
        $this->serviceOrders->removeElement($serviceOrder);
    }

    /**
     * Get serviceOrders
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getServiceOrders()
    {
        return $this->serviceOrders;
    }

    /**
     * Add serviceRequest.
     *
     * @param \AppBundle\Entity\ServiceRequests $serviceRequest
     *
     * @return Clients
     */
    public function addServiceRequest(\AppBundle\Entity\ServiceRequests $serviceRequest)
    {
        $this->serviceRequests[] = $serviceRequest;

        return $this;
    }

    /**
     * Remove serviceRequest.
     *
     * @param \AppBundle\Entity\ServiceRequests $serviceRequest
     *
     * @return boolean TRUE if this collection contained the specified element, FALSE otherwise.
     */
    public function removeServiceRequest(\AppBundle\Entity\ServiceRequests $serviceRequest)
    {
        return $this->serviceRequests->removeElement($serviceRequest);
    }

    /**
     * Get serviceRequests.
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getServiceRequests()
    {
        return $this->serviceRequests;
    }

    /**
     * Add note
     *
     * @param \AppBundle\Entity\Notes $note
     *
     * @return Clients
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

}
