<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentMethod extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'logo',
        'type',
        'fee_structure_id',
        'min_amount',
        'max_amount',
        'currencies',
        'countries',
        'is_active',
        'require_kyc',
        'config',
        'sort_order',
    ];

    protected $casts = [
        'min_amount' => 'decimal:4',
        'max_amount' => 'decimal:4',
        'currencies' => 'array',
        'countries' => 'array',
        'config' => 'array',
        'is_active' => 'boolean',
        'require_kyc' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function fees()
    {
        return $this->belongsTo(FeeStructure::class, 'fee_structure_id');
    }
}
