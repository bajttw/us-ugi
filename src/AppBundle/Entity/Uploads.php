<?php

namespace AppBundle\Entity;

//use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\HttpFoundation\File\UploadedFile as UploadedFile ;
use Symfony\Component\HttpFoundation\File\File;
use AppBundle\Utils\Utils;
use AppBundle\Utils\UploadHandler as UploadHandler;

/**
 * Uploads
 */
class Uploads extends AppEntity
{
    const en = 'uploads';
    const ec = 'Uploads';

    public static $types = ['tmp', 'clients', 'notes'];

// <editor-fold defaultstate="collapsed" desc="Fields utils">
    public static $dicNames = [
        'id' => 'id',
        'name' => 'img',
        'url' => 'url',
    ];

    public static $shortNames = [
        'id' => 'id',
        'name' => 'n',
        'original' => 'o',
        'type' => 't',
        'uploadType' => 'ut',
        'path' => 'p',
        'url' => 'url',
        'size' => 's',
    ];

    public static function getFields($type = null)
    {
        switch ($type) {
            case '':
                $fields = diff_array(parent::getFields($type));
                break;
            default:
                $fields = ['id', 'name', 'url'];
        }
        return $fields;
    }

// </editor-fold>

// <editor-fold defaultstate="collapsed" desc="Variables">
    private $id;
    private $name;
    private $original;
    private $path;
    private $url;
    private $size;
    private $type;
    private $uploadType = 0;
// </editor-fold>

// <editor-fold defaultstate="collapsed" desc="Variables extra">
    private $old = array('name' => '', 'file' => '', 'thumbnail' => '');
// </editor-fold>

//  <editor-fold defaultstate="collapsed" desc="Data functions">
    public function __toString()
    {
        return $this->getFileUrl();
    }

    public function getData($jsonEncode = true, $options = [])
    {
        $data = [
            'id' => $this->getId(),
            'path' => $this->getPath(),
            'uploadType' => $this->getUploadType(),
            'type' => $this->getType(),
            'url' => $this->getUrl(),
            'fullUrl' => $this->getFullUrl(),
            'name' => $this->getName(),
            'original' => $this->getOriginal(),
            'size' => $this->getSizeStr(),
        ];
        return $jsonEncode ? json_encode($data) : $data;
    }

    public function setData($data)
    {
        if (!is_array($data)) {
            return null;
        }

        foreach ($data as $key => $value) {
            if (property_exists($this, $key)) {
                $this->$key = $value;
            }
        }
        return $this;
    }
// </editor-fold>

// <editor-fold defaultstate="collapsed" desc="Fields functions">
    public function setId($id)
    {
        // $this->id=($id);
    }

    public function getId()
    {
        return $this->id;
    }

    public function setName($name)
    {
        $this->name = $name;
        return $this;
    }

    public function getName()
    {
        return $this->name;
    }

    public function setOriginal($original)
    {
        $this->original = $original;
        return $this;
    }

    public function getOriginal()
    {
        return $this->original;
    }

    public function setType($type)
    {
        $this->type = $type;
        return $this;
    }

    public function getType()
    {
        return $this->type;
    }

    public function setUploadType($uploadType)
    {
        $this->uploadType = $uploadType;
        return $this;
    }

    public function getUploadType()
    {
        return $this->uploadType;
    }

    public function changeUploadType($newUploadType)
    {
        if ($this->uploadType != $newUploadType) {
            $this->moveFile(self::$types[$this->uploadType], self::$types[$newUploadType]);
            $this->uploadType = $newUploadType;
        }
    }

    public function setPath($path)
    {
        $this->path = $path;
        return $this;
    }

    public function getPath()
    {
        return $this->path;
    }

    public function setUrl($url)
    {
        $this->url = $url;
        return $this;
    }

    public function getUrl()
    {
        return $this->url;
    }

    public function getFullUrl()
    {
        return UploadHandler::getFullUrl() . $this->url;
    }

    public function setSize($size)
    {
        $this->size = $size;
        return $this;
    }
    public function getSize()
    {
        return $this->size;
    }
    public function getSizeStr()
    {
        $s = $this->size;
        return ($s >= 1024) ? round($s / 1024, 1) . ' MB' : round($s, 1) . ' KB';
    }
// </editor-fold>

    public function setFile($uploadedFile)
    {
        $this->setPath($uploadedFile->path);
        $this->url = str_replace($uploadedFile->name, "", $uploadedFile->url);
        $this->original = $uploadedFile->original;
        $this->name = $uploadedFile->name;
        $this->size = $uploadedFile->size;
        $this->type = $uploadedFile->type;
    }

    public function getFilePath($subdir = '')
    {
        if ($this->name != null) {
            $filepath = $this->getPath() . ($subdir == '' ? '' : $subdir . DIRECTORY_SEPARATOR) . $this->getName();
            return file_exists($filepath) ? $filepath : null;
        }
        return null;
    }

    public function getFileUrl($subdir = '')
    {
        return $this->getFullUrl() . ($subdir == '' ? '' : $subdir . DIRECTORY_SEPARATOR) . $this->getName();
    }
    public function getThumbnailPath()
    {
        return $this->getFilePath('thumbnail');
    }
    public function getThumbnailUrl()
    {
        return $this->getFileUrl('thumbnail');
    }

    private function moveFile($oldFolder, $newFolder)
    {
        if ($filepath = $this->getFilePath()) {
            $newPath = str_replace($oldFolder, $newFolder, $this->path);
            $file = new File($filepath);
            $file->move($newPath);
            if ($thumbpath = $this->getThumbnailPath()) {
                $thumb = new File($thumbpath);
                $thumb->move($newPath . 'thumbnail' . DIRECTORY_SEPARATOR);
            }
            $this->path = $newPath;
            $this->url = str_replace($oldFolder, $newFolder, $this->url);
            $this->url = str_replace($this->name, "", $this->url);
        }
    }
    public function removeUpload()
    {
        if ($file = $this->getFilePath()) {
            unlink($file);
        }
        if ($thumbnail = $this->getThumbnailPath()) {
            unlink($thumbnail);
        }
    }

}
