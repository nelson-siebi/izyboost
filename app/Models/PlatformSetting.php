<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PlatformSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'value',
        'type',
        'category',
        'group',
        'is_public',
        'editable',
    ];

    protected $casts = [
        'is_public' => 'boolean',
        'editable' => 'boolean',
    ];

    /**
     * Get the value cast to its type.
     */
    public function getTypedValueAttribute()
    {
        $value = $this->value;

        switch ($this->type) {
            case 'boolean':
            case 'bool':
            case 'toggle':
                return (bool) $value;
            case 'integer':
            case 'int':
            case 'number':
                return (int) $value;
            case 'decimal':
            case 'float':
                return (float) $value;
            case 'json':
            case 'array':
                return is_string($value) ? json_decode($value, true) : $value;
            default:
                return $value;
        }
    }
}
