<?php

namespace AppBundle\Entity;
use Doctrine\Common\Collections\ArrayCollection;

/**
 * ClientsGroups
 */
class ClientsGroups extends AppEntity
{
    const en = 'clientsgroups';
    const ec = 'ClientsGroups';

 // <editor-fold defaultstate="collapsed" desc="Fields utils">    
    public static $dicNames = [
        'id' => 'v',
        'name' => 'n',
        'description' => 'd'
    ];

    public static $shortNames = [
        'id' => 'id',
        'name' => 'n',
        'code' => 'c',
        'description' => 'd',
        'childs' => [
            'clients' => 'Clients',
            'priceLists' => "PriceLists"
        ]
    ];
 // </editor-fold>  

 // <editor-fold defaultstate="collapsed" desc="Variables"> 
    /**
     * @var int
     */
    private $id;

    /**
     * @var string
     */
    private $name;

    /**
     * @var string
     */
    private $code = 'N';

    /**
     * @var string|null
     */
    private $description;

    /**
     * @var \Doctrine\Common\Collections\Collection
     */
    private $clients;

    /**
     * @var \Doctrine\Common\Collections\Collection
     */
    private $priceLists;
 // </editor-fold>

    /**
     * Constructor
     */
    public function __construct($options=[])
    {
        $this->clients = new ArrayCollection();
        $this->priceLists = new ArrayCollection();
        parent::__construct($options);
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
     * Set name.
     *
     * @param string $name
     *
     * @return ClientsGroups
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
     * Set code.
     *
     * @param string $code
     *
     * @return ClientsGroups
     */
    public function setCode($code)
    {
        $this->code = $code;

        return $this;
    }

    /**
     * Get code.
     *
     * @return string
     */
    public function getCode()
    {
        return $this->code;
    }

    /**
     * Set description.
     *
     * @param string|null $description
     *
     * @return ClientsGroups
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
     * Add client.
     *
     * @param \AppBundle\Entity\Clients $client
     *
     * @return ClientsGroups
     */
    public function addClient(\AppBundle\Entity\Clients $client)
    {
        $this->clients[] = $client;

        return $this;
    }

    /**
     * Remove client.
     *
     * @param \AppBundle\Entity\Clients $client
     *
     * @return boolean TRUE if this collection contained the specified element, FALSE otherwise.
     */
    public function removeClient(\AppBundle\Entity\Clients $client)
    {
        return $this->clients->removeElement($client);
    }

    /**
     * Get clients.
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getClients()
    {
        return $this->clients;
    }

    /**
     * Add priceList.
     *
     * @param \AppBundle\Entity\PriceLists $priceList
     *
     * @return ClientsGroups
     */
    public function addPriceList(\AppBundle\Entity\PriceLists $priceList)
    {
        $this->priceLists[] = $priceList;

        return $this;
    }

    /**
     * Remove priceList.
     *
     * @param \AppBundle\Entity\PriceLists $priceList
     *
     * @return boolean TRUE if this collection contained the specified element, FALSE otherwise.
     */
    public function removePriceList(\AppBundle\Entity\PriceLists $priceList)
    {
        return $this->priceLists->removeElement($priceList);
    }

    /**
     * Get priceLists.
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getPriceLists()
    {
        return $this->priceLists;
    }
 // </editor-fold>
    
}
