<?php

namespace AppBundle\Entity;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\ORM\Mapping\OneToMany;

/**
 * PriceLists
 */
class PriceLists extends AppEntity
{
    const en='pricelists';
    const ec='PriceLists';

 // <editor-fold defaultstate="collapsed" desc="Fields utils">    
    public static $shortNames=[
        'id' => 'id',
        'title' => 't',
        'start' => 'st',
        'end' => 'end',
        'description' => 'd',
        'childs' => [
            'clientsGroups' => 'ClientsGroups',
            'clients' => 'Clients',
            'serviceCatalogPrices' => 'ServiceCatalogPrices',
            'serviceOptionsPrices' => 'ServiceOptionsPrices',
            'notes' => 'Notes'
        ]
    ];

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
     * @var \DateTime
     */
    private $start;

    /**
     * @var \DateTime
     */
    private $end;

    /**
     * @var string
     */
    private $description;

    /**
     * @var \Doctrine\Common\Collections\Collection
     */
    private $clientsGroups;
    
    /**
     * @var \Doctrine\Common\Collections\Collection
     */
    private $clients;

    /**
     * @var \Doctrine\Common\Collections\Collection
     */
    private $serviceCatalogPrices;

    /**
     * @var \Doctrine\Common\Collections\Collection
     */
    private $serviceOptionsPrices;

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
        $this->clientsGroups = new \Doctrine\Common\Collections\ArrayCollection();
        $this->clients = new \Doctrine\Common\Collections\ArrayCollection();
        $this->serviceCatalogPrices = new \Doctrine\Common\Collections\ArrayCollection();
        $this->serviceOptionsPrices = new \Doctrine\Common\Collections\ArrayCollection();
        $this->notes = new \Doctrine\Common\Collections\ArrayCollection();
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
     * Set title
     *
     * @param string $title
     *
     * @return PriceLists
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
     * Set start.
     *
     * @param \DateTime $start
     *
     * @return PriceLists
     */
    public function setStart($start)
    {
        $this->start = $start;

        return $this;
    }

    /**
     * Get start.
     *
     * @return \DateTime
     */
    public function getStart()
    {
        return $this->start;
    }

    /**
     * Set end.
     *
     * @param \DateTime $end
     *
     * @return PriceLists
     */
    public function setEnd($end)
    {
        $this->end = $end;

        return $this;
    }

    /**
     * Get end.
     *
     * @return \DateTime
     */
    public function getEnd()
    {
        return $this->end;
    }

    /**
     * Set description
     *
     * @param string $description
     *
     * @return PriceLists
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
     * Add clientsGroup.
     *
     * @param \AppBundle\Entity\ClientsGroups $clientsGroup
     *
     * @return PriceLists
     */
    public function addClientsGroup(\AppBundle\Entity\ClientsGroups $clientsGroup)
    {
        $this->clientsGroups[] = $clientsGroup;

        return $this;
    }

    /**
     * Remove clientsGroup.
     *
     * @param \AppBundle\Entity\ClientsGroups $clientsGroup
     *
     * @return boolean TRUE if this collection contained the specified element, FALSE otherwise.
     */
    public function removeClientsGroup(\AppBundle\Entity\ClientsGroups $clientsGroup)
    {
        return $this->clientsGroups->removeElement($clientsGroup);
    }

    /**
     * Get clientsGroups.
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getClientsGroups()
    {
        return $this->clientsGroups;
    }

    /**
     * Add client
     *
     * @param \AppBundle\Entity\Clients $client
     *
     * @return PriceLists
     */
    public function addClient(\AppBundle\Entity\Clients $client)
    {
        $this->clients[] = $client;

        return $this;
    }

    /**
     * Remove client
     *
     * @param \AppBundle\Entity\Clients $client
     */
    public function removeClient(\AppBundle\Entity\Clients $client)
    {
        $this->clients->removeElement($client);
    }

    /**
     * Get clients
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getClients()
    {
        return $this->clients;
    }

    /**
     * Add serviceCatalogPrice
     *
     * @param \AppBundle\Entity\ServiceCatalogPrices $serviceCatalogPrice
     *
     * @return PriceLists
     */
    public function addServiceCatalogPrice(\AppBundle\Entity\ServiceCatalogPrices $serviceCatalogPrice)
    {
        $this->serviceCatalogPrices[] = $serviceCatalogPrice;

        return $this;
    }

    /**
     * Remove serviceCatalogPrice
     *
     * @param \AppBundle\Entity\ServiceCatalogPrices $serviceCatalogPrice
     */
    public function removeServiceCatalogPrice(\AppBundle\Entity\ServiceCatalogPrices $serviceCatalogPrice)
    {
        $this->serviceCatalogPrices->removeElement($serviceCatalogPrice);
    }

    /**
     * Get serviceCatalogPrices
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getServiceCatalogPrices()
    {
        return $this->serviceCatalogPrices;
    }

    /**
     * Add serviceOptionsPrice.
     *
     * @param \AppBundle\Entity\ServiceOptionsPrices $serviceOptionsPrice
     *
     * @return PriceLists
     */
    public function addServiceOptionsPrice(\AppBundle\Entity\ServiceOptionsPrices $serviceOptionsPrice)
    {
        $this->serviceOptionsPrices[] = $serviceOptionsPrice;

        return $this;
    }

    /**
     * Remove serviceOptionsPrice.
     *
     * @param \AppBundle\Entity\ServiceOptionsPrices $serviceOptionsPrice
     *
     * @return boolean TRUE if this collection contained the specified element, FALSE otherwise.
     */
    public function removeServiceOptionsPrice(\AppBundle\Entity\ServiceOptionsPrices $serviceOptionsPrice)
    {
        return $this->serviceOptionsPrices->removeElement($serviceOptionsPrice);
    }

    /**
     * Get serviceOptionsPrices.
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getServiceOptionsPrices()
    {
        return $this->serviceOptionsPrices;
    }

    /**
     * Add note
     *
     * @param \AppBundle\Entity\Notes $note
     *
     * @return PriceLists
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
     *
     * @return boolean TRUE if this collection contained the specified element, FALSE otherwise.
     */
    public function removeNote(\AppBundle\Entity\Notes $note)
    {
        return $this->notes->removeElement($note);
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
    public function prePersistPriceLists()
    {
        if(is_null($this->start)){
            $this->start=new \DateTime();
        }
    }
}
