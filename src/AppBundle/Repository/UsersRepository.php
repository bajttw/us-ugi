<?php

namespace AppBundle\Repository;

class UsersRepository extends AppRepository
{
    public function __construct($em, $class)
    {
        $this->activeFilter = ['enabled' => ['value' => true]];
        parent::__construct($em, $class);
    }

    public function getDic($options = [])
    {
        Utils::deep_array_value_set('order', $options, 'id');
        return parent::getDic($options);
    }

}
