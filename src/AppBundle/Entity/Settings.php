<?php

namespace AppBundle\Entity;
use Doctrine\ORM\Mapping as ORM;
use AppBundle\Utils\Utils as Utils;
use Doctrine\Common\Collections\ArrayCollection;

/**
 * Settings
 */
class Settings extends AppEntity
{
    const en = 'settings';
    const ec = 'Settings';

    //  <editor-fold defaultstate="collapsed" desc="Fields">
    public static $shortNames = [
        'id' => 'id',
        'client' => 'cl',
        'name' => 'n',
        'value' => 'v',
        'description' => 'd',
        'childs' => [
            'client' => 'Clients',
        ],
    ];

    public static function getFields($type = null)
    {
        switch ($type) {
            case '':
                $fields = parent::getFields($type);
                break;
            case 'list':
                $fields = [
                    'id',
                    [
                        'name' => 'client',
                        'joinField' => [
                            ['name' => 'name'],
                            ['name' => 'code'],
                        ],
                    ],
                    'name',
                    'value',
                    'description',
                ];
                break;
            default:
                $fields = ['id', 'name', 'value'];
        }
        return $fields;
    }

    public function getSuccessFields($type)
    {
        $fields = [];
        switch ($type) {
            case 'create':
                $fields = ['name'];
                break;
            case 'update':
                break;
            case 'remove':
            default:
        }
        return $fields;
    }

    // </editor-fold>

    // <editor-fold defaultstate="collapsed" desc="Variables">

    private $id;
    private $client;
    private $name;
    private $value;
    private $description;
    // </editor-fold>

    public function getArray($options = [])
    {
        $asArray = array_key_exists('asArray', $options) ? $options['asArray'] : true;
        $shortNames = array_key_exists('shortNames', $options) ? $options['shortNames'] : false;
        $fields = self::$shortNames;
        $keys = ['id', 'name', 'value', 'description'];
        $data = [];
        foreach ($keys as $key) {
            if ($shortNames) {
                $data[$fields[$key]] = $this->$key;
            } else {
                $data[$key] = $this->$key;
            }
        }
        return $asArray ? $data : \json_encode($data);
    }

    public function getDataDelete()
    {
        $data = [
            'id' => $this->getId(),
            'name' => $this->getName(),
            'client' => $this->client ? $this->client->getName() : '',
            'value' => $this->getValue(),
            'description' => $this->getDescription(),
        ];
        return $data;
    }

    // <editor-fold defaultstate="collapsed" desc="Fields functions">
    public function getId()
    {
        return $this->id;
    }

    public function setName($name)
    {
        $this->name = strtolower($name);
        return $this;
    }

    public function getName()
    {
        return $this->name;
    }

    /**
     * Set client
     *
     * @param \AppBundle\Entity\Clients $client
     *
     * @return Settings
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

    public function setValue($value)
    {
        $this->value = is_array($value) ? json_encode($value) : $value;
        return $this;
    }

    public function getValue()
    {
        return $this->value;
    }

    public function decodeValue()
    {
        return json_decode($this->value, true);
    }

    public function setDescription($description)
    {
        $this->description = $description;
        return $this;
    }

    public function getDescription()
    {
        return $this->description;
    }

    // </editor-fold>
}
