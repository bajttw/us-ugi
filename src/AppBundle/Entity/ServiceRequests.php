<?php

namespace AppBundle\Entity;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;
/**
 * ServiceRequests
 */
class ServiceRequests extends AppEntity
{
    const en='servicerequests';
    const ec='ServiceRequests';

 // <editor-fold defaultstate="collapsed" desc="Fields utils">    
    public static $shortNames=[
        'id' => 'id',
        'created' => 'cr',
        'description' => 'd',
        'type' => 't',
        'closed' => 'c',
        'status' => 's',
        'childs' => [
            'user' => 'Users',
            'client' => 'Clients',
            'serviceOrder' => 'ServiceOrders',
            'notes' => 'Notes'
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
    private $created;

    /**
     * @var string
     */
    private $description;

    /**
     * @var int
     */
    private $type = 1;

    /**
     * @var \DateTime
     */
    private $closed;

    /**
     * @var integer
     */
    private $status = 0;

    /**
     * @var \AppBundle\Entity\Users
     */
    private $user;

    /**
     * @var \AppBundle\Entity\Clients
     */
    private $client;

    /**
     * @var \AppBundle\Entity\ServiceOrders
     */
    private $serviceOrder;

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
        $this->notes = new ArrayCollection();
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
     * Set created
     *
     * @param \DateTime $created
     *
     * @return ServiceRequests
     */
    public function setCreated($created)
    {
        $this->created = $created;

        return $this;
    }

    /**
     * Get created
     *
     * @return \DateTime
     */
    public function getCreated()
    {
        return $this->created;
    }

    /**
     * Set description
     *
     * @param string $description
     *
     * @return ServiceRequests
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
     * Set type.
     *
     * @param int $type
     *
     * @return ServiceRequests
     */
    public function setType($type)
    {
        $this->type = $type;

        return $this;
    }

    /**
     * Get type.
     *
     * @return int
     */
    public function getType()
    {
        return $this->type;
    }

    /**
     * Set closed
     *
     * @param \DateTime $closed
     *
     * @return ServiceRequests
     */
    public function setClosed($closed)
    {
        $this->closed = $closed;

        return $this;
    }

    /**
     * Get closed
     *
     * @return \DateTime
     */
    public function getClosed()
    {
        return $this->closed;
    }

    /**
     * Set status
     *
     * @param integer $status
     *
     * @return ServiceRequests
     */
    public function setStatus($status)
    {
        $this->status = $status;

        return $this;
    }

    /**
     * Get status
     *
     * @return integer
     */
    public function getStatus()
    {
        return $this->status;
    }

    /**
     * Set user
     *
     * @param \AppBundle\Entity\Users $user
     *
     * @return ServiceRequests
     */
    public function setUser(\AppBundle\Entity\Users $user = null)
    {
        $this->user = $user;

        return $this;
    }

    /**
     * Get user
     *
     * @return \AppBundle\Entity\Users
     */
    public function getUser()
    {
        return $this->user;
    }

    /**
     * Set client.
     *
     * @param \AppBundle\Entity\Clients|null $client
     *
     * @return ServiceRequests
     */
    public function setClient(\AppBundle\Entity\Clients $client = null)
    {
        $this->client = $client;

        return $this;
    }

    /**
     * Get client.
     *
     * @return \AppBundle\Entity\Clients|null
     */
    public function getClient()
    {
        return $this->client;
    }

    /**
     * Set serviceOrder
     *
     * @param \AppBundle\Entity\ServiceOrders $serviceOrder
     *
     * @return ServiceRequests
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
     * Add note
     *
     * @param \AppBundle\Entity\Notes $note
     *
     * @return ServiceRequests
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
 // </editor-fold>       

    /**
     * @ORM\PrePersist
     */
    public function prePersistServiceRequests()
    {
        if(is_null($this->created)){
            $this->created=new \DateTime();
        }
    }

    /**
     * @ORM\PreUpdate
     */
    public function preUpdateServiceRequests()
    {
        // Add your code here
    }


}
