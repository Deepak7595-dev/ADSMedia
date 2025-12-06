# ADSMedia + Weglot Integration

Send localized emails with Weglot translations.

## Setup

### Weglot API + ADSMedia

```javascript
const WEGLOT_API_KEY = process.env.WEGLOT_API_KEY;
const ADSMEDIA_API_KEY = process.env.ADSMEDIA_API_KEY;

async function translateText(text, targetLang) {
  const response = await fetch('https://api.weglot.com/translate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      api_key: WEGLOT_API_KEY,
      l_from: 'en',
      l_to: targetLang,
      words: [{ t: 1, w: text }],
    }),
  });
  
  const data = await response.json();
  return data.to_words[0];
}

async function sendLocalizedEmail(recipient, subject, html) {
  const lang = recipient.language || 'en';
  
  let finalSubject = subject;
  let finalHtml = html;
  
  // Translate if not English
  if (lang !== 'en') {
    finalSubject = await translateText(subject, lang);
    finalHtml = await translateText(html, lang);
  }
  
  return fetch('https://api.adsmedia.live/v1/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ADSMEDIA_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: recipient.email,
      to_name: recipient.name,
      subject: finalSubject,
      html: finalHtml,
      from_name: 'Your Company',
    }),
  });
}

// Example: Send welcome email in user's language
await sendLocalizedEmail(
  { email: 'user@example.com', name: 'Jean', language: 'fr' },
  'Welcome to Our Platform!',
  '<h1>Welcome!</h1><p>Thanks for signing up.</p>'
);
```

## Links

- [API Documentation](https://www.adsmedia.ai/api-docs)
- [Weglot](https://weglot.com)

