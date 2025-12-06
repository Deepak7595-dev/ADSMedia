<?php

namespace ADSMedia;

/**
 * ADSMedia API Client
 */
class Client
{
    private string $apiKey;
    private string $baseUrl = 'https://api.adsmedia.live/v1';
    private int $timeout = 30;

    public function __construct(string $apiKey)
    {
        $this->apiKey = $apiKey;
    }

    /**
     * Make API request
     */
    private function request(string $method, string $endpoint, array $data = []): array
    {
        $url = $this->baseUrl . $endpoint;
        
        $headers = [
            'Authorization: Bearer ' . $this->apiKey,
            'Content-Type: application/json',
        ];

        $ch = curl_init();
        
        if ($method === 'GET' && !empty($data)) {
            $url .= '?' . http_build_query($data);
        }

        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => $this->timeout,
            CURLOPT_HTTPHEADER => $headers,
        ]);

        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        } elseif ($method === 'PUT') {
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        } elseif ($method === 'DELETE') {
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
        }

        $response = curl_exec($ch);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            throw new \Exception("cURL Error: $error");
        }

        $result = json_decode($response, true);
        
        if (!$result['success']) {
            throw new \Exception($result['error']['message'] ?? 'API Error');
        }

        return $result['data'];
    }

    /**
     * Test API connection
     */
    public function ping(): array
    {
        return $this->request('GET', '/ping');
    }

    /**
     * Send single email
     */
    public function send(array $params): array
    {
        return $this->request('POST', '/send', $params);
    }

    /**
     * Send batch emails
     */
    public function sendBatch(array $params): array
    {
        return $this->request('POST', '/send/batch', $params);
    }

    /**
     * Check email status
     */
    public function getStatus(string $messageId): array
    {
        return $this->request('GET', '/send/status', ['message_id' => $messageId]);
    }

    /**
     * List campaigns
     */
    public function getCampaigns(int $limit = 50, int $offset = 0): array
    {
        return $this->request('GET', '/campaigns', [
            'limit' => $limit,
            'offset' => $offset,
        ]);
    }

    /**
     * Get campaign
     */
    public function getCampaign(int $id): array
    {
        return $this->request('GET', '/campaigns/get', ['id' => $id]);
    }

    /**
     * Create campaign
     */
    public function createCampaign(array $params): array
    {
        return $this->request('POST', '/campaigns/create', $params);
    }

    /**
     * Update campaign
     */
    public function updateCampaign(int $id, array $params): array
    {
        return $this->request('POST', '/campaigns/update', array_merge(['id' => $id], $params));
    }

    /**
     * Delete campaign
     */
    public function deleteCampaign(int $id): array
    {
        return $this->request('DELETE', '/campaigns/delete', ['id' => $id]);
    }

    /**
     * List contact lists
     */
    public function getLists(): array
    {
        return $this->request('GET', '/lists');
    }

    /**
     * Create list
     */
    public function createList(string $name, int $type = 1): array
    {
        return $this->request('POST', '/lists/create', [
            'name' => $name,
            'type' => $type,
        ]);
    }

    /**
     * Get contacts from list
     */
    public function getContacts(int $listId, int $limit = 100, int $offset = 0): array
    {
        return $this->request('GET', '/lists/contacts', [
            'id' => $listId,
            'limit' => $limit,
            'offset' => $offset,
        ]);
    }

    /**
     * Add contacts to list
     */
    public function addContacts(int $listId, array $contacts): array
    {
        return $this->request('POST', '/lists/contacts/add', [
            'id' => $listId,
            'contacts' => $contacts,
        ]);
    }

    /**
     * Split list
     */
    public function splitList(int $id, int $maxSize = 35000): array
    {
        return $this->request('POST', '/lists/split', [
            'id' => $id,
            'max_size' => $maxSize,
        ]);
    }

    /**
     * List schedules
     */
    public function getSchedules(string $status = 'queue'): array
    {
        return $this->request('GET', '/schedules', ['status' => $status]);
    }

    /**
     * Create schedule
     */
    public function createSchedule(array $params): array
    {
        return $this->request('POST', '/schedules/create', $params);
    }

    /**
     * Update schedule
     */
    public function updateSchedule(int $id, array $params): array
    {
        return $this->request('PUT', '/schedules/update', array_merge(['id' => $id], $params));
    }

    /**
     * Pause schedule
     */
    public function pauseSchedule(int $id): array
    {
        return $this->request('POST', '/schedules/pause', ['id' => $id]);
    }

    /**
     * Resume schedule
     */
    public function resumeSchedule(int $id): array
    {
        return $this->request('POST', '/schedules/resume', ['id' => $id]);
    }

    /**
     * Stop schedule
     */
    public function stopSchedule(int $id): array
    {
        return $this->request('DELETE', '/schedules/stop', ['id' => $id]);
    }

    /**
     * List servers
     */
    public function getServers(): array
    {
        return $this->request('GET', '/servers');
    }

    /**
     * Get server
     */
    public function getServer(int $id): array
    {
        return $this->request('GET', '/servers/get', ['id' => $id]);
    }

    /**
     * Verify domain
     */
    public function verifyDomain(int $serverId): array
    {
        return $this->request('GET', '/domains/verify', ['server_id' => $serverId]);
    }

    /**
     * Get overview stats
     */
    public function getStats(): array
    {
        return $this->request('GET', '/stats/overview');
    }

    /**
     * Get campaign stats
     */
    public function getCampaignStats(int $taskId): array
    {
        return $this->request('GET', '/stats/campaign', ['id' => $taskId]);
    }

    /**
     * Check email suppression
     */
    public function checkSuppression(string $email): array
    {
        return $this->request('GET', '/suppressions/check', ['email' => $email]);
    }

    /**
     * Get account info
     */
    public function getAccount(): array
    {
        return $this->request('GET', '/account');
    }

    /**
     * Get usage stats
     */
    public function getUsage(): array
    {
        return $this->request('GET', '/account/usage');
    }
}

