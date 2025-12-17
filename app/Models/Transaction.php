<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'user_id',
        'payment_method_id',
        'type',
        'sub_type',
        'amount',
        'fees',
        'net_amount',
        'currency',
        'status',
        'gateway',
        'gateway_transaction_id',
        'gateway_response',
        'reference',
        'description',
        'admin_notes',
        'metadata',
        'ip_address',
        'verified_by',
        'verified_at',
        'completed_at',
    ];

    protected $casts = [
        'amount' => 'decimal:6',
        'fees' => 'decimal:6',
        'net_amount' => 'decimal:6',
        'gateway_response' => 'array',
        'metadata' => 'array',
        'verified_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($transaction) {
            if (empty($transaction->uuid)) {
                $transaction->uuid = (string) Str::uuid();
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function paymentMethod()
    {
        return $this->belongsTo(PaymentMethod::class);
    }

    public function verifiedBy()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}
