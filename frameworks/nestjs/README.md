# ADSMedia NestJS Module

Send emails via ADSMedia API from NestJS applications.

## Installation

```bash
npm install @nestjs/config
```

## Setup

### Static Configuration

```typescript
import { Module } from '@nestjs/common';
import { ADSMediaModule } from './adsmedia.module';

@Module({
  imports: [
    ADSMediaModule.forRoot({
      apiKey: 'your-api-key',
      defaultFromName: 'My App',
    }),
  ],
})
export class AppModule {}
```

### Async Configuration

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ADSMediaModule } from './adsmedia.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ADSMediaModule.forRootAsync(),
  ],
})
export class AppModule {}
```

## Usage

### In Services

```typescript
import { Injectable } from '@nestjs/common';
import { ADSMediaService } from './adsmedia.module';

@Injectable()
export class UserService {
  constructor(private readonly adsmedia: ADSMediaService) {}

  async sendWelcome(email: string, name: string) {
    return this.adsmedia.send({
      to: email,
      toName: name,
      subject: 'Welcome!',
      html: `<h1>Hello ${name}!</h1>`,
    });
  }
}
```

### In Controllers

```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { ADSMediaService } from './adsmedia.module';

@Controller('email')
export class EmailController {
  constructor(private readonly adsmedia: ADSMediaService) {}

  @Post('send')
  async send(@Body() body: { to: string; subject: string; html: string }) {
    return this.adsmedia.send(body);
  }

  @Get('check')
  async check(@Query('email') email: string) {
    return this.adsmedia.checkSuppression(email);
  }
}
```

### Batch Sending

```typescript
await this.adsmedia.sendBatch({
  recipients: [
    { email: 'user1@example.com', name: 'User 1' },
    { email: 'user2@example.com', name: 'User 2' },
  ],
  subject: 'Hello %%First Name%%!',
  html: '<h1>Hi %%First Name%%!</h1>',
});
```

## API

### ADSMediaService

- `send(options)` - Send single email
- `sendBatch(options)` - Send batch emails
- `checkSuppression(email)` - Check if email is suppressed
- `ping()` - Test API connection
- `getUsage()` - Get usage stats

## Links

- [API Documentation](https://www.adsmedia.ai/api-docs)
- [NestJS](https://nestjs.com)
- [GitHub](https://github.com/ADSMedia-ai/ADSMedia)

## License

MIT © [ADSMedia](https://www.adsmedia.ai)

