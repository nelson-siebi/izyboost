<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Ticket extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'user_id',
        'white_label_site_id',
        'assigned_to',
        'department',
        'priority',
        'status',
        'subject',
        'last_reply_at',
        'closed_at',
        'closed_by',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
        'last_reply_at' => 'datetime',
        'closed_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($ticket) {
            if (empty($ticket->uuid)) {
                $ticket->uuid = (string) Str::uuid();
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function assignedTo()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function closedBy()
    {
        return $this->belongsTo(User::class, 'closed_by');
    }

    public function site()
    {
        return $this->belongsTo(WhiteLabelSite::class, 'white_label_site_id');
    }

    public function messages()
    {
        return $this->hasMany(TicketMessage::class);
    }
}
