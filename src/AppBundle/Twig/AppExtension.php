<?php

namespace AppBundle\Twig;

use AppBundle\Utils\Utils;
use Symfony\Component\Translation\TranslatorInterface;
use \Twig_Extension;

class AppExtension extends \Twig_Extension
{

    private $translator;

    /**
     * {@inheritdoc}
     */
    public function __construct(TranslatorInterface $translator = null)
    {
        $this->translator = $translator;
    }

    public function getTests()
    {
        return array(
            new \Twig_SimpleTest('string', array($this, 'isString')),
            new \Twig_SimpleTest('twig', array($this, 'isTwig')),
        );
    }

    public function getFilters()
    {
        return [
            new \Twig_SimpleFilter('json_decode', array($this, 'jsonDecode')),
            new \Twig_SimpleFilter('json_value', array($this, 'jsonValue')),
            new \Twig_SimpleFilter('bundle_prefix', array($this, 'bundlePrefix')),
            new \Twig_SimpleFilter('field_name', array($this, 'fieldName')),
            new \Twig_SimpleFilter('obj_id', array($this, 'objId')),
            new \Twig_SimpleFilter('dict', array($this, 'dict')),
            new \Twig_SimpleFilter('dic_val', array($this, 'getDicVal')),
            new \Twig_SimpleFilter('add_class', array($this, 'addClass')),
            new \Twig_SimpleFilter('set_attr', array($this, 'setAttribute')),
            new \Twig_SimpleFilter('set_label', array($this, 'setLabel')),
            new \Twig_SimpleFilter('gen_label', array($this, 'genLabel')),
            new \Twig_SimpleFilter('set_title', array($this, 'setTitle')),
            new \Twig_SimpleFilter('gen_title', array($this, 'genTitle')),
            new \Twig_SimpleFilter('gen_btn', array($this, 'genBtn')),
            new \Twig_SimpleFilter('diff', array($this, 'checkDifferent')),
            new \Twig_SimpleFilter('diff_lackers', array($this, 'checkLackersDifferent')),
            new \Twig_SimpleFilter('set_array_value', array($this, 'setArrayValue')),

            new \Twig_SimpleFilter('set_form_var', array($this, 'setFormVar')),
            new \Twig_SimpleFilter('get_array_value', array($this, 'getArrayValue')),
            new \Twig_SimpleFilter('array_replace', array($this, 'arrayReplace')),
//            new \Twig_SimpleFilter('add_array_value', array($this, 'addArrayValue')),
            new \Twig_SimpleFilter('array_merge', array($this, 'arrayMerge')),
            new \Twig_SimpleFilter('to_array', array($this, 'toArray')),
            new \Twig_SimpleFilter('l_trim', array($this, 'lTrim')),
            new \Twig_SimpleFilter('r_trim', array($this, 'rTrim')),
//            new \Twig_SimpleFilter('btn', array($this, 'btn')),
        ];
    }

    public function getFunctions()
    {
        return [
            new \Twig_SimpleFunction('form_field', null, array('node_class' => 'Symfony\Bridge\Twig\Node\SearchAndRenderBlockNode', 'is_safe' => array('html'))),
            new \Twig_SimpleFunction('form_div', null, array('node_class' => 'Symfony\Bridge\Twig\Node\SearchAndRenderBlockNode', 'is_safe' => array('html'))),
            new \Twig_SimpleFunction('form_btn', null, array('node_class' => 'Symfony\Bridge\Twig\Node\SearchAndRenderBlockNode', 'is_safe' => array('html'))),
            new \Twig_SimpleFunction('form_fbtn', null, array('node_class' => 'Symfony\Bridge\Twig\Node\SearchAndRenderBlockNode', 'is_safe' => array('html'))),
            new \Twig_SimpleFunction('form_frow', null, array('node_class' => 'Symfony\Bridge\Twig\Node\SearchAndRenderBlockNode', 'is_safe' => array('html'))),
            new \Twig_SimpleFunction('form_combo', null, array('node_class' => 'Symfony\Bridge\Twig\Node\SearchAndRenderBlockNode', 'is_safe' => array('html'))),
            new \Twig_SimpleFunction('form_span', null, array('node_class' => 'Symfony\Bridge\Twig\Node\SearchAndRenderBlockNode', 'is_safe' => array('html'))),
        ];
    }

    public function isString($str)
    {
        return is_string($str);
    }

    public function isTwig($str)
    {
        $a = substr($str, -5);
        $b = is_string($str) && substr($str, -5) == '.twig';
        return is_string($str) && substr($str, -5) == '.twig';
    }

    public function jsonDecode($str, $key = null)
    {
        $data=$str;
        if (Utils::is_JSON_string($str)){
            $data = json_decode($str, true);
        }
        if ($key && is_array($data)) {
            return array_key_exists($key, $data) ? $data[$key] : null;
        } 
        return $data;
    }

    private function arrayTraverse(&$array, $keys_str = null, &$kk = null)
    {
        if (isset($keys_str)) {
            $keys = explode(".", $keys_str);
            for ($i = 0, $ien = count($keys); $i < $ien; $i++) {
                if (!array_key_exists($keys[$i], $array)) {
                    $array[$keys[$i]] = $i + 1 == $ien ? null : [];
                }
                $array = &$array[$keys[$i]];
            }
        }
        $kk += 2;
    }

    public function addClass($attr, $class, $keys_str = null)
    {
        return Utils::addClass($attr, $class, $keys_str);
    }

    public function genLabel($label, $entityName = null, $translate = true)
    {
        $label = Utils::gen_trans_text($label, 'label', $entityName);
        return $translate ? $this->translator->trans($label) : $label;
    }

    public function setLabel($element, $label, $entityName = null, $translate = true, $overwrite = false)
    {
        if ($overwrite || !array_key_exists('label', $element)) {
            $element['label'] = $this->genLabel($label, $entityName, $translate);
        }
        return $element;
    }


    public function genBtn($btn, $name, $icon='', $class=[], $entityName = null, $def=[])
    {
        if(!is_array($btn)){
            $btn=$def;
        }else{
            $btn=array_replace_recursive($def, $btn);
        }
        $en= Utils::deep_array_value('en', $btn, $entityName);
        Utils::addClass($btn, $class, 'attr');
        if(!Utils::deep_array_key_exists('attr-title', $btn)){
            $btn['attr']['title']=$this->genTitle('btn.'.$name, $en);
        }
        if(!array_key_exists('label', $btn)){
            $btn['label']= $this->genLabel('btn.'.$name, $en);
        }
        Utils::deep_array_value_set('icon', $btn, $icon);
        return $btn;
    }
    public function genTitle($title, $entityName = null, $translate = false)
    {
        $title = Utils::gen_trans_text($title, 'title', $entityName);
        return $translate ? $this->translator->trans($title) : $title;
    }

    public function setTitle($attr, $title, $entityName = null, $overwrite = false)
    {
        return $this->setAttribute($attr, 'title', $this->genTitle($title, $entityName), $overwrite);
    }

    public function setAttribute($attr, $name, $value, $overwrite = false)
    {
        $attributes = &$attr;
        if (array_key_exists('attr', $attr)) {
            $attributes = &$attr['attr'];
        }
        if ($overwrite || !array_key_exists($name, $attributes)) {
            $attributes[$name] = $value;
        }
        return $attr;
    }

    public function setArrayValue($array, $keys, $value, $overwrite = false, $separator = '.')
    {

        Utils::deep_array_value_set($keys, $array, $value, $overwrite, $separator);
//        $current=&$array;
        //        $keys = explode(".", $keys_str);
        //        foreach( $keys as $key){
        //                if (!array_key_exists($key, $current)){
        //                    $current[$key]= [];
        //                }
        //                $current = &$current[$key];
        //            }
        //        $current = $value;
        return $array;
    }

    public function setFormVar($form, $keys, $value, $overwrite = false, $separator = '.')
    {
        Utils::deep_array_value_set($keys, $form->vars, $value, $overwrite, $separator);
        return $form;
    }

    public function getArrayValue($array, $keys, $options = [])
    {
        if (!is_array($keys)) {
            $keys = explode('.', $keys);
        }
        $disp = Utils::deep_array_value('disp', $options);
        if ($disp) {
            array_push($keys, $disp);
        }
        $value = Utils::deep_array_value($keys, $array);
        return $value ? $value : Utils::deep_array_value('empty', $options, '');
    }

    public function arrayReplace($array, $array1, $recursive = true)
    {
        $array = $recursive ? array_replace_recursive($array, $array1) : array_replace($array, $array1);
        return $array;
    }

//    public function addArrayValue( $array, $keys, $values){
    //        Utils::deep_array_value_set($keys, $array, $value);
    //
    //        $current=&$array;
    //        if(is_string($keys) && $keys!='' ){
    //            $keys = explode(".", $keys);
    //        }
    //        if(is_array($keys) && count($keys)>0){
    //            foreach( $keys as $key){
    //                if (!array_key_exists($key, $current)){
    //                    $current[$key]= [];
    //                }
    //                $current = &$current[$key];
    //            }
    //        }
    //        if (is_array($current) && is_array($values)){
    //            $current=array_replace_recursive($current, $values);
    //        }else{
    //            $current = $values;
    //        }
    //        return $array;
    //    }

    public function arrayMerge($arrays, $keys = null)
    {
        $array = [];
        if (is_array($keys)) {
            foreach ($keys as $k) {
                if (is_array($arrays[$k])) {
                    $array = array_merge($array, $arrays[$k]);
                }
            }
        } else {
            foreach ($arrays as $a) {
                if (is_array($a)) {
                    $array = array_merge($array, $a);
                }
            }
        }
        return $array;
    }

    public function fieldName($str, $fields)
    {
        if (is_array($fields) && count($fields) > 0) {
            if ($fullName = array_search($str, $fields)) {
                return $fullName;
            }
        }
        return $str;
    }
    // public function fieldName($str, $fields) {
    //     if (is_array($fields) && count($fields) > 0){
    //         if ( array_key_exists($str, $fields) )
    //            return $fields[$str];
    //         if ($fullName = array_search($str, $fields))
    //             return $fullName;
    //     }
    //     return $str;
    // }

    public function getDicVal($entity, $dictionary, $fieldName, $options = [])
    {
        $val = null;
        if (is_array($entity) && is_array($dictionary) && is_string($fieldName)) {
            if (!(Utils::is_sequential_array($dictionary))) {
                if (array_key_exists('dicName', $options) && array_key_exists($options['dicName'], $dictionary)) {
                    $dictionary = $dictionary[$options['dicName']];
                } elseif (array_key_exists($fieldName, $dictionary)) {
                    $dictionary = $dictionary[$fieldName];
                } elseif (array_key_exists($fieldName . 's', $dictionary)) {
                    $dictionary = $dictionary[$fieldName . 's'];
                }
            }
            $val = $this->dict(
                Utils::deep_array_value($fieldName, $entity),
//                Utils::deep_array_value(Utils::deep_array_value('dicName', $options, $fieldName.'s'), $dictionary),
                $dictionary,
                Utils::deep_array_value('dicField', $options, 'n')
            );
        }
        return $val ? $val : Utils::deep_array_value('defVal', $options, '-');
    }

    public function dict($val, $dictionary, $name = 'n')
    {
        if (is_array($val)) {
            if (array_key_exists($name, $val)) {
                return $val[$name];
            }
            $val = $val['id'];
        } elseif (is_bool($val)) {
            $val = $val ? 1 : 0;
        }
        if (is_array($dictionary)) {
            foreach ($dictionary as $record) {
                if ($val == Utils::deep_array_value('v', $record)) {
                    return $record[$name];
                }
            }
        }
        return null;
    }

    public function checkDifferent($val, $checked)
    {
        $diff = false;
        if (is_array($val)) {
            if (array_key_exists('id', $val)) {
                $diff = $val['id'] != $checked['id'];
            }
        } else {
            $diff = $val != $checked;
        }
        return $diff;
    }

    public function checkLackersDifferent($posLackers, $orderLackers)
    {
        if (!isset($posLackers) || !isset($orderLackers)) {
            return false;
        }
        $plackers = is_array($posLackers) ? $posLackers : json_decode($posLackers, true);
        $olackers = is_array($orderLackers) ? $orderLackers : json_decode($orderLackers, true);
        if ($same = count($plackers) == count($olackers)) {
            for ($i = 0; $i < count($plackers) && $same; $i++) {
                $same = $plackers[$i]['sq'] == $olackers[$i]['sq']
                    && $plackers[$i]['opt'] == $olackers[$i]['opt']
                    && $plackers[$i]['com'] == $olackers[$i]['com']
                    && $plackers[$i]['color']['id'] == $olackers[$i]['color']['id'];
            }
        }
        return !$same;
    }

//    public function btn($val, $title='', $label='B') {
    //        $html='<span class="btn btn-signal btn-'.(isset($val)? 'primary" data-tooltip="'.$val : 'default') .'" title="'.$title.'">'.$label.'</span>';
    //        return $html;
    //    }
    public function jsonValue($str, $key)
    {
        $data = json_decode($str);
        return isset($data->$key) ? $data->$key : null;
    }

    public function bundlePrefix($str)
    {
        $name = explode("_", $str);
        return count($name) == 1 ? $str : $name[0] . "_" . $name[1];
    }

    public function objId($str, $prefix = "disp")
    {
        $name = explode("_", $str);
        array_shift($name);
        $name[0] = $prefix == "" || $prefix == '1' ? 'disp' : $prefix;
        return implode("_", $name);
    }

    public function toArray($object, $options = [])
    {
        $a = [];
        if (method_exists($object, 'getArray')) {
            $a = $object->getArray($options);
        } else {
            $a = get_object_vars($object);
        }
        return $a;
    }

    public function lTrim($str, $character_mask)
    {
        return ltrim($str, $character_mask);
    }

    public function rTrim($str, $character_mask)
    {
        return rtrim($str, $character_mask);
    }

    public function getName()
    {
        return 'app_extension';
    }
}
