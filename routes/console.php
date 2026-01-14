<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule the site expiry check
Schedule::command('sites:check-expiry')->dailyAt('00:00');

// Schedule transaction verification (every minute)
Schedule::command('transactions:check-status')->everyMinute();

// Schedule SMM Service Sync (daily) to keep IDs and prices updated
Schedule::command('smm:sync-services')->dailyAt('01:00');

// Schedule SMM Order Status Updates (every 10 minutes)
Schedule::command('smm:update-status')->everyMinute();
