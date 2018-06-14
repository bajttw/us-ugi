<?php
namespace AppBundle\DTO;
class clientDTO
{
    public $name = null;
    public $code = null;
    public function __construct($name, $code)
    {
        $this->name=$name;
        $this->code=$code;
    }
}