<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;

/**
 * ADSMedia API Service for Laravel
 * 
 * composer require guzzlehttp/guzzle
 */
class ADSMediaService
{
    private Client $client;
    private string $apiKey;
    private string $defaultFromName;
    private const BASE_URL = 'https://api.adsmedia.live/v1';

    public function __construct(?string $apiKey = null, string $defaultFromName = 'Laravel')
    {
        $this->apiKey = $apiKey ?? config('services.adsmedia.api_key') ?? env('ADSMEDIA_API_KEY');
        $this->defaultFromName = $defaultFromName;

        if (!$this->apiKey) {
            throw new \InvalidArgumentException('ADSMedia API key not configured');
        }

        $this->client = new Client([
            'base_uri' => self::BASE_URL,
            'headers' => [
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ],
            'http_errors' => false,
        ]);
    }

    private function request(string $method, string $endpoint, array $data = []): array
    {
        $options = [];
        
        if ($method === 'GET' && !empty($data)) {
            $options['query'] = $data;
        } elseif ($method !== 'GET' && !empty($data)) {
            $options['json'] = $data;
        }

        try {
            $response = $this->client->request($method, $endpoint, $options);
            $result = json_decode($response->getBody()->getContents(), true);

            if (!($result['success'] ?? false)) {
                throw new \Exception($result['error']['message'] ?? 'ADSMedia API Error');
            }

            return $result['data'] ?? [];
        } catch (GuzzleException $e) {
            throw new \Exception('ADSMedia request failed: ' . $e->getMessage());
        }
    }

    /**
     * Send a single email
     */
    public function send(
        string $to,
        string $subject,
        string $html,
        ?string $toName = null,
        ?string $fromName = null,
        ?string $text = null,
        ?string $replyTo = null
    ): array {
        $payload = [
            'to' => $to,
            'subject' => $subject,
            'html' => $html,
            'from_name' => $fromName ?? $this->defaultFromName,
        ];

        if ($toName) $payload['to_name'] = $toName;
        if ($text) $payload['text'] = $text;
        if ($replyTo) $payload['reply_to'] = $replyTo;

        return $this->request('POST', '/send', $payload);
    }

    /**
     * Send batch emails
     */
    public function sendBatch(
        array $recipients,
        string $subject,
        string $html,
        ?string $text = null,
        ?string $preheader = null,
        ?string $fromName = null
    ): array {
        $payload = [
            'recipients' => $recipients,
            'subject' => $subject,
            'html' => $html,
            'from_name' => $fromName ?? $this->defaultFromName,
        ];

        if ($text) $payload['text'] = $text;
        if ($preheader) $payload['preheader'] = $preheader;

        return $this->request('POST', '/send/batch', $payload);
    }

    /**
     * Check if email is suppressed
     */
    public function checkSuppression(string $email): array
    {
        return $this->request('GET', '/suppressions/check', ['email' => $email]);
    }

    /**
     * Test API connection
     */
    public function ping(): array
    {
        return $this->request('GET', '/ping');
    }

    /**
     * Get usage statistics
     */
    public function getUsage(): array
    {
        return $this->request('GET', '/account/usage');
    }
}

