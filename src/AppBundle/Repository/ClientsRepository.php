<?php

namespace AppBundle\Repository;

/**
 * ClientsRepository
 *
 * This class was generated by the Doctrine ORM. Add your own custom
 * repository methods below.
 */
class ClientsRepository extends AppRepository
{

    public function getDic($options = [])
    {
        Utils::deep_array_value_set('order', $options, 'name');
        return parent::getDic($options);
    }

}
