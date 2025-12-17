<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReferralCommission extends Model
{
    use HasFactory;

    protected $fillable = [
        'referral_relationship_id',
        'user_id',
        'from_user_id',
        'type',
        'order_id',
        'transaction_id',
        'subscription_id',
        'amount',
        'percentage',
        'level',
        'status',
        'paid_at',
    ];

    protected $casts = [
        'amount' => 'decimal:6',
        'percentage' => 'decimal:2',
        'paid_at' => 'datetime',
    ];

    public function relationship()
    {
        return $this->belongsTo(ReferralRelationship::class, 'referral_relationship_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function fromUser()
    {
        return $this->belongsTo(User::class, 'from_user_id');
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }

    public function subscription()
    {
        return $this->belongsTo(Subscription::class);
    }
}
