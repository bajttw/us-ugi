<?php

namespace AppBundle\Utils;

class Utils
{

    public static function toFloat($value)
    {
        if (is_string($value)) {
            $value = floatval(str_replace(',', '.', $value));
        } else if (is_null($value)) {
            return 0;
        }
        return $value;
    }

    public static function dateTimeStr($date, $showTime = false)
    {
        if ($date) {
            $format = "Y-m-d";
            if ($showTime) {
                $format .= " H:i";
            }
            return $date->format($format);
        } else {
            return $date;
        }
    }

    public static function deep_array_key_exists($keys, $array, $separator = '-')
    {
        $result = false;
        if (!is_array($keys)) {
            $keys = explode($separator, $keys);
        }
        if (is_array($array) && count($keys) > 0) {
            $key = array_shift($keys);
            if (($result = array_key_exists($key, $array)) && count($keys) > 0) {
                $result = static::deep_array_key_exists($keys, $array[$key]);
            }
        }
        return $result;
    }

    public static function deep_array_value($keys, $array, $default = null, $separator = '-')
    {
        if (!is_array($keys)) {
            $keys = explode($separator, $keys);
        }
        $keysCount = count($keys);
        if (is_array($array) && $keysCount > 0) {
            $current = &$array;
            for ($i = 0; $i < $keysCount; $i++) {
                if (!array_key_exists($keys[$i], $current)) {
                    return $default;
                } elseif ($i + 1 == $keysCount) {
                    return $current[$keys[$i]];
                } else {
                    $current = &$current[$keys[$i]];
                }
            }
        }
        return $default;
    }

    public static function deep_array_value_check($keys, $array, $value = null, $separator = '-')
    {
        return $value ? static::deep_array_value($keys, $array) == $value : static::deep_array_key_exists($keys, $array, $separator);
    }

    public static function deep_array_value_set($keys, &$array, $value, $overwrite = false, $separator = '-')
    {
        if (!is_array($keys)) {
            $keys = explode($separator, $keys);
        }
        $keysCount = count($keys);
        if ($keysCount > 0) {
            $current = &$array;
            for ($i = 0; $i < $keysCount - 1; $i++) {
                if (!array_key_exists($keys[$i], $current)) {
                    $current[$keys[$i]] = [];
                }
                $current = &$current[$keys[$i]];
            }
            if (!array_key_exists($keys[$keysCount - 1], $current)) {
                $current[$keys[$keysCount - 1]] = $value;
            } elseif ($overwrite) {
                $current[$keys[$keysCount - 1]] = is_array($value) && is_array($current[$keys[$keysCount - 1]]) ? array_replace_recursive($current[$keys[$keysCount - 1]], $value) : $value;
            }
        } else if ($overwrite && is_array($value)) {
            $array = array_replace_recursive($array, $value);
        }
    }

    public static function is_JSON_string($val)
    {
        return is_string($val) && preg_match('/^[\[\{]+/', $val);
    }

    public static function extract_array_object_value($array, $key)
    {
        $values = [];
        foreach ($array as $a) {
            array_push($values, self::deep_array_value($key, $a));
        }
        return $values;
    }

    public static function is_sequential_array($array)
    {
        return (is_array($array) && count(array_filter(array_keys($array), 'is_string')) == 0);
    }

    public static function addClass(&$attr, $class, $keys_str = null)
    {
        $current = &$attr;
        if ($keys_str) {
            $keys = explode(".", $keys_str);
            foreach ($keys as $key) {
                if (!array_key_exists($key, $current)) {
                    $current[$key] = [];
                }
                $current = &$current[$key];
            }
        }
        $old = array_key_exists('class', $current) ? explode(' ', $current['class']) : [];
        $new = array_filter(is_string($class) ? explode(' ', $class) : $class, function ($value) {return $value !== '';});

        $current['class'] = implode(" ", array_unique(array_merge($old, $new)));
        return $attr;
    }

    public static function from_dictionary($dic, $value, $options = [])
    {
        $result = null;
        $name = self::deep_array_value('name', $options);
        if (\is_array($dic)) {
            foreach ($dic as $row) {
                if ($row['v'] == $value) {
                    $result = $row;
                    break;
                }
            }
        }
        if ($result && $name) {
            $result = self::deep_array_value($name, $result);
        }
        return is_null($result) ? self::deep_array_value('empty', $options) : $result;
    }

    public static function compare_values($condition, $val, $valCheck)
    {
        $result = false;
        switch ($condition) {
            case 'eq': // $val == $valCheck
                $result = $val == $valCheck;
                break;
            case 'neq': // $val <> $valCheck
                $result = $val != $valCheck;
                break;
            case 'lt': // $val < $valCheck
                $result = $val < $valCheck;
                break;
            case 'lte': // $val <= $valCheck
                $result = $val <= $valCheck;
                break;
            case 'gt': // $val > $valCheck
                $result = $val > $valCheck;
                break;
            case 'gte': // $val >= $valCheck
                $result = $val >= $valCheck;
                break;
            case 'isNull': // $val is null
                $result = $val == null || $val == '' || $val == 0;
                break;
            case 'isNotNull': // $val is not null
                $result = $val != null && $val != '' && $val != 0;
                break;
            case 'in':
                $result = strpos($val, $valCheck) >= 0;
                break;
        }
        return $result;
    }

    public static function check_limits($limits, $value, $constrain = null)
    {
        $result = null;
        $convert = function ($val, $constrain) {
            if (is_callable($constrain)) {
                return is_array($val) ? array_map($constrain, $val) : $constrain($val);
            } else {
                return $val;
            }
        };
        if (is_array($limits)) {
            $ok = false;
            foreach ($limits as $limit) {
                if (Utils::deep_array_key_exists('condition-c', $limit)) {
                    $ok = self::compare_values($limit['condition']['c'], $value, $convert($limit['condition']['v'], $constrain));
                } else {
                    $ok1 = !array_key_exists('logical', $limit) || $limit['logical'] == 'and';
                    $ok = $ok1;
                    foreach ($limit['condition'] as $condition) {
                        $ok = self::compare_values($condition['c'], $value, $convert($condition['v'], $constrain));
                        if ($ok != $ok1) {
                            break;
                        }
                    }
                }
                if ($ok) {
                    $result = $limit;
                    break;
                }
            }
        }
        return $result;
    }

    public static function gen_trans_text($str, $type = null, $entityName = null)
    {
        if (!is_string($str) || $str == '') {
            return 'error';
        }
        $text = '';
        if (is_string($entityName) && $entityName != '') {
            $text = $entityName . '.';
            if (strpos($str, $text) === 0) {
                return $str;
            }
        }
        if (is_string($type) && $type != '') {
            $text .= $type . '.';
        }
        return $text . $str;
    }

}
