# ADSMedia Laravel Integration

Send emails via ADSMedia API from Laravel applications.

## Installation

```bash
composer require guzzlehttp/guzzle
```

## Setup

### 1. Add Config

In `config/services.php`:

```php
'adsmedia' => [
    'api_key' => env('ADSMEDIA_API_KEY'),
    'from_name' => env('ADSMEDIA_FROM_NAME', 'Laravel'),
],
```

### 2. Add to .env

```env
ADSMEDIA_API_KEY=your-api-key
ADSMEDIA_FROM_NAME=My App
```

### 3. Register Provider

In `config/app.php`:

```php
'providers' => [
    // ...
    App\Providers\ADSMediaServiceProvider::class,
],
```

### 4. Add Routes (optional)

In `routes/api.php`:

```php
Route::prefix('email')->group(function () {
    Route::post('/send', [ADSMediaController::class, 'send']);
    Route::post('/batch', [ADSMediaController::class, 'sendBatch']);
    Route::get('/check', [ADSMediaController::class, 'checkSuppression']);
    Route::get('/ping', [ADSMediaController::class, 'ping']);
});
```

## Usage

### Inject Service

```php
use App\Services\ADSMediaService;

class UserController extends Controller
{
    public function register(Request $request, ADSMediaService $adsmedia)
    {
        // Register user...
        
        $adsmedia->send(
            $user->email,
            'Welcome!',
            '<h1>Hello ' . $user->name . '!</h1>',
            $user->name
        );
    }
}
```

### Using Facade (if registered)

```php
app('adsmedia')->send($email, $subject, $html);
```

### Batch Sending

```php
$adsmedia->sendBatch(
    [
        ['email' => 'user1@example.com', 'name' => 'User 1'],
        ['email' => 'user2@example.com', 'name' => 'User 2'],
    ],
    'Hello %%First Name%%!',
    '<h1>Hi %%First Name%%!</h1>'
);
```

### Check Suppression

```php
$result = $adsmedia->checkSuppression('user@example.com');
if ($result['suppressed']) {
    // Email is suppressed
}
```

## API Endpoints

- `POST /api/email/send` - Send single email
- `POST /api/email/batch` - Send batch emails
- `GET /api/email/check?email=...` - Check suppression
- `GET /api/email/ping` - Test connection

## Links

- [API Documentation](https://www.adsmedia.ai/api-docs)
- [Laravel](https://laravel.com)
- [GitHub](https://github.com/ADSMedia-ai/ADSMedia)

## License

MIT © [ADSMedia](https://www.adsmedia.ai)

