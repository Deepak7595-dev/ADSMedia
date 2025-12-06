# ADSMedia Spring Boot Integration

Send emails via ADSMedia API from Spring Boot applications.

## Setup

### 1. Add Dependencies

```xml
<!-- pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

### 2. Configuration

Add to `application.properties` or `application.yml`:

```properties
adsmedia.api-key=your-api-key
adsmedia.from-name=My App
```

Or set environment variable:

```bash
export ADSMEDIA_API_KEY=your-api-key
```

### 3. Add Classes

Copy `ADSMediaClient.java`, `ADSMediaConfig.java`, and optionally `ADSMediaController.java` to your project.

## Usage

### Inject Client

```java
@Service
public class EmailService {

    @Autowired
    private ADSMediaClient adsMediaClient;

    public void sendWelcome(String email, String name) {
        ADSMediaClient.SendEmailRequest request = new ADSMediaClient.SendEmailRequest();
        request.setTo(email);
        request.setToName(name);
        request.setSubject("Welcome!");
        request.setHtml("<h1>Hello " + name + "!</h1>");

        Map<String, Object> result = adsMediaClient.send(request);
        System.out.println("Message ID: " + result.get("data"));
    }
}
```

### Batch Sending

```java
List<ADSMediaClient.Recipient> recipients = List.of(
    new ADSMediaClient.Recipient("user1@example.com", "User 1"),
    new ADSMediaClient.Recipient("user2@example.com", "User 2")
);

ADSMediaClient.BatchEmailRequest request = new ADSMediaClient.BatchEmailRequest();
request.setRecipients(recipients);
request.setSubject("Hello %%First Name%%!");
request.setHtml("<h1>Hi %%First Name%%!</h1>");

adsMediaClient.sendBatch(request);
```

### Check Suppression

```java
Map<String, Object> result = adsMediaClient.checkSuppression("user@example.com");
Map<String, Object> data = (Map<String, Object>) result.get("data");
boolean suppressed = (boolean) data.get("suppressed");
```

## REST Endpoints

If you include `ADSMediaController.java`:

- `POST /email/send` - Send single email
- `POST /email/batch` - Send batch emails
- `GET /email/check?email=...` - Check suppression
- `GET /email/ping` - Test connection

## Links

- [API Documentation](https://www.adsmedia.ai/api-docs)
- [Spring Boot](https://spring.io/projects/spring-boot)
- [GitHub](https://github.com/ADSMedia-ai/ADSMedia)

## License

MIT © [ADSMedia](https://www.adsmedia.ai)

