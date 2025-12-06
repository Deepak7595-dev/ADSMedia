/**
 * ADSMedia Email API SDK
 * Official JavaScript/TypeScript SDK for ADSMedia Email API
 * 
 * @packageDocumentation
 */

// Types
export interface ADSMediaConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
}

export interface SendEmailOptions {
  to: string;
  toName?: string;
  subject: string;
  html?: string;
  text?: string;
  type?: 1 | 2 | 3; // 1=HTML+text, 2=HTML only, 3=text only
  fromName?: string;
  replyTo?: string;
  serverId?: number;
  unsubscribeUrl?: string;
}

export interface BatchRecipient {
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  custom1?: string;
  custom2?: string;
}

export interface SendBatchOptions {
  recipients: BatchRecipient[];
  subject: string;
  html: string;
  text?: string;
  preheader?: string;
  fromName?: string;
  serverId?: number;
}

export interface Campaign {
  id: number;
  name: string;
  subject: string;
  html: string;
  text?: string;
  preheader?: string;
  type: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCampaignOptions {
  name: string;
  subject: string;
  html: string;
  text?: string;
  preheader?: string;
  type?: 1 | 2 | 3;
}

export interface ContactList {
  id: number;
  name: string;
  type: number;
  count: number;
  createdAt: string;
}

export interface CreateListOptions {
  name: string;
  type?: 1 | 3; // 1=email, 3=phone
}

export interface Contact {
  email: string;
  firstName?: string;
  lastName?: string;
  custom1?: string;
  custom2?: string;
}

export interface Schedule {
  id: number;
  campaignId: number;
  listId: number;
  serverId: number;
  senderName?: string;
  scheduledAt?: string;
  status: string;
  createdAt: string;
}

export interface CreateScheduleOptions {
  campaignId: number;
  listId: number;
  serverId: number;
  senderName?: string;
  schedule?: string; // YYYY-MM-DD HH:MM:SS
}

export interface Server {
  id: number;
  domain: string;
  status: string;
  dailyLimit: number;
  sentToday: number;
}

export interface DomainVerification {
  spf: { valid: boolean; record?: string };
  dkim: { valid: boolean; record?: string };
  dmarc: { valid: boolean; record?: string };
  mx: { valid: boolean; records?: string[] };
  ptr: { valid: boolean; record?: string };
}

export interface Stats {
  sent: number;
  delivered: number;
  opens: number;
  clicks: number;
  bounces: number;
  unsubscribes: number;
  complaints: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  error?: string;
}

// API Client
export class ADSMedia {
  private apiKey: string;
  private baseUrl: string;
  private timeout: number;

  constructor(config: ADSMediaConfig) {
    if (!config.apiKey) {
      throw new Error('API key is required');
    }
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.adsmedia.live/v1';
    this.timeout = config.timeout || 30000;
  }

  private async request<T>(
    method: string,
    endpoint: string,
    body?: Record<string, unknown>
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json() as ApiResponse<T>;

      if (!response.ok) {
        throw new ADSMediaError(
          data.error || `HTTP ${response.status}`,
          response.status
        );
      }

      if (!data.success) {
        throw new ADSMediaError(data.error || 'Unknown error');
      }

      return data.data;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof ADSMediaError) throw error;
      if ((error as Error).name === 'AbortError') {
        throw new ADSMediaError('Request timeout', 408);
      }
      throw new ADSMediaError((error as Error).message);
    }
  }

  // Connection Test
  async ping(): Promise<{ message: string; userId: string; version: string }> {
    return this.request('GET', '/ping');
  }

  // Email Methods
  async send(options: SendEmailOptions): Promise<{ messageId: string; sendId: number }> {
    return this.request('POST', '/send', {
      to: options.to,
      to_name: options.toName,
      subject: options.subject,
      html: options.html,
      text: options.text,
      type: options.type,
      from_name: options.fromName,
      reply_to: options.replyTo,
      server_id: options.serverId,
      unsubscribe_url: options.unsubscribeUrl,
    });
  }

  async sendBatch(options: SendBatchOptions): Promise<{ taskId: number; queued: number }> {
    return this.request('POST', '/send/batch', {
      recipients: options.recipients,
      subject: options.subject,
      html: options.html,
      text: options.text,
      preheader: options.preheader,
      from_name: options.fromName,
      server_id: options.serverId,
    });
  }

  async getStatus(params: { messageId?: string; sendId?: number }): Promise<{
    status: string;
    to: string;
    subject: string;
    sentAt: string;
  }> {
    const query = params.messageId 
      ? `message_id=${params.messageId}` 
      : `id=${params.sendId}`;
    return this.request('GET', `/send/status?${query}`);
  }

  // Campaign Methods
  async getCampaigns(limit = 50, offset = 0): Promise<Campaign[]> {
    return this.request('GET', `/campaigns?limit=${limit}&offset=${offset}`);
  }

  async getCampaign(id: number): Promise<Campaign> {
    return this.request('GET', `/campaigns/get?id=${id}`);
  }

  async createCampaign(options: CreateCampaignOptions): Promise<{ id: number }> {
    return this.request('POST', '/campaigns/create', options);
  }

  async updateCampaign(id: number, options: Partial<CreateCampaignOptions>): Promise<{ success: boolean }> {
    return this.request('POST', `/campaigns/update?id=${id}`, options);
  }

  async deleteCampaign(id: number): Promise<{ success: boolean }> {
    return this.request('DELETE', `/campaigns/delete?id=${id}`);
  }

  // List Methods
  async getLists(): Promise<ContactList[]> {
    return this.request('GET', '/lists');
  }

  async getList(id: number): Promise<ContactList> {
    return this.request('GET', `/lists/get?id=${id}`);
  }

  async createList(options: CreateListOptions): Promise<{ id: number }> {
    return this.request('POST', '/lists/create', options);
  }

  async deleteList(id: number): Promise<{ success: boolean }> {
    return this.request('DELETE', `/lists/delete?id=${id}`);
  }

  async getContacts(listId: number, limit = 100, offset = 0): Promise<Contact[]> {
    return this.request('GET', `/lists/contacts?id=${listId}&limit=${limit}&offset=${offset}`);
  }

  async addContacts(listId: number, contacts: Contact[]): Promise<{ added: number }> {
    return this.request('POST', `/lists/contacts/add?id=${listId}`, { contacts });
  }

  async removeContacts(listId: number, emails: string[]): Promise<{ removed: number }> {
    return this.request('DELETE', `/lists/contacts/delete?id=${listId}`, { emails });
  }

  async splitList(listId: number, maxSize = 35000): Promise<{ lists: number[] }> {
    return this.request('POST', `/lists/split?id=${listId}`, { max_size: maxSize });
  }

  // Schedule Methods
  async getSchedules(status?: string): Promise<Schedule[]> {
    const query = status ? `?status=${status}` : '';
    return this.request('GET', `/schedules${query}`);
  }

  async createSchedule(options: CreateScheduleOptions): Promise<{ id: number }> {
    return this.request('POST', '/schedules/create', {
      campaign_id: options.campaignId,
      list_id: options.listId,
      server_id: options.serverId,
      sender_name: options.senderName,
      schedule: options.schedule,
    });
  }

  async pauseSchedule(id: number): Promise<{ success: boolean }> {
    return this.request('POST', `/schedules/pause?id=${id}`);
  }

  async resumeSchedule(id: number): Promise<{ success: boolean }> {
    return this.request('POST', `/schedules/resume?id=${id}`);
  }

  async stopSchedule(id: number): Promise<{ success: boolean }> {
    return this.request('DELETE', `/schedules/stop?id=${id}`);
  }

  async updateSchedule(id: number, options: { senderName?: string; schedule?: string }): Promise<{ success: boolean }> {
    return this.request('POST', `/schedules/update?id=${id}`, {
      sender_name: options.senderName,
      schedule: options.schedule,
    });
  }

  // Server Methods
  async getServers(): Promise<Server[]> {
    return this.request('GET', '/servers');
  }

  async getServer(id: number): Promise<Server> {
    return this.request('GET', `/servers/get?id=${id}`);
  }

  async verifyDomain(serverId: number): Promise<DomainVerification> {
    return this.request('GET', `/domains/verify?server_id=${serverId}`);
  }

  // Stats Methods
  async getOverviewStats(): Promise<Stats> {
    return this.request('GET', '/stats/overview');
  }

  async getCampaignStats(taskId: number): Promise<Stats> {
    return this.request('GET', `/stats/campaign?id=${taskId}`);
  }

  async getHourlyStats(taskId: number): Promise<Record<string, Stats>> {
    return this.request('GET', `/stats/hourly?id=${taskId}`);
  }

  async getDailyStats(taskId: number): Promise<Record<string, Stats>> {
    return this.request('GET', `/stats/daily?id=${taskId}`);
  }

  async getCountryStats(taskId: number): Promise<Record<string, number>> {
    return this.request('GET', `/stats/countries?id=${taskId}`);
  }

  async getProviderStats(taskId: number): Promise<Record<string, Stats>> {
    return this.request('GET', `/stats/providers?id=${taskId}`);
  }

  async getBounceDetails(taskId: number): Promise<Array<{ email: string; reason: string; type: string }>> {
    return this.request('GET', `/stats/bounces?id=${taskId}`);
  }

  async getEvents(
    taskId: number,
    type: 'open' | 'click' | 'bounce' | 'unsubscribe' | 'sent',
    limit = 100,
    offset = 0
  ): Promise<Array<{ email: string; timestamp: string; data?: Record<string, unknown> }>> {
    return this.request('GET', `/stats/events?id=${taskId}&type=${type}&limit=${limit}&offset=${offset}`);
  }

  // Suppression Methods
  async checkSuppression(email: string): Promise<{ suppressed: boolean; reason?: string }> {
    return this.request('GET', `/suppressions/check?email=${encodeURIComponent(email)}`);
  }

  // Account Methods
  async getAccount(): Promise<{ id: number; email: string; plan: string }> {
    return this.request('GET', '/account');
  }

  async getUsage(): Promise<{ sent: number; limit: number; period: string }> {
    return this.request('GET', '/account/usage');
  }
}

// Error Class
export class ADSMediaError extends Error {
  public statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'ADSMediaError';
    this.statusCode = statusCode;
  }
}

// Default export
export default ADSMedia;

