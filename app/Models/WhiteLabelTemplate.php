<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WhiteLabelTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'preview_image',
        'template_type',
        'base_price',
        'monthly_price',
        'setup_fee',
        'features',
        'files_path',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'base_price' => 'decimal:2',
        'monthly_price' => 'decimal:2',
        'setup_fee' => 'decimal:2',
        'features' => 'array',
        'is_active' => 'boolean',
    ];

    public function sites()
    {
        return $this->hasMany(WhiteLabelSite::class, 'template_id');
    }
}
