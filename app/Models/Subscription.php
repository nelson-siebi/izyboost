<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Subscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'user_id',
        'white_label_site_id',
        'plan_id',
        'template_id',
        'status',
        'amount',
        'currency',
        'interval',
        'starts_at',
        'ends_at',
        'trial_ends_at',
        'cancelled_at',
        'payment_method',
        'gateway_subscription_id',
        'metadata',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'metadata' => 'array',
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'trial_ends_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($subscription) {
            if (empty($subscription->uuid)) {
                $subscription->uuid = (string) Str::uuid();
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function site()
    {
        return $this->belongsTo(WhiteLabelSite::class, 'white_label_site_id');
    }

    public function plan()
    {
        return $this->belongsTo(WhiteLabelPlan::class, 'plan_id');
    }

    public function template()
    {
        return $this->belongsTo(WhiteLabelTemplate::class, 'template_id');
    }
}
