# ADSMedia Next.js Integration

Send emails via ADSMedia API from Next.js applications.

## Setup

Add to `.env.local`:

```
ADSMEDIA_API_KEY=your-api-key
```

## App Router (Server Actions)

```tsx
// app/actions.ts
import { sendEmail } from '@/lib/adsmedia';

export async function submitContactForm(formData: FormData) {
  'use server';
  
  const email = formData.get('email') as string;
  const name = formData.get('name') as string;
  
  await sendEmail({
    to: email,
    toName: name,
    subject: 'Thanks for contacting us!',
    html: `<h1>Hello ${name}!</h1>`,
  });
  
  return { success: true };
}
```

```tsx
// app/contact/page.tsx
import { submitContactForm } from '../actions';

export default function ContactPage() {
  return (
    <form action={submitContactForm}>
      <input name="name" placeholder="Name" />
      <input name="email" placeholder="Email" />
      <button type="submit">Submit</button>
    </form>
  );
}
```

## Pages Router (API Routes)

```ts
// pages/api/send-email.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createADSMediaClient } from '@/lib/adsmedia';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const client = createADSMediaClient();
  
  try {
    const result = await client.send(req.body);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
```

## Direct Import

```ts
import { sendEmail, checkSuppression } from '@/lib/adsmedia';

// In server component or action
const result = await sendEmail({
  to: 'user@example.com',
  subject: 'Hello!',
  html: '<h1>Welcome!</h1>',
});

const check = await checkSuppression('user@example.com');
```

## Links

- [API Documentation](https://www.adsmedia.ai/api-docs)
- [Next.js](https://nextjs.org)
- [GitHub](https://github.com/ADSMedia-ai/ADSMedia)

## License

MIT © [ADSMedia](https://www.adsmedia.ai)

