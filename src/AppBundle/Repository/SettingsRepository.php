<?php

namespace AppBundle\Repository;

use AppBundle\Utils\Utils;

class SettingsRepository extends AppRepository
{
    private function setOptionsFilters(&$options, $name, $like = false)
    {
        $options['filters']['name'] = [
            'name' => 'name',
        ];
        if ($like) {
            $options['filters']['name']['value'] = "'" . $name . "%'";
            $options['filters']['name']['options'] = [
                'type' => 'like',
            ];

        } else {
            $options['filters']['name']['value'] = "'" . $name . "'";
        }
        if (!array_key_exists('client', $options['filters'])) {
            $options['filters']['client'] = [
                'name' => 'client',
                'value' => Utils::deep_array_value('clients', $options)
            ];
        }
        return $this;
    }

    // public function getSettings($prefix, $asArray=null){
    //     $prefix = strtolower($prefix);
    //     $pref_reg='/'.$prefix.'[-]?/';
    //     $this
    //         ->getOptions([
    //             'query' =>  'e.name, e.value'
    //         ])
    //         ->selectFrom()
    //         ->qb
    //             ->andWhere("e.name LIKE '".$prefix."%'")
    //             ->orderBy('e.name')
    //     ;
    //     $entities=$this->getResult($asArray);
    //     return $entities;
    // }

    public function getSettings($prefix, $options = [])
    {
        if (!isset($options['query'])) {
            $options['query'] = $this->generateQuery($this->getQueryFields('default'));
        }
        $this
            ->init()
            ->setOptionsFilters($options, strtolower($prefix), true);
        return $this->action($options);
    }

    // public function getSettingsValue($prefix, $asJSON=false){
    //     $prefix = strtolower($prefix);
    //     $pref_reg='/'.$prefix.'[-]?/';
    //     $entities=$this->getSettings($prefix);
    //     $result=[];
    //     foreach ($entities  as $e){
    //         $keys =  explode('-', preg_replace($pref_reg, "", $e['name']));
    //         $val =json_decode($e['value'], true);
    //         while ($k=array_pop($keys)){
    //             $val=[ $k => $val ];
    //         }
    //         $result=array_merge_recursive($result, $val);
    //     }
    //     return $asJSON ? json_encode($result) : $result;
    // }

    public function getSettingsValue($prefix, $options = [])
    {
        $prefix = strtolower($prefix);
        $pref_reg = '/' . $prefix . '[-]?/';
        $entities = $this->getSettings($prefix, $options);
        $result = [];
        foreach ($entities as $e) {
            $keys = explode('-', preg_replace($pref_reg, "", $e['n']));
            $val = json_decode($e['v'], true);
            while ($k = array_pop($keys)) {
                $val = [$k => $val];
            }
            $result = array_merge_recursive($result, $val);
        }
        return $result;
    }

    // public function getSetting($name){
    //     $entity=$this->findOneBy(["name" => $name]);
    //     return $entity;
    // }

    public function getSetting($name, $options = [])
    {
        $ff = 1;
        $this
            ->init()
            ->setOptionsFilters($options, strtolower($name))
            ->getOptions($options)
            ->selectFrom()
            ->addFilters();
        return $this->getOneResult();
    }

    public function getSettingValue($name, $options = [])
    {
        $entity = $this->getSetting($name, $options);

        return isset($entity) ? json_decode($entity->getValue(), true) : null;
    }
}
