<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReferralRelationship extends Model
{
    use HasFactory;

    protected $fillable = [
        'sponsor_id',
        'referred_id',
        'level',
        'commission_percentage',
        'status',
        'total_earned',
    ];

    protected $casts = [
        'commission_percentage' => 'decimal:2',
        'total_earned' => 'decimal:6',
    ];

    public function sponsor()
    {
        return $this->belongsTo(User::class, 'sponsor_id');
    }

    public function referred()
    {
        return $this->belongsTo(User::class, 'referred_id');
    }

    public function commissions()
    {
        return $this->hasMany(ReferralCommission::class);
    }
}
