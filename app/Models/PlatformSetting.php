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
}
