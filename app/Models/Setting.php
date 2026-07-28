<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $primaryKey = 'key';
    public $incrementing  = false;
    protected $keyType    = 'string';
    protected $fillable   = ['key', 'value'];

    public static function get(string $key, $default = null)
    {
        $setting = self::find($key);
        if (!$setting) return $default;

        $value = $setting->value;
        if ($value === 'true')  return true;
        if ($value === 'false') return false;
        if (is_numeric($value)) {
            return strpos($value, '.') !== false ? (float)$value : (int)$value;
        }
        return $value;
    }

    public static function set(string $key, $value)
    {
        if (is_bool($value)) $value = $value ? 'true' : 'false';
        return self::updateOrCreate(['key' => $key], ['value' => (string)$value]);
    }
}
