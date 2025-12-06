package com.adsmedia.sdk;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * ADSMedia API Client for Spring Boot
 */
public class ADSMediaClient {

    private static final String API_BASE_URL = "https://api.adsmedia.live/v1";

    private final String apiKey;
    private final String defaultFromName;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public ADSMediaClient(String apiKey) {
        this(apiKey, "Spring Boot");
    }

    public ADSMediaClient(String apiKey, String defaultFromName) {
        this.apiKey = apiKey;
        this.defaultFromName = defaultFromName;
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    private HttpHeaders getHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);
        return headers;
    }

    private <T> T request(HttpMethod method, String endpoint, Object body, Class<T> responseType) {
        String url = API_BASE_URL + endpoint;
        HttpEntity<?> entity = body != null
                ? new HttpEntity<>(body, getHeaders())
                : new HttpEntity<>(getHeaders());

        ResponseEntity<T> response = restTemplate.exchange(url, method, entity, responseType);
        return response.getBody();
    }

    /**
     * Send a single email
     */
    public Map<String, Object> send(SendEmailRequest request) {
        if (request.getFromName() == null) {
            request.setFromName(defaultFromName);
        }
        return request(HttpMethod.POST, "/send", request, Map.class);
    }

    /**
     * Send batch emails
     */
    public Map<String, Object> sendBatch(BatchEmailRequest request) {
        if (request.getFromName() == null) {
            request.setFromName(defaultFromName);
        }
        return request(HttpMethod.POST, "/send/batch", request, Map.class);
    }

    /**
     * Check if email is suppressed
     */
    public Map<String, Object> checkSuppression(String email) {
        return request(HttpMethod.GET, "/suppressions/check?email=" + email, null, Map.class);
    }

    /**
     * Test API connection
     */
    public Map<String, Object> ping() {
        return request(HttpMethod.GET, "/ping", null, Map.class);
    }

    /**
     * Get usage statistics
     */
    public Map<String, Object> getUsage() {
        return request(HttpMethod.GET, "/account/usage", null, Map.class);
    }

    // Request DTOs
    public static class SendEmailRequest {
        private String to;
        @JsonProperty("to_name")
        private String toName;
        private String subject;
        private String html;
        private String text;
        @JsonProperty("from_name")
        private String fromName;
        @JsonProperty("reply_to")
        private String replyTo;

        // Getters and Setters
        public String getTo() { return to; }
        public void setTo(String to) { this.to = to; }
        public String getToName() { return toName; }
        public void setToName(String toName) { this.toName = toName; }
        public String getSubject() { return subject; }
        public void setSubject(String subject) { this.subject = subject; }
        public String getHtml() { return html; }
        public void setHtml(String html) { this.html = html; }
        public String getText() { return text; }
        public void setText(String text) { this.text = text; }
        public String getFromName() { return fromName; }
        public void setFromName(String fromName) { this.fromName = fromName; }
        public String getReplyTo() { return replyTo; }
        public void setReplyTo(String replyTo) { this.replyTo = replyTo; }
    }

    public static class BatchEmailRequest {
        private List<Recipient> recipients;
        private String subject;
        private String html;
        private String text;
        private String preheader;
        @JsonProperty("from_name")
        private String fromName;

        // Getters and Setters
        public List<Recipient> getRecipients() { return recipients; }
        public void setRecipients(List<Recipient> recipients) { this.recipients = recipients; }
        public String getSubject() { return subject; }
        public void setSubject(String subject) { this.subject = subject; }
        public String getHtml() { return html; }
        public void setHtml(String html) { this.html = html; }
        public String getText() { return text; }
        public void setText(String text) { this.text = text; }
        public String getPreheader() { return preheader; }
        public void setPreheader(String preheader) { this.preheader = preheader; }
        public String getFromName() { return fromName; }
        public void setFromName(String fromName) { this.fromName = fromName; }
    }

    public static class Recipient {
        private String email;
        private String name;

        public Recipient() {}
        public Recipient(String email, String name) {
            this.email = email;
            this.name = name;
        }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
    }
}

