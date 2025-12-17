<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class SiteOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'user_id',
        'template_id',
        'plan_id',
        'transaction_id',
        'type',
        'amount',
        'setup_fee',
        'total_amount',
        'currency',
        'status',
        'deployment_type',
        'hosting_preferences',
        'custom_requirements',
        'download_link',
        'download_expires_at',
        'deployed_at',
        'completed_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'setup_fee' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'hosting_preferences' => 'array',
        'download_expires_at' => 'datetime',
        'deployed_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($order) {
            if (empty($order->uuid)) {
                $order->uuid = (string) Str::uuid();
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function template()
    {
        return $this->belongsTo(WhiteLabelTemplate::class, 'template_id');
    }

    public function plan()
    {
        return $this->belongsTo(WhiteLabelPlan::class, 'plan_id');
    }

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }
}
