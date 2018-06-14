<?php

namespace AppBundle\Repository;

//use Doctrine\Common\Persistence\ObjectRepository;

use AppBundle\Utils\Utils;
use Doctrine\ORM\EntityRepository;

class AppRepository extends EntityRepository
{
    protected $entityNameSpace = '';
    protected $shortNames = null;
    protected $filters = [];
    protected $toJoin = [];
    protected $joined = [];
    protected $childrenFilters = [];
    protected $query = 'e';
    protected $order = null;
    protected $asArray = true;
    protected $byId = false;
    protected $qb;
    protected $em;
    protected $subquery = [];
    protected $activeFilter = ['active' => ['value' => 1]];

    protected function init()
    {
        $this->filters = [];
        $this->toJoin = [];
        $this->joined = [];
        $this->childrenFilters = [];
        $this->query = 'e';
        $this->order = null;
        return $this;
    }

    public function __construct($em, $class)
    {
        $this->entityNameSpace = $class->name;
        parent::__construct($em, $class);
    }

    protected function getOptions($options, $default = [])
    {
        if (is_array($options)) {
            $p = array_replace_recursive($default, $options);
            if (isset($p['query'])) {
                $this->query = $p['query'];
            }
            if (isset($p['as_array'])) {
                $this->asArray = $p['as_array'];
            }
            if (isset($p['by_id'])) {
                $this->byId = $p['by_id'];
            }
            if (isset($p['filters'])) {
                $this->filters = $p['filters'];
            }
            if (isset($p['order'])) {
                $this->order = $p['order'];
            }
        }
        return $this;
    }

    protected function getShortNames()
    {
        if (!is_array($this->shortNames)) {
            $entityNameSpace = $this->entityNameSpace;
            $this->shortNames = $entityNameSpace::$shortNames;
        }
        return $this->shortNames;
    }

    protected function getChildShortNames($name)
    {
        $entityNameSpace = $this->entityNameSpace;
        return $entityNameSpace::getChildShortNames($name);
    }

    protected function getShortName($name, $fieldNames = null)
    {
        if (!isset($fieldsNames)) {
            $fieldsNames = $this->getShortNames();
        }
        return Utils::deep_array_value($name, $fieldNames, $name);
    }

    protected function getDicNames()
    {
        if (!is_array($this->shortNames)) {
            $entityNameSpace = $this->entityNameSpace;
            $this->shortNames = $entityNameSpace::$dicNames;
        }
        return $this->shortNames;
    }

    protected function getQueryFields($type = '')
    {
        $entityNameSpace = $this->entityNameSpace;
        return $entityNameSpace::getFields($type);
    }

    protected function generateQuery($fields = null, $fieldsNames = null, $short = true)
    {
        if (!isset($fieldsNames)) {
            $fieldsNames = $this->getShortNames();
        }
        if (!isset($fields)) {
            $fields = array_keys($fieldsNames);
        }
        if (is_array($fields) && count($fields) > 0) {
            $q = [];
            foreach ($fields as $field) {
                if (is_array($field)) {
                    $fn = $field['name'];
                    if (\array_key_exists('joinField', $field)) {
                        $q = array_merge($q, $this->addJoinedFields($fn, $field['joinField'], $fieldsNames, $short));
                    } else {
                        $q[] = Utils::deep_array_value('prefix', $field, '') .
                        'e.' . $fn .
                        Utils::deep_array_value('sufix', $field, '') .
                            ' AS ' .
                            ($short ? $this->getShortName($fn, $fieldsNames) : $fn);
                    }
                } else {
                    if (strpos($field, '.')) {
                        $q[] = $field;
                    } else {
                        $q[] = 'e.' . $field .
                            ' AS ' .
                            ($short ? $this->getShortName($field, $fieldsNames) : $field);
                    }

                    // $f=strpos($field, '.') > 0 ? $field : 'e.'.$field;
                    // $sn=($short && array_key_exists($field, $fieldsNames)) ? $fieldsNames[$field] : null;
                    // $q[]= isset($sn) ? $f.' as '.$sn : $f;
                }

                // if(is_string($field)){
                //     $f=strpos($field, '.') > 0 ? $field : 'e.'.$field;
                //     $sn=($short && array_key_exists($field, $fieldsNames)) ? $fieldsNames[$field] : null;
                //     $q[]= isset($sn) ? $f.' as '.$sn : $f;
                // }else{

                //     $q=array_merge($q, $this->addJoinedFields($field['name'], $field['fields']));
                // }
            }
            return implode(', ', $q);
        }
        /*
        if (is_array($fs) && count($fs) > 0){
        $q=[];
        if (array_keys($fs) !== range(0, count($fs) - 1)){ //is associative
        foreach ($fs as $name => $sname){
        if (is_string($sname)){
        $f= strpos($name, '.') > 0 ? $name : 'e.'.$name;
        $q[]= $short ? $f.' as '.$sname : $f;
        }
        }
        }else{
        foreach ($fs as $name){
        $q[]='e.'.$name;
        }
        }
        return implode(', ', $q);
        }
         */
        return null;
    }

    protected function addJoinedFields($joined, $joinFields, $fieldsNames = null, $short = true)
    {
        if (!is_array($fieldsNames)) {
            $fieldsNames = $this->getShortNames();
        }
        $fields = [];
        $joined = is_array($joined) ? $joined : \explode('.', $joined);
        $this->toJoin[] = $joined;
        $pj = $this->getJoinedAlias(end($joined));
        if (is_string($joinFields)) {
            $joinFields = ['name' => $joinFields];
        }
        if (\array_key_exists('name', $joinFields)) {
            $joinFields = [$joinFields];
        }
        foreach ($joinFields as $field) {
            if (is_array($field)) {
                $fn = Utils::deep_array_value('name', $field);
                if (\array_key_exists('statement', $field)) {
                    $statement = $field['statement'];
                } else {
                    $statement = $pj . '.' . $fn;
                }
                $f = Utils::deep_array_value('prefix', $field, '') .
                $statement .
                Utils::deep_array_value('sufix', $field, '') .
                    ' AS ';
                if (\array_key_exists('as', $field)) {
                    $f .= $short ? $this->getShortName($field['as'], $fieldsNames) : $field['as'];
                } elseif ($fn) {
                    $f .= $this->getJoinedFieldAlias($joined, $fn, $fieldsNames, $short);
                } else {
                    $f .= $short ? $this->getShortName(end($joined), $fieldsNames) : $joined;
                }
            } else {
                $fn = $field;
                $statement = $pj . '.' . $fn;
                $f = $statement . ' AS ' . $this->getJoinedFieldAlias($joined, $fn, $fieldsNames, $short);
            }
            $fields[] = $f;

            // $fn= Utils::deep_array_value('name', $field, $field);
            // $statement=Utils::deep_array_value('statement', $field, $pj.'.'.$fn);
            // $f=Utils::deep_array_value('prefix', $field, '').
            //     $statement.
            //     Utils::deep_array_value('sufix', $field, '').
            //     ' AS ';
            // if(\array_key_exists('as', $field)){
            //     $f.= $this->getShortName( $field['as'], $fieldsNames);
            // }else{
            //     $f.= $this->getJoinedFieldAlias($joined, $fn, $fieldsNames, $short);
            // }
            // $fields[]=$f;
        }
        return $fields;
    }

    protected function getJoinedAlias($name)
    {
        return $name ? 'e_' . $name : 'e';
    }

    // protected function getJoinedFieldAlias($joinedName, $name, $fieldsNames=null, $short=true){
    //     if(!isset($fieldsNames)){
    //         $fieldsNames = $this->getShortNames();
    //     }
    //     if($short){
    //         $sj= Utils::deep_array_value($joinedName, $fieldsNames, $joinedName);
    //         $entityNameSpace=$this->entityNameSpace;
    //         $sf= Utils::deep_array_value($name, $entityNameSpace::getChildShortNames($joinedName), $name);
    //         return $sj.'_'.$sf;
    //     }else{
    //         return $joinedName.'_'.$name;
    //     }
    // }

    protected function getJoinedFieldAlias($joinedName, $name, $fieldsNames = null, $short = true)
    {
        if (!isset($fieldsNames)) {
            $fieldsNames = $this->getShortNames();
        }
        $names = is_array($joinedName) ? $joinedName : \explode('.', $joinedName);
        $names[] = $name;

        if ($short) {
            $ec = $this->entityNameSpace;
            for ($i = 0; $i < count($names); $i++) {
                $n = $names[$i];
                $names[$i] = Utils::deep_array_value($n, $fieldsNames, $n);
                if ($ec = $ec::getChildEntityClass($n)) {
                    $fieldsNames = $ec::$shortNames;
                }
            }
        }

        return join('_', $names);
    }

    // protected function addJoin($name){
    //     $joinedAlias=$this->getJoinedAlias($name);
    //     if (!in_array($name, $this->joined)){
    //         $this->qb->leftJoin('e.'.$name, $joinedAlias);
    //         array_push($this->joined, $name);
    //     }
    //     return $joinedAlias;
    // }

    protected function addJoin($name)
    {
        if (!is_array($name)) {
            $name = explode('.', $name);
        }
        $joinedAlias = [];
        $en = 'e';
        for ($i = 0; $i < count($name); $i++) {
            $joinedAlias[$i] = $this->getJoinedAlias($name[$i]);
            if (!in_array($name[$i], $this->joined)) {
                $this->qb->leftJoin($en . '.' . $name[$i], $joinedAlias[$i]);
                array_push($this->joined, $name[$i]);
            }
            $en = $joinedAlias[$i];
        }
        return $joinedAlias;
    }
    protected function expBetween($fname, $value, $not = false)
    {
        if (!is_array($value)) {
            $value = Utils::is_JSON_string($value) ? json_decode($value) : explode(" - ", $value);
        }
        if (count($value) == 1) {
            array_push($value, $value[0]);
        }
        return $not ?
        $this->qb->expr()->not($this->qb->expr()->between($fname, $value[0], $value[1])) :
        $this->qb->expr()->between($fname, $value[0], $value[1]);
    }

    protected function expDatePeriod($fname, $value, $not = false)
    {
        $period = explode(" - ", $value);
        $date1 = new \DateTime($period[0] . " 00:00:00");
        $date2 = new \DateTime($period[1] . " 23:59:59");
        return $not ?
        $this->qb->expr()->not($this->qb->expr()->between($fname, "'" . $date1->format('Y-m-d H:i:s') . "'", "'" . $date2->format('Y-m-d H:i:s') . "'")) :
        $this->qb->expr()->between($fname, "'" . $date1->format('Y-m-d H:i:s') . "'", "'" . $date2->format('Y-m-d H:i:s') . "'");
    }

    protected function expSet($fname, $value, $not = false)
    {
        if (is_string($value)) {
            $value = $value == "true" || $value == "1";
        }
        return ($value xor $not) ? $this->qb->expr()->isNotNull($fname) : $this->qb->expr()->isNull($fname);
    }

    protected function expIsNull($fname, $value, $not = false)
    {
        return $not ? $this->qb->expr()->isNotNull($fname) : $this->qb->expr()->isNull($fname);
    }

    protected function expDefault($fname, $value, $not = false, $filter = [])
    {
        if ( !is_int($value) && ( is_null($value) || $value == 'null') ) {
            return $this->expIsNull($fname, $value, $not);
        }
        $condition = strtolower(Utils::deep_array_value('condition', $filter, 'eq'));
        return $this->qb->expr()->$condition($fname, $value);
    }

    protected function expIn($fname, $value, $not = false)
    {
        $isnull = false;
        for ($i = 0; $i < count($value); $i++) {
            if ($value[$i] == null || $value[$i] == 'null') {
                $isnull = true;
                unset($value[$i]);
                break;
            }
        }
        if ($isnull) {
            if (count($value) == 0) {
                return $this->expIsNull($fname, $value, $not);
            }
            return $not ? $this->qb->expr()->andX($this->qb->expr()->isNotNull($fname), $this->qb->expr()->notIn($fname, $value)) :
            $this->qb->expr()->orX($this->qb->expr()->isNull($fname), $this->qb->expr()->in($fname, $value));
        }
        return $not ? $this->qb->expr()->notIn($fname, $value) : $this->qb->expr()->in($fname, $value);
    }

    protected function genExpr($filter)
    {
        $exp = null;
        $value = $filter['value'];
        $type = Utils::deep_array_value('options-type', $filter, 1);
        $not = Utils::deep_array_value('options-not', $filter, false);
        $names = explode('.', $filter['name']);
        $name = array_pop($names);
        $this->addJoin($names);
        $pj = $this->getJoinedAlias(end($names));
        $fname = $this->getJoinedAlias(end($names)) . '.' . $name;
        //         if (count($names)>1){
        // //            if (!in_array($names[0], $this->joined)){
        // //                $this->qb->leftJoin('e.'.$names[0], 'e_'.$names[0]);
        // //                    array_push($this->joined, $names[0]);
        // //            }
        //             $fname=$this->addJoin($names[0])[0].'.'.$names[1];
        //         }else{
        //             $fname='e.'.$name;
        //         }
        switch ($type) {
            case 'date_period':
                $exp = $this->expDatePeriod($fname, $value, $not);
                break;
            case 'between':
                $exp = $this->expBetween($fname, $value, $not);
                break;
            case 'like':
                $exp = $not ? $this->qb->expr()->notLike($fname, $value) : $this->qb->expr()->like($fname, $value);
                break;
            case 'custom':
                $this->customQuery($value, $options);
                break;
            case 'set':
                $exp = $this->expSet($fname, $value, $not);
                break;
            default:
                $exp = is_array($value) ? $this->expIn($fname, $value, $not) : $this->expDefault($fname, $value, $not, $filter);
        }
        return $exp;
    }

    protected function addFilters()
    {

        /*
        // $groups=[];
        // foreach ($this->filters as $name => $filter) {
        //     $group=Utils::deep_array_value('group', $filter, [ 'name' => '0', 'glue' => '']);
        //     $groups[$group['name']]['filters'][$name]=$filter;
        //     if (Utils::deep_array_value( 'glue', $groups[$group['name']], '') != ''){
        //         $groups[$group['name']]['glue']=$group['glue'];
        //     }
        // }
        // foreach ($groups as $gn => $group) {
        //     foreach ($group->filters as $name => $filter) {

        //     }

        // }
         */

        foreach ($this->filters as $name => $filter) {
            Utils::deep_array_value_set('name', $filter, $name);
            if (Utils::deep_array_value('operator', $filter, 'and') == 'and') {
                $this->qb->andWhere($this->genExpr($filter));
            } else {
                $this->qb->orWhere($this->genExpr($filter));

            }

            /*
        $value= $filter['value'];
        $options=Utils::deep_array_value('options', $filter, []);
        $type = Utils::deep_array_value('type', $options, 1);
        $names=explode(':', $name);
        if (count($names)>1){
        if (!in_array($names[0], $joined)){
        $this->qb->leftJoin('e.'.$names[0], 'e_'.$names[0]);
        array_push($joined, $names[0]);
        }
        $fname='e_'.$names[0].'.'.$names[1];
        }else{
        $fname='e.'.$name;
        }
        switch ($type){
        case 'date_period':
        {
        $period= explode(" - ", $value);
        $date1=new \DateTime($period[0]." 00:00:00");
        $date2=new \DateTime($period[1]." 23:59:59");
        $this->qb->andWhere(
        $this->qb->expr()->between(
        $fname,
        "'".$date1->format('Y-m-d H:i:s')."'",
        "'".$date2->format('Y-m-d H:i:s')."'"
        ));
        }
        break;
        case 'custom':
        {
        $this->customQuery($value, $options);
        }
        break;
        default:
        if (is_array($value)){
        $isnull=false;
        for ($i = 0; $i< count($value); $i++){
        if ($value[$i] == null){
        $isnull=true;
        unset($value[$i]);
        }
        }
        if ($isnull){
        $this->qb->andWhere(
        $this->qb->expr()->orX(
        $this->qb->expr()->isNull( $fname),
        $this->qb->expr()->in( $fname, $value)
        )
        );
        }else{
        $this->qb->andWhere(
        $this->qb->expr()->in($fname, $value)
        );
        }
        }else{
        if ($value== null){
        if(Utils::deep_array_value('not', $options)){
        $this->qb->andWhere( "$fname IS NOT NULL");
        }else{
        $this->qb->andWhere( "$fname IS NULL");
        }
        }else{
        $condition=array_key_exists('condition', $filter) ? strtolower($filter['condition']) : 'eq';
        $this->qb->andWhere(
        $this->qb->expr()->$condition($fname, $value)
        );
        }
        }
        }
         */
        }
        return $this;
    }

    protected function selectFrom($entity = null)
    {
        $this->em = $this->getEntityManager();
        $this->qb = $this->getEntityManager()->createQueryBuilder();
        $this->qb
            ->select($this->query)
            ->from($entity ? $entity : $this->_entityName, 'e')
        ;
        if (is_array($this->toJoin)) {
            foreach ($this->toJoin as $name) {
                $this->addJoin($name);
            }
        }
        $this->qb->groupBy('e.id');
        return $this;
    }

    protected function getResult($asArray = null)
    {
        $query = $this->qb->getQuery();
        // $hh= $query->getResult();
        $asArray = (is_null($asArray) && $this->asArray) || $asArray;
        $result = $asArray ? $query->getArrayResult() : $query->getResult();
        if ($this->byId) {
            $newResult = [];
            foreach ($result as $row) {
                if (is_array($row)) {
                    $newResult[$row[$this->shortNames ? $this->shortNames['id'] : 'id']] = (object) $row;
                } else {
                    $newResult[$row->getId()] = $row;
                }
            }
            return $newResult;
        }
        return $result;
    }

    protected function getOneResult()
    {
        $query = $this->qb
            ->setMaxResults(1)
            ->getQuery();
        return $query->getOneOrNullResult();
    }

    private function setOrder()
    {
        $addOrder = function ($order, $set = true) {
            $fn = $set ? 'orderBy' : 'addOrderBy';
            if (is_array($this->order)) {
                $sort = $order[0];
                $o = $order[1];
            } else {
                $sort = $order;
                $o = null;
            }
            $this->qb->$fn(strrpos('.', $sort) ? $sort : 'e.' . $sort, $o);
        };
        if ($this->order) {
            if (is_array($this->order) && is_array($this->order[0])) {
                for ($i = 0; $i < count($this->order); $i++) {
                    $addOrder($this->order[$i], $i == 0);
                }
            } else {
                $addOrder($this->order);
            }
        }
        return $this;
    }

    protected function action($options)
    {
        $this
            ->getOptions($options)
            ->selectFrom()
            ->addFilters()
            ->setOrder();
        return $this->getResult();
    }

    public function getList($options = [])
    {
        $this->init();
        if (!isset($options['query'])) {
            $options['query'] = $this->generateQuery($this->getQueryFields('list'));
        }
        return $this->action($options);
    }

    public function customQuery($options = [])
    {
        $this->init();
        $this->getOptions($options);
        $this->em = $this->getEntityManager();

        $query = $this->em->createQuery($this->query);
        $asArray = $this->asArray;
        $result = $asArray ? $query->getArrayResult() : $query->getResult();
        if ($this->byId) {
            $newResult = [];
            foreach ($result as $row) {
                if (is_array($row)) {
                    $newResult[$row[$this->shortNames ? $this->shortNames['id'] : 'id']] = (object) $row;
                } else {
                    $newResult[$row->getId()] = $row;
                }
            }
            return $newResult;
        }
        return $result;
    }

    public function getListById($options = [])
    {
        $entities = $this->getList($options);
        $result = [];
        foreach ($entities as $entity) {
            $result[$entity['id']] = (object) $entity;
        }
        return $result;
    }

    public function getEntitiesByIds($ids = [], $options = [])
    {
        Utils::deep_array_value_set('filters-id', $options, [
            'name' => 'id',
            'value' => $ids,
        ]);
        $this->init();
        $options['as_array'] = false;
        return $this->action($options);
    }

    public function getEntities($options = [])
    {
        $this->init();
        $options['as_array'] = false;
        return $this->action($options);
    }

    public function getFilter($options = [])
    {
        $this->init();
        if (!isset($options['query'])) {
            $options['query'] = $this->generateQuery($this->getQueryFields('filter'), $this->getDicNames());
        }
        Utils::deep_array_value_set('order', $options, 'name');
        return $this->action($options);
    }

    public function getDic($options = [])
    {
        $this->init();
        if (!isset($options['query'])) {
            $options['query'] = $this->generateQuery($this->getQueryFields('dic'), $this->getDicNames());
        }
        if ($this->activeFilter) {
            if (!array_key_exists('filters', $options)) {
                $options['filters'] = $this->activeFilter;
            } else {
                $options['filters'] = array_replace_recursive($options['filters'], $this->activeFilter);
            }
        }
        Utils::deep_array_value_set('order', $options, 'sequence');
        return $this->action($options);
    }

    public function getCount($options = [])
    {
        $this->init();
        $count = 0;
        $options['query'] = 'COUNT(e.id)';
        $this
            ->getOptions($options)
            ->selectFrom()
            ->addFilters();
        try {
            $count = $this->qb->getQuery()->getSingleScalarResult();
        } catch (\Doctrine\ORM\NoResultException $e) {
            /*Your stuffs..*/
        }
        return $count;
    }

    public function getUniques($options=[]){
        return [];
    }    
}
