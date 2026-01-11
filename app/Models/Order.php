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
        'api_error'
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
