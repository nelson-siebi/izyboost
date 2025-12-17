<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    use HasFactory;

    protected $fillable = [
        'api_provider_id',
        'category_id',
        'external_id',
        'name',
        'type', // Default, Custom Comments, etc.
        'min_quantity',
        'max_quantity',
        'cost_per_unit', // Price from API
        'base_price_per_unit', // Your selling price
        'provider',
        'drip_feed',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'drip_feed' => 'boolean',
        'refill' => 'boolean',
        'cancel' => 'boolean',
        'cost_price' => 'decimal:4',
        'base_price' => 'decimal:4',
    ];

    public function provider()
    {
        return $this->belongsTo(ApiProvider::class, 'api_provider_id');
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
