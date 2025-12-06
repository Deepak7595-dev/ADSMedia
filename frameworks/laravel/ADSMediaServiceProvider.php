<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\ADSMediaService;

/**
 * Laravel Service Provider for ADSMedia
 */
class ADSMediaServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(ADSMediaService::class, function ($app) {
            return new ADSMediaService(
                config('services.adsmedia.api_key'),
                config('services.adsmedia.from_name', 'Laravel')
            );
        });

        $this->app->alias(ADSMediaService::class, 'adsmedia');
    }

    public function boot(): void
    {
        // Publish config if needed
    }
}

