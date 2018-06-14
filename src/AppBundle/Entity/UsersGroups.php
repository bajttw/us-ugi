<?php
namespace AppBundle\Entity;

/**
 * UsersGroups
 */
class UsersGroups extends AppEntity
{
    const en='usersgroups';
    const ec='UsersGroups';
    
 // <editor-fold defaultstate="collapsed" desc="Fields utils">    
    public static $dicNames=[
        'id' => 'v',
        'name' => 'n',
        'description' => 'd'
    ];

    public static $shortNames=[
        'id' => 'id',
        'name' => 'n',
        'code' => 'c',
        'description' => 'd',
        'childs' => [
            'users' => 'Users'
        ]
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
    private $name;

    /**
     * @var string
     */
    private $code = 'N';

    /**
     * @var string
     */
    private $description;
 // </editor-fold>

 //  <editor-fold defaultstate="collapsed" desc="Variables">    

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
     * @return UsersGroups
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
     * Set code.
     *
     * @param string $code
     *
     * @return UsersGroups
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
     * Set description
     *
     * @param string $description
     *
     * @return UsersGroups
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
 // </editor-fold>

    /**
     * @var \Doctrine\Common\Collections\Collection
     */
    private $users;


    /**
     * Add user.
     *
     * @param \AppBundle\Entity\Users $user
     *
     * @return UsersGroups
     */
    public function addUser(\AppBundle\Entity\Users $user)
    {
        $this->users[] = $user;

        return $this;
    }

    /**
     * Remove user.
     *
     * @param \AppBundle\Entity\Users $user
     *
     * @return boolean TRUE if this collection contained the specified element, FALSE otherwise.
     */
    public function removeUser(\AppBundle\Entity\Users $user)
    {
        return $this->users->removeElement($user);
    }

    /**
     * Get users.
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getUsers()
    {
        return $this->users;
    }
}
