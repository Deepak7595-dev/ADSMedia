package com.adsmedia.sdk;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Spring Boot Configuration for ADSMedia
 */
@Configuration
public class ADSMediaConfig {

    @Value("${adsmedia.api-key:#{null}}")
    private String apiKey;

    @Value("${adsmedia.from-name:Spring Boot}")
    private String fromName;

    @Bean
    public ADSMediaClient adsMediaClient() {
        String key = apiKey != null ? apiKey : System.getenv("ADSMEDIA_API_KEY");
        if (key == null || key.isEmpty()) {
            throw new IllegalArgumentException("ADSMedia API key not configured");
        }
        return new ADSMediaClient(key, fromName);
    }
}

