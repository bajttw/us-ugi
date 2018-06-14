<?php
namespace AppBundle\Entity;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use AppBundle\Utils\Utils;
use FOS\UserBundle\Model\User as BaseUser;
/**
 * Users
 */
class Users extends BaseUser
{
    const en = 'users';
    const ec = 'Users';

//  <editor-fold defaultstate="collapsed" desc="Fields utils">
    public static $dicNames = [
        'id' => 'v',
        'username' => 'n',
        'usernameCanonical' => 'd',
    ];

    public static $shortNames = [
        'id' => 'id',
        'usernameCanonical' => 'un',
        'username' => 'u',
        'enabled' => 'a',
        'lastLogin' => 'll',
        'roles' => 'r',
        'childs' => [
            'userGroups' => 'UsersGroups',
            'clients' => "Clients",
            'settings' => "Settings",
            'serviceRequests' => "ServiceRequests",
            'notes' => 'Notes'
        ],
    ];

    public static function getFields($type = null)
    {
        switch ($type) {
            case '':
            case 'list':
                $fields = array_diff(array_keys(static::$shortNames), ['childs']);
                break;
            default:
                $fields = array_keys(static::$dicNames);
        }
        return $fields;
    }

    public static function getChildEntityClass($name)
    {
        $dd = static::$shortNames;
        if ($childClass = Utils::deep_array_value(['childs', $name], static::$shortNames)) {
            return static::ns . $childClass;
        }
        return null;
    }

    public static function getChildShortNames($name)
    {
        if ($ec = self::getChildEntityClass($name)) {
            return $ec::$shortNames;
        }
        return null;
    }

    public static function getShortName($name)
    {
        $names = static::$shortNames;
        $keys = explode('.', $name);
        foreach ($keys as $k) {
            $short = array_key_exists($k, $names) ? $names[$k] : null;
            if ($childClass = Utils::deep_array_value(['childs', $k], $names)) {
                $ec = static::ns . $childClass;
                $names = $ec::$shortNames;
            }
        }
        return $short ? $short : $name;
    }

// </editor-fold>

    private function toShowData($field, $options = [])
    {
        $val = null;
        Utils::deep_array_value_set('shortNames', $options, true);
        if (Utils::is_sequential_array($field) || $field instanceof \Traversable) {
            $val = [];
            foreach ($field as $f) {
                array_push($val, $this->toShowData($f, $options));
            }
        } elseif (gettype($field) == 'object') {
            if ($field instanceof \DateTime) {
                $val = self::getTimeField($field, $options);
            } else {
                if (method_exists($field, 'getShowData')) {
                    $val = $field->getShowData(false, $options);
                } elseif (method_exists($field, 'getId')) {
                    $val = $field->getId();
                }
            }
        } else {
            $val = $field;
        }
        return $val;
    }

    public function getShowData($jsonEncode = false, $options = [])
    {
        $data = [];
        if ($this->getId()) {
            $en = Utils::deep_array_value('en', $options);
            if (is_string($en)) {
                $en = [$en];
                $options['en'] = $en;
            }
            if (is_array($en)) {
                if (in_array(static::en, $en)) {
                    return $this->getId();
                } else {
                    array_push($options['en'], static::en);
                }
            } else {
                $options['en'] = [static::en];
            }
            $type = Utils::deep_array_value('type', $options, '');
            $typePrefix = join('_', array_diff($options['en'], [static::en]));
            if ($typePrefix != '') {
                $type = $type == '' ? $typePrefix : $typePrefix . '_' . $type;
            }
            $short = Utils::deep_array_value('shortNames', $options);
            if ($short) {
                $fnShortName = is_string($short) ? 'get' . ucfirst($short) . 'Name' : 'getShortName';
            } else {
                $fnShortName = false;
            }
            // Utils::deep_array_value_set('shortNames', $options, 'short');
            // $fnShortName= is_string($options['shortNames']) ? 'get'.ucfirst($options['shortNames']).'Name' : false;
            $fields = static::getFields($type);
            foreach ($fields as $f) {
                if (is_array($f)) {
                    $name = $f['name'];
                    // $jf=Utils::deep_array_value('joinField', $f);
                    // if(\is_array($jf)){
                    //     $name= array_key_exists('as', $jf) ? $jf['as'] : $name.'.'.$jf['name'];
                    // }
                } else {
                    $name = $f;
                }
                $key = $fnShortName ? static::$fnShortName($name) : $name;
                $fnShow = 'getShow' . ucfirst($name);
                $fn = 'get' . ucfirst($name);
                if (method_exists($this, $fnShow)) {
                    $field = $this->$fnShow($options);
                } elseif (method_exists($this, $fn)) {
                    $field = $this->$fn($options);
                } else {
                    $field = null;
                }
                $data[$key] = $this->toShowData($field, $options);
            }
        }
        return $jsonEncode ? json_encode($data) : $data;
    }

    public static function getTimeField($time, $options = [])
    {
        return Utils::dateTimeStr($time, Utils::deep_array_value('strDate', $options, 'date') == 'time');
    }

    public static function getFieldData($entity, $fieldName, $prefix = 'get')
    {
        $fn = $prefix . ucfirst($fieldName);
        if (gettype($entity) == 'object' && method_exists($entity, $fn)) {
            return $entity->$fn();
        }
        return null;
    }

    public function getStrField($fieldName)
    {
        $fields = explode('.', $fieldName);
        $fieldName = array_pop($fields);
        $entity = $this;
        for ($i = 0, $count = count($fields); $i < $count; $i++) {
            $entity = self::getFieldData($entity, $fields[$i]);
        }
        if (is_null($field = self::getFieldData($entity, $fieldName, 'getStr'))) {
            $field = self::getFieldData($entity, $fieldName);
        }
        return $this->toStrData($field);
    }

    public function getFieldsStr($fields)
    {
        $fieldsStr = [];
        foreach ($fields as $name) {
            $fieldsStr[$name] = $this->getStrField($name);
        }
        return $fieldsStr;
    }

    public function toStrData($field)
    {
        if (is_string($field)) {
            return $field;
        }
        $val = '';
        if (Utils::is_sequential_array($field) || $field instanceof \Traversable) {
            $val = json_encode($field);
        } elseif (gettype($field) == 'object') {
            if ($field instanceof \DateTime) {
                $val = self::getTimeField($field);
            } else {
                if (method_exists($field, '__toString')) {
                    $val = $field->__toString();
                } elseif (method_exists($field, 'getId')) {
                    $val = $field->getId();
                }
            }
        } else {
            $val = (string) $field;
        }
        return $val;
    }

    public function getSuccessFields($type)
    {
        return [];
    }

    public function getMessageDataFields($type)
    {
        return [];
    }

    public function getMessageData($type, $dataReturn=[]){
        $data=[];
        foreach($this->getMessageDataFields($type) as $f){
            $data[]=$this->getStrField($f);
        }
        return $data;
    }


    public function getSuccessData($type)
    {
        $data = [
            "fields" => [],
        ];
        switch ($type) {
            case 'create':
            case 'update':
                $data['entity_data'] = $this->getShowData();
            case 'remove':
            default:
        }
        $data['fields'] = $this->getFieldsStr($this->getSuccessFields($type));
        return $data;
    }

    public function getDataDelete()
    {
        $data = [
            'id' => $this->getId(),
        ];
        return $data;
    }

    public function genMessage($msg, $entityClassName = null, $include = [])
    {
        if ($this->controller) {
            $msg = $this->controller->trans($this->controller->messageText($msg, $entityClassName ? $entityClassName : static::ec));
            if ($count = count($include)) {
                $search = [];
                for ($i = 1; $i <= $count; $i++) {
                    $search[] = '%' . $i;
                }
                $msg = str_replace($search, $include, $msg);
            }
        }
        return $msg;
    }

    public function preUpdate(){
        return $this;
    }

    public function postUpdate($em){
        return $this;
    }

//  <editor-fold defaultstate="collapsed" desc="Variables">
    /**
     * @var integer
     */
    protected $id;

    // /**
    //  * @var string
    //  */
    // private $name;

    /**
     * @var \Doctrine\Common\Collections\Collection
     */
    private $userGroups;

    /**
     * @var \Doctrine\Common\Collections\Collection
     */
    private $clients;

    /**
     * @var \Doctrine\Common\Collections\Collection
     */
    private $settings;

    /**
     * @var \Doctrine\Common\Collections\Collection
     */
    private $serviceRequests;

    /**
     * @var \Doctrine\Common\Collections\Collection
     */
    private $notes;
// </editor-fold>

    public function __construct($options = [])
    {
        $this->userGroups = new ArrayCollection();
        $this->clients = new ArrayCollection();
        $this->settings = new ArrayCollection();
        $this->serviceRequests = new ArrayCollection();
        $this->notes = new ArrayCollection();
        $defaults = Utils::deep_array_value('defaults', $options);
        $this->controller = Utils::deep_array_value('controller', $options);
        if (is_array($defaults)) {
            foreach ($defaults as $name => $value) {
                $fnInit = 'init' . ucfirst($name);
                if (method_exists($this, $fnInit)) {
                    $this->$fnInit($this->controller, $value);
                }
            }
        }
        parent::__construct();
    }

    public function __toString()
    {
        return $this->id;
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

    // /**
    //  * Set name
    //  *
    //  * @param string $name
    //  *
    //  * @return Users
    //  */
    // public function setName($name)
    // {
    //     $this->name = $name;

    //     return $this;
    // }

    // /**
    //  * Get name
    //  *
    //  * @return string
    //  */
    // public function getName()
    // {
    //     return $this->name;
    // }

    /**
     * Add userGroup
     *
     * @param \AppBundle\Entity\UsersGroups $userGroup
     *
     * @return Users
     */
    public function addUserGroup(\AppBundle\Entity\UsersGroups $userGroup)
    {
        $this->userGroups[] = $userGroup;

        return $this;
    }

    /**
     * Remove userGroup
     *
     * @param \AppBundle\Entity\UsersGroups $userGroup
     */
    public function removeUserGroup(\AppBundle\Entity\UsersGroups $userGroup)
    {
        $this->userGroups->removeElement($userGroup);
    }

    /**
     * Get userGroups
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getUserGroups()
    {
        return $this->userGroups;
    }

    /**
     * Add client
     *
     * @param \AppBundle\Entity\Clients $client
     *
     * @return Users
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

    public function hasClient(\AppBundle\Entity\Clients $client = null)
    {
        return $client ? $this->clients->contains($client) : false;
    }

    /**
     * Add setting
     *
     * @param \AppBundle\Entity\Settings $setting
     *
     * @return Users
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
     * Add serviceRequest
     *
     * @param \AppBundle\Entity\ServiceRequests $serviceRequest
     *
     * @return Users
     */
    public function addServiceRequest(\AppBundle\Entity\ServiceRequests $serviceRequest)
    {
        $this->serviceRequests[] = $serviceRequest;

        return $this;
    }

    /**
     * Remove serviceRequest
     *
     * @param \AppBundle\Entity\ServiceRequests $serviceRequest
     */
    public function removeServiceRequest(\AppBundle\Entity\ServiceRequests $serviceRequest)
    {
        $this->serviceRequests->removeElement($serviceRequest);
    }

    /**
     * Get serviceRequests
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
     * @return Users
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

    public function getLastLoginStr()
    {
        if ($this->lastLogin) {
            return $this->lastLogin->format("Y-m-d");
        } else {
            return "";
        }
    }

}
