import { Module, Global, DynamicModule, Inject, Injectable } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

const API_BASE_URL = 'https://api.adsmedia.live/v1';

export interface ADSMediaModuleOptions {
  apiKey: string;
  defaultFromName?: string;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  toName?: string;
  fromName?: string;
  text?: string;
  replyTo?: string;
}

export interface BatchRecipient {
  email: string;
  name?: string;
}

export interface BatchEmailOptions {
  recipients: BatchRecipient[];
  subject: string;
  html: string;
  text?: string;
  preheader?: string;
  fromName?: string;
}

@Injectable()
export class ADSMediaService {
  private apiKey: string;
  private defaultFromName: string;

  constructor(
    @Inject('ADSMEDIA_OPTIONS') private options: ADSMediaModuleOptions,
  ) {
    this.apiKey = options.apiKey;
    this.defaultFromName = options.defaultFromName || 'NestJS';
  }

  private async request(method: string, endpoint: string, body?: any): Promise<any> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const options: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error?.message || 'ADSMedia API Error');
    }

    return data.data;
  }

  async send(options: SendEmailOptions): Promise<any> {
    const payload: any = {
      to: options.to,
      subject: options.subject,
      html: options.html,
      from_name: options.fromName || this.defaultFromName,
    };

    if (options.toName) payload.to_name = options.toName;
    if (options.text) payload.text = options.text;
    if (options.replyTo) payload.reply_to = options.replyTo;

    return this.request('POST', '/send', payload);
  }

  async sendBatch(options: BatchEmailOptions): Promise<any> {
    const payload: any = {
      recipients: options.recipients,
      subject: options.subject,
      html: options.html,
      from_name: options.fromName || this.defaultFromName,
    };

    if (options.text) payload.text = options.text;
    if (options.preheader) payload.preheader = options.preheader;

    return this.request('POST', '/send/batch', payload);
  }

  async checkSuppression(email: string): Promise<any> {
    return this.request('GET', `/suppressions/check?email=${encodeURIComponent(email)}`);
  }

  async ping(): Promise<any> {
    return this.request('GET', '/ping');
  }

  async getUsage(): Promise<any> {
    return this.request('GET', '/account/usage');
  }
}

@Global()
@Module({})
export class ADSMediaModule {
  static forRoot(options: ADSMediaModuleOptions): DynamicModule {
    return {
      module: ADSMediaModule,
      providers: [
        {
          provide: 'ADSMEDIA_OPTIONS',
          useValue: options,
        },
        ADSMediaService,
      ],
      exports: [ADSMediaService],
    };
  }

  static forRootAsync(): DynamicModule {
    return {
      module: ADSMediaModule,
      imports: [ConfigModule],
      providers: [
        {
          provide: 'ADSMEDIA_OPTIONS',
          useFactory: (configService: ConfigService) => ({
            apiKey: configService.get('ADSMEDIA_API_KEY'),
            defaultFromName: configService.get('ADSMEDIA_FROM_NAME'),
          }),
          inject: [ConfigService],
        },
        ADSMediaService,
      ],
      exports: [ADSMediaService],
    };
  }
}

