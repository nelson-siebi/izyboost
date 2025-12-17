<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'uuid',
        'username',
        'email',
        'password',
        'google_id',
        'google_token',
        'avatar',
        'role',
        'balance',
        'api_balance',
        'earnings',
        'withdrawable',
        'currency',
        'language',
        'timezone',
        'sponsor_id',
        'sponsor_code',
        'commission_rate',
        'api_limit_per_minute',
        'max_sites_allowed',
        'is_active',
        'is_banned',
        'two_factor_enabled',
        'two_factor_secret',
        'last_login_at',
        'last_login_ip',
        'settings',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'google_token',
        'two_factor_secret',
        'id', // Hide internal ID, expose UUID instead
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'balance' => 'decimal:6',
            'api_balance' => 'decimal:6',
            'earnings' => 'decimal:6',
            'withdrawable' => 'decimal:6',
            'commission_rate' => 'decimal:2',
            'is_active' => 'boolean',
            'is_banned' => 'boolean',
            'two_factor_enabled' => 'boolean',
            'last_login_at' => 'datetime',
            'settings' => 'array',
        ];
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($user) {
            if (empty($user->uuid)) {
                $user->uuid = (string) \Illuminate\Support\Str::uuid();
            }
            if (empty($user->sponsor_code)) {
                $user->sponsor_code = self::generateSponsorCode();
            }
        });
    }

    public static function generateSponsorCode()
    {
        do {
            $code = strtoupper(\Illuminate\Support\Str::random(8));
        } while (self::where('sponsor_code', $code)->exists());

        return $code;
    }

    // Relationships
    public function sponsor()
    {
        return $this->belongsTo(User::class, 'sponsor_id');
    }

    public function referrals()
    {
        return $this->hasMany(User::class, 'sponsor_id');
    }

    public function apiKeys()
    {
        return $this->hasMany(ApiKey::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function whiteLabelSites()
    {
        return $this->hasMany(WhiteLabelSite::class, 'owner_id');
    }

    public function tickets()
    {
        return $this->hasMany(Ticket::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }
}
