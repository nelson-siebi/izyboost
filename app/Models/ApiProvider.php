<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ApiProvider extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'base_url',
        'api_key',
        'type', // e.g., 'standard', 'custom'
        'balance',
        'currency',
        'status', // active, inactive
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'balance' => 'decimal:4',
    ];

    public function services()
    {
        return $this->hasMany(Service::class);
    }
}
