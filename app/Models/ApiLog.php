<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ApiLog extends Model
{
    use HasFactory;

    public $timestamps = false; // Only created_at in schema

    protected $fillable = [
        'api_key_id',
        'user_id',
        'method',
        'endpoint',
        'request_headers',
        'request_body',
        'response_code',
        'response_body',
        'ip_address',
        'user_agent',
        'duration_ms',
        'created_at',
    ];

    protected $casts = [
        'request_headers' => 'array',
        'request_body' => 'array',
        'response_body' => 'array',
        'created_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($model) {
            if (empty($model->created_at)) {
                $model->created_at = now();
            }
        });
    }

    public function apiKey()
    {
        return $this->belongsTo(ApiKey::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
