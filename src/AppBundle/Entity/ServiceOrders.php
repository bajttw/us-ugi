<?php

namespace AppBundle\Entity;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\ORM\Mapping\OneToMany;
use Doctrine\Common\Collections\ArrayCollection;
/**
 * ServiceOrders
 */
class ServiceOrders extends AppEntity
{
    const en='serviceorders';
    const ec='ServiceOrders';

 // <editor-fold defaultstate="collapsed" desc="Fields utils">    
    public static $dicNames=[
        'id' => 'v',
        'title' => 'tt',
        'description' => 'd',
        'type' => 't'
    ];
    
    public static $shortNames=[
        'id' => 'id',
        'number' => 'nr',
        'created' => 'cr',
        'title' => 'tt',
        'accessory' => 'ac',
        'description' => 'd',
        'type' => 't',
        'express' => 'exp',
        'value' => 'v',
        'status' => 's',
        'closed' => 'c',
        'receipt' => 'r',
        'paid' => 'p',
        'bill' => 'b',
        'client' => 'cl',
        'services' => 'srv',
        'externalServices' => 'esrv',
        'materials' => 'm',
        'childs' => [
            'client' => 'Clients',
            'serviceRequest' => 'ServiceRequests',
            'services' => 'Services',
            'materials' => 'Materials',
            'externalServices' => 'ExternalServices',
            'payments' => 'Payments',
            'notes' => 'Notes'
        ]
    ];

    public function getSuccessFields($type){
        $fields=[];
        switch($type){
            case 'create':
                $fields=[ 'number', 'created', 'status' ];
            break;
            case 'update':
                $fields=[ 'closed', 'receipt', 'paid', 'status' ];
            break;
        }
        return $fields;
    }
    
    public static function getFields( $type=null){
        $fields=[];
        switch($type){
            case 'active':
                $fields=[ 'id', 'title' ];
            break;
            case 'dic':
                $fields=[ 'id', "concat(DATE_FORMAT(e.created, '%Y-%m-%d'), ' - ', e.number, ' - ', e.title) as n" , 'type' ];
            break;
            case 'list':
                $fields= [
                    'id',
                    'number',
                    [ 
                        'name' => 'created',
                        'prefix' => 'DATE_FORMAT(',
                        'sufix' => ", '%Y-%m-%d')"
                    ],
                    [ 
                        'name' => 'closed',
                        'prefix' => 'DATE_FORMAT(',
                        'sufix' => ", '%Y-%m-%d')"
                    ],                    
                    'express',
                    'title',
                    'type',
                    'value',
                    'status',
                    [
                        'name' => 'client',
                        'joinField' => [
                            [ 'name' => 'name'],
                            [ 'name' => 'code']
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
     * @var string
     */
    private $number;

    /**
     * @var \DateTime
     */
    private $created;

	/**
     * @var string
     */
    private $title='Zlecenie';

    /**
     * @var string
     */
    private $accessory;

    /**
     * @var string
     */
    private $description;

    /**
     * @var integer
     */
    private $type = 1;

    /**
     * @var integer
     */
    private $express = 1;

    /**
     * @var float
     */
    private $value = 0;

    /**
     * @var integer
     */
    private $status = 1;

    /**
     * @var \DateTime
     */
    private $closed;

    /**
     * @var \DateTime
     */
    private $receipt;

	/**
	 * @var \DateTime
	 */
	private $paid;

    /**
     * @var string
     */
    private $bill;

    /**
     * @var \AppBundle\Entity\Clients
     */
    private $client;

    /**
     * @var \AppBundle\Entity\ServiceRequests
     */
    private $serviceRequest;

    /**
     * @var \Doctrine\Common\Collections\Collection
     */
    private $services;

    /**
     * @var \Doctrine\Common\Collections\Collection
     */
    private $materials;

    /**
     * @var \Doctrine\Common\Collections\Collection
     */
    private $externalServices;

    /**
     * @var \Doctrine\Common\Collections\Collection
     */
    private $payments;

    /**
     * @var \Doctrine\Common\Collections\Collection
     */
	private $notes;
 // </editor-fold>
	
 // <editor-fold defaultstate="collapsed" desc="Variables extra"> 
    /**
     * @var integer
     */
    private $nr;
    // private $oldServices;
    // private $oldMaterials;
    // private $oldExternalServices;
  // </editor-fold>

    /**
     * Constructor
     */
    public function __construct($options=[])
    {
        $this->services = new ArrayCollection();
        $this->materials = new ArrayCollection();
        $this->externalServices = new ArrayCollection();
        $this->payments = new ArrayCollection();
        $this->notes = new ArrayCollection();
        parent::__construct($options);
    }


    public function preUpdate(){
        parent::preUpdate();
        $this->saveFieldsValues(['services', 'externalServices', 'materials']);
        return $this;
    }

    public function postUpdate($em){
        parent::postUpdate($em);
        foreach(['services', 'externalServices', 'materials'] as $f){
            $this->_checkElements($f, $em);           
        }
        return $this;
    }

 // <editor-fold defaultstate="collapsed" desc="Fields functions"> 
    // /**
    //  * Set id
    //  *
    //  * @param integer $id
    //  * 
    //  * @return ServiceOrders
    //  */
    // public function setId($id)
    // {
    //     $this->id=$id;
    // }

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
     * Set nr
     *
     * @param integer $nr
     * 
     * @return ServiceOrders
     */
    public function setNr($nr)
    {
        $nr=intval($nr);
        $this->nr=$nr > 0 ? $nr : 1;
    }

    /**
     * Get nr
     *
     * @return integer
     */
    public function getNr()
    {
        return $this->nr;
    }

    /**
     * Set number
     *
     * @param string $number
     *
     * @return ServiceOrders
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
     * Set created
     *
     * @param \DateTime $created
     *
     * @return ServiceOrders
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
	
	public function getShowCreated($options=[]){
        return parent::getTimeField($this->created, $options);
    }

    public function getStrCreated(){
        return $this->getShowCreated(['strDate' => 'time']);
    }
	
    /**
     * Set title
     *
     * @param string $title
     *
     * @return ServiceOrders
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
     * Set accessory
     *
     * @param string $accessory
     *
     * @return ServiceOrders
     */
    public function setAccessory($accessory)
    {
        $this->accessory = $accessory;

        return $this;
    }

    /**
     * Get accessory
     *
     * @return string
     */
    public function getAccessory()
    {
        return $this->accessory;
    }
    
    /**
     * Set description
     *
     * @param string $description
     *
     * @return ServiceOrders
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
     * Set type
     *
     * @param integer $type
     *
     * @return ServiceOrders
     */
    public function setType($type)
    {
        $this->type = $type;

        return $this;
    }

    /**
     * Get type
     *
     * @return integer
     */
    public function getType()
    {
        return $this->type;
    }

    /**
     * Set express
     *
     * @param integer $express
     *
     * @return ServiceOrders
     */
    public function setExpress($express)
    {
        $this->express = $express;

        return $this;
    }

    /**
     * Get express
     *
     * @return integer
     */
    public function getExpress()
    {
        return $this->express;
    }

    /**
     * Set value
     *
     * @param float $value
     *
     * @return ServiceOrders
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
     * Set status
     *
     * @param boolean $status
     *
     * @return ServiceOrders
     */
    public function setStatus($status=null)
    {
        switch($status){
            case '1'://nowe
            case '2'://realizowane
                $this->status = $this->getServices()->count() || $this->getExternalServices()->count() ? 2 : 1;
            break;
            case '3'://zakończone
                $this->status = $this->status <= 4 ? $status : $this->status;
            break; 
            case '4'://wydane
                $this->status = $this->status > 1 ? $status : $this->status;
            break; 
            case '5'://zapłacone
                $this->status = $this->status > 1 ? $status : $this->status;
            break; 
            default:
                $c1=$this->getServices()->count();
                $c2=$this->getExternalServices()->count();
                $c3=$this->getMaterials()->count();

                if($this->getServices()->count() > 0 || $this->getExternalServices()->count() > 0 || $this->getMaterials()->count()){
                    if(is_null($this->status) || $this->status < 2 ){
                        $this->status = 2;
                    }
                }else{
                    $this->status=1;
                }
        }
        $this->updateStatus();
        return $this;
    }

    private function updateStatus(){
        $setDate=function($names){
            foreach($names as $n){
                $this->setDateField($n, 'now');
            }
        };
        $clearDate=function($names){
            foreach($names as $n){
                $this->$n=null;
            }
        };
        switch($this->status){
            case '5':
                $setDate(['closed', 'receipt', 'paid']);
            break;
            case '4':
                $setDate(['closed', 'receipt']);
                $clearDate(['paid']);
            break;
            case '3':
                $setDate(['closed']);
                $clearDate(['receipt', 'paid']);
            break;
            default:
                $clearDate(['closed', 'receipt', 'paid']);
        }
        return $this;
    }

    /**
     * Get status
     *
     * @return boolean
     */
    public function getStatus()
    {
        return $this->status;
    }

    /**
     * Set closed
     *
     * @param \DateTime $closed
     *
     * @return ServiceOrders
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

	public function getShowClosed($options=[]){
        return parent::getTimeField($this->closed, $options);
    }

    public function getStrClosed(){
        return $this->getShowClosed(['strDate' => 'time']);
    }

	/**
     * Set receipt
     *
     * @param \DateTime $receipt
     *
     * @return ServiceOrders
     */
    public function setReceipt($receipt)
    {
        $this->receipt = $receipt;
        return $this;
    }

    /**
     * Get receipt
     *
     * @return \DateTime
     */
    public function getReceipt()
    {
        return $this->receipt;
    }

	public function getShowReceipt($options=[]){
        return parent::getTimeField($this->receipt, $options);
    }

    public function getStrReceipt(){
        return $this->getShowReceipt(['strDate' => 'time']);
    }
	
    /**
     * Set paid
     *
     * @param \DateTime $paid
     *
     * @return ServiceOrders
     */
    public function setPaid($paid)
    {
        $this->paid = $paid;

        return $this;
    }

    /**
     * Get paid
     *
     * @return \DateTime
     */
    public function getPaid()
    {
        return $this->paid;
    }

    /**
     * Set bill
     *
     * @param string $bill
     *
     * @return ServiceOrders
     */
    public function setBill($bill)
    {
        $this->bill = $bill;

        return $this;
    }

    /**
     * Get bill
     *
     * @return string
     */
    public function getBill()
    {
        return $this->bill;
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
    
    public function getShowClient($options = []) {
        return $this->client->getShowData(false, $options);
    }
    
    /**
     * Set serviceRequest
     *
     * @param \AppBundle\Entity\ServiceRequests $serviceRequest
     *
     * @return ServiceOrders
     */
    public function setServiceRequest(\AppBundle\Entity\ServiceRequests $serviceRequest = null)
    {
        $this->serviceRequest = $serviceRequest;

        return $this;
    }

    /**
     * Get serviceRequest
     *
     * @return \AppBundle\Entity\ServiceRequests
     */
    public function getServiceRequest()
    {
        return $this->serviceRequest;
    }

    /**
     * Add service
     *
     * @param \AppBundle\Entity\Services $service
     *
     * @return ServiceOrders
     */
    public function addService(\AppBundle\Entity\Services $service)
    {
        $service->setServiceOrder($this);
        $this->services->add($service);
        $this->value=0;
        return $this;
    }

    /**
     * Remove service
     *
     * @param \AppBundle\Entity\Services $service
     */
    public function removeService(\AppBundle\Entity\Services $service)
    {
        $this->value=0;
        $this->services->removeElement($service);
    }

    /**
     * Get services
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getServices()
    {
        return $this->services;
    }

//     public function saveOldServices(){
//         $this->oldServices = new ArrayCollection();
//         foreach($this->services as $service){
//             $this->oldServices->add($service);
//         } 
//         return $this->oldServices;
// 	}
	
//     public function checkServices($entityManager){
//         foreach ($this->oldServices as $service) {
//             if (false === $this->services->contains($service)) {
//                 $entityManager->remove($service);
//             }
//         }
// //        foreach ($this->services as $service){
// //            $service->checkUpdates($entityManager);
// //        }       
//     }    

    /**
     * Add material.
     *
     * @param \AppBundle\Entity\Materials $material
     *
     * @return ServiceOrders
     */
    public function addMaterial(\AppBundle\Entity\Materials $material)
    {
        $material->setServiceOrder($this);
        $this->materials->add($material);
        $this->value=0;
        return $this;
    }

    /**
     * Remove material.
     *
     * @param \AppBundle\Entity\Materials $material
     *
     * @return boolean TRUE if this collection contained the specified element, FALSE otherwise.
     */
    public function removeMaterial(\AppBundle\Entity\Materials $material)
    {
        $this->value=0;
        return $this->materials->removeElement($material);
    }

    /**
     * Get materials.
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getMaterials()
    {
        return $this->materials;
    }

    // public function saveOldMaterials(){
    //     $this->oldMaterials = new ArrayCollection();
    //     foreach($this->materials as $material){
    //         $this->oldMaterials->add($material);
    //     } 
    //     return $this->oldMaterials;
	// }
	
    // public function checkMaterials($entityManager){
    //     foreach ($this->oldMaterials as $material) {
    //         if (false === $this->materials->contains($material)) {
    //             $entityManager->remove($material);
    //         }
    //     }
    // }    

    /**
     * Add externalService
     *
     * @param \AppBundle\Entity\ExternalServices $externalService
     *
     * @return ServiceOrders
     */
    public function addExternalService(\AppBundle\Entity\ExternalServices $externalService)
    {
        $externalService->setServiceOrder($this);
        $this->externalServices->add($externalService);
        $this->value=0;
        return $this;
    }

    /**
     * Remove externalService
     *
     * @param \AppBundle\Entity\ExternalServices $externalService
     */
    public function removeExternalService(\AppBundle\Entity\ExternalServices $externalService)
    {
        $this->value=0;
        $this->externalServices->removeElement($externalService);
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
    
    // public function saveOldExternalServices(){
    //     $this->oldExternalServices = new ArrayCollection();
    //     foreach($this->externalServices as $externalService){
    //         $this->oldExternalServices->add($externalService);
    //     } 
    //     return $this->oldExternalServices;
	// }
	
    // public function checkExternalServices($entityManager){
    //     foreach ($this->oldExternalServices as $externalService) {
    //         if (false === $this->externalServices->contains($externalService)) {
    //             $entityManager->remove($externalService);
    //         }
    //     }
    // }    

    /**
     * Add payment
     *
     * @param \AppBundle\Entity\Payments $payment
     *
     * @return ServiceOrders
     */
    public function addPayment(\AppBundle\Entity\Payments $payment)
    {
        $this->payments[] = $payment;

        return $this;
    }

    /**
     * Remove payment
     *
     * @param \AppBundle\Entity\Payments $payment
     */
    public function removePayment(\AppBundle\Entity\Payments $payment)
    {
        $this->payments->removeElement($payment);
    }

    /**
     * Get payments
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getPayments()
    {
        return $this->payments;
    }

    /**
     * Add note
     *
     * @param \AppBundle\Entity\Notes $note
     *
     * @return ServiceOrders
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
    public function prePersistServiceOrders()
    {
        if(is_null($this->created)){
            $this->created=new \DateTime();
        }
        if(is_null($this->number)){
            $this->number=$this->genNumber();
        }
        $this->calc();
        $this->setStatus();
    }

    /**
     * @ORM\PostPersist
     */
    public function postPersistServiceOrders()
    {
        $this->nextNr();
    }
    
    public function calc(){
        $this->value=0;
        foreach($this->services as $service){
            $this->value+=$service->calc();
        }
        foreach($this->materials as $material){
            $this->value+=$material->calc();
        }
        foreach($this->externalServices as $externalService){
            $this->value+=$externalService->calc();
        }
    }

    /**
     * @ORM\PreUpdate
     */
    public function preUpdateServiceOrders()
    {
        $this->calc();
        $this->setStatus();
    }

}
