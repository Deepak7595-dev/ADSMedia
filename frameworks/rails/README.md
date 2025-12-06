# ADSMedia Ruby on Rails Integration

Send emails via ADSMedia API from Rails applications.

## Installation

Add to Gemfile:

```ruby
gem 'httparty'
```

Then:

```bash
bundle install
```

## Setup

### 1. Add Initializer

Create `config/initializers/adsmedia.rb`:

```ruby
require_relative '../../lib/adsmedia'

ADSMedia.configure do |config|
  config.api_key = ENV['ADSMEDIA_API_KEY']
  config.from_name = 'My App'
end
```

### 2. Add to Credentials (alternative)

```bash
rails credentials:edit
```

```yaml
adsmedia:
  api_key: your-api-key
```

### 3. Add Routes (optional)

In `config/routes.rb`:

```ruby
namespace :api do
  resources :emails, only: [] do
    collection do
      post :send_email
      post :send_batch
      get :check_suppression
      get :ping
    end
  end
end
```

## Usage

### In Controllers/Services

```ruby
class UsersController < ApplicationController
  def create
    @user = User.create!(user_params)
    
    ADSMedia.client.send_email(
      to: @user.email,
      to_name: @user.name,
      subject: 'Welcome!',
      html: "<h1>Hello #{@user.name}!</h1>"
    )
  end
end
```

### Direct Client

```ruby
client = ADSMedia::Client.new('your-api-key')

result = client.send_email(
  to: 'user@example.com',
  subject: 'Hello!',
  html: '<h1>Welcome!</h1>'
)
```

### Batch Sending

```ruby
ADSMedia.client.send_batch(
  recipients: [
    { email: 'user1@example.com', name: 'User 1' },
    { email: 'user2@example.com', name: 'User 2' }
  ],
  subject: 'Hello %%First Name%%!',
  html: '<h1>Hi %%First Name%%!</h1>'
)
```

### Check Suppression

```ruby
result = ADSMedia.client.check_suppression('user@example.com')
if result[:suppressed]
  puts 'Email is suppressed'
end
```

## API Endpoints

- `POST /api/emails/send_email`
- `POST /api/emails/send_batch`
- `GET /api/emails/check_suppression?email=...`
- `GET /api/emails/ping`

## Links

- [API Documentation](https://www.adsmedia.ai/api-docs)
- [Ruby on Rails](https://rubyonrails.org)
- [GitHub](https://github.com/ADSMedia-ai/ADSMedia)

## License

MIT © [ADSMedia](https://www.adsmedia.ai)

