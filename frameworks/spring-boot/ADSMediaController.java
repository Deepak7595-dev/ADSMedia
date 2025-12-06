package com.adsmedia.sdk;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Spring Boot REST Controller for ADSMedia
 */
@RestController
@RequestMapping("/email")
public class ADSMediaController {

    @Autowired
    private ADSMediaClient adsMediaClient;

    @PostMapping("/send")
    public ResponseEntity<Map<String, Object>> sendEmail(@RequestBody ADSMediaClient.SendEmailRequest request) {
        try {
            Map<String, Object> result = adsMediaClient.send(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/batch")
    public ResponseEntity<Map<String, Object>> sendBatch(@RequestBody ADSMediaClient.BatchEmailRequest request) {
        try {
            Map<String, Object> result = adsMediaClient.sendBatch(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/check")
    public ResponseEntity<Map<String, Object>> checkSuppression(@RequestParam String email) {
        try {
            Map<String, Object> result = adsMediaClient.checkSuppression(email);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/ping")
    public ResponseEntity<Map<String, Object>> ping() {
        try {
            Map<String, Object> result = adsMediaClient.ping();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }
}

