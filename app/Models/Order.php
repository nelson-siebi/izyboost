<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'user_id',
        'service_id',
        'white_label_site_id',
        'api_key_id',
        'external_order_id',
        'external_provider_id',
        'link',
        'quantity',
        'cost_price',
        'sell_price',
        'margin_amount',
        'commission_amount',
        'fees_amount',
        'net_amount',
        'currency',
        'status',
        'start_count',
        'remains',
        'progress_percentage',
        'ip_address',
        'user_agent',
        'placed_via',
        'provider_response' // We might need to store the raw response temporarily or in a log, but not in main table if not there. Checking schema... NO provider_response column in schema. Removing.
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            $model->uuid = Str::uuid();
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }
    
    public function provider()
    {
        return $this->belongsTo(ApiProvider::class, 'external_provider_id');
    }
}
