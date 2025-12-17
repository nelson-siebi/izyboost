<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class WhiteLabelSite extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'owner_id',
        'template_id',
        'plan_id',
        'site_name',
        'site_url',
        'subdomain',
        'custom_domain',
        'status',
        'deployment_type',
        'hosting_details',
        'branding',
        'configuration',
        'allowed_services',
        'price_multiplier',
        'margin_percent',
        'statistics',
        'last_payment_at',
        'next_payment_at',
        'expires_at',
        'suspended_at',
        'cancellation_requested_at',
        'notes',
    ];

    protected $casts = [
        'hosting_details' => 'array',
        'branding' => 'array',
        'configuration' => 'array',
        'allowed_services' => 'array',
        'statistics' => 'array',
        'price_multiplier' => 'decimal:2',
        'margin_percent' => 'decimal:2',
        'last_payment_at' => 'datetime',
        'next_payment_at' => 'datetime',
        'expires_at' => 'datetime',
        'suspended_at' => 'datetime',
        'cancellation_requested_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($site) {
            if (empty($site->uuid)) {
                $site->uuid = (string) Str::uuid();
            }
            
            // Initialize default statistics
            if (empty($site->statistics)) {
                $site->statistics = [
                    'total_orders' => 0,
                    'total_revenue' => 0,
                    'active_users' => 0,
                ];
            }
        });
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function template()
    {
        return $this->belongsTo(WhiteLabelTemplate::class, 'template_id');
    }

    public function plan()
    {
        return $this->belongsTo(WhiteLabelPlan::class, 'plan_id');
    }

    public function subscription()
    {
        return $this->hasOne(Subscription::class, 'white_label_site_id');
    }

    public function orders()
    {
        return $this->hasMany(Order::class, 'white_label_site_id');
    }
}
