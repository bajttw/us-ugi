<?php

namespace AppBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;

/**
 * Notes
 */
class Notes extends AppEntity
{
    const en = 'notes';
    const ec = 'Notes';

    // <editor-fold defaultstate="collapsed" desc="Fields utils">
    public static $shortNames = [
        'id' => 'id',
        'title' => 't',
        'content' => 'c',
        'created' => 'cr',
        'term' => 'term',
        'status' => 's',
        'type' => 't',
        'options' => 'o',
        'uploads' => 'u',
        'childs' => [
            'uploads' => 'Uploads',
        ],
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
    private $content;

    /**
     * @var \DateTime
     */
    private $created;

    /**
     * @var \DateTime
     */
    private $term;

    /**
     * @var integer
     */
    private $status = 1;

    /**
     * @var integer
     */
    private $type = 1;

    /**
     * @var string
     */
    private $options;

    /**
     * @var \Doctrine\Common\Collections\Collection
     */
    private $uploads;
    // </editor-fold>
    /**
     * Constructor
     */
    public function __construct($options = [])
    {
        $this->uploads = new ArrayCollection();
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
     * @return Notes
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
     * Set content
     *
     * @param string $content
     *
     * @return Notes
     */
    public function setContent($content)
    {
        $this->content = $content;

        return $this;
    }

    /**
     * Get content
     *
     * @return string
     */
    public function getContent()
    {
        return $this->content;
    }

    /**
     * Set created
     *
     * @param \DateTime $created
     *
     * @return Notes
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
     * Set term
     *
     * @param \DateTime $term
     *
     * @return Notes
     */
    public function setTerm($term)
    {
        $this->term = $term;

        return $this;
    }

    /**
     * Get term
     *
     * @return \DateTime
     */
    public function getTerm()
    {
        return $this->term;
    }

    /**
     * Set status
     *
     * @param integer $status
     *
     * @return Notes
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
     * Set type
     *
     * @param integer $type
     *
     * @return Notes
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
     * Set options
     *
     * @param string $options
     *
     * @return Notes
     */
    public function setOptions($options)
    {
        $this->options = $options;

        return $this;
    }

    /**
     * Get options
     *
     * @return string
     */
    public function getOptions()
    {
        return $this->options;
    }

    /**
     * Add upload
     *
     * @param \AppBundle\Entity\Uploads $upload
     *
     * @return Notes
     */
    public function addUpload(\AppBundle\Entity\Uploads $upload)
    {
        $this->uploads[] = $upload;

        return $this;
    }

    /**
     * Remove upload
     *
     * @param \AppBundle\Entity\Uploads $upload
     */
    public function removeUpload(\AppBundle\Entity\Uploads $upload)
    {
        $this->uploads->removeElement($upload);
    }

    /**
     * Get uploads
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getUploads()
    {
        return $this->uploads;
    }
    // </editor-fold>

    /**
     * @ORM\PrePersist
     */
    public function prePersistNotes()
    {
        if (is_null($this->created)) {
            $this->created = new \DateTime();
        }
    }
}
