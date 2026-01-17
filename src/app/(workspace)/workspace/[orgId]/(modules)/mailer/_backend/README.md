# Mailer Backend API

Reusable backend functions for mailbox operations. Designed to work with Next.js and Supabase.

## Installation in Next.js

1. Copy the `backend` folder to your Next.js project (e.g., `lib/mailer/`)

2. Install dependencies:
```bash
npm install @supabase/supabase-js @supabase/ssr
```

3. Set up environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

4. Create Supabase client:

```javascript
// lib/supabase/client.js (for client components)
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
```

```javascript
// lib/supabase/server.js (for server components)
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = () => {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

## Usage Examples

### Client Component

```jsx
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { fetchEmails, markAsRead, syncGmail } from '@/lib/mailer/backend'

export function Mailbox() {
  const [emails, setEmails] = useState([])
  const supabase = createClient()

  useEffect(() => {
    async function loadEmails() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { emails } = await fetchEmails(supabase, user.id)
        setEmails(emails)
      }
    }
    loadEmails()
  }, [])

  const handleMarkRead = async (emailId) => {
    const { data: { user } } = await supabase.auth.getUser()
    await markAsRead(supabase, emailId, user.id)
  }

  return (
    <div>
      {emails.map(email => (
        <div key={email.id} onClick={() => handleMarkRead(email.id)}>
          {email.subject}
        </div>
      ))}
    </div>
  )
}
```

### Server Component

```jsx
import { createClient } from '@/lib/supabase/server'
import { fetchEmails } from '@/lib/mailer/backend'

export default async function MailboxPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const { emails } = await fetchEmails(supabase, user.id)

  return (
    <div>
      {emails.map(email => (
        <div key={email.id}>{email.subject}</div>
      ))}
    </div>
  )
}
```

### API Route

```javascript
// app/api/emails/sync/route.js
import { createClient } from '@/lib/supabase/server'
import { syncGmail } from '@/lib/mailer/backend'

export async function POST() {
  const supabase = createClient()
  const { synced, error } = await syncGmail(supabase)

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ synced })
}
```

## API Reference

### Authentication
- `getSession(supabase)` - Get current session
- `signInWithEmail(supabase, email, password)` - Sign in
- `signUpWithEmail(supabase, email, password, metadata, redirectTo)` - Sign up
- `signInWithGoogle(supabase, redirectTo)` - Google OAuth with Gmail scopes
- `signOut(supabase)` - Sign out
- `getProfile(supabase, userId)` - Get user profile

### Emails
- `fetchEmails(supabase, userId, options)` - Fetch emails with filters
- `getEmailById(supabase, emailId, userId)` - Get single email
- `markAsRead(supabase, emailId, userId)` - Mark as read
- `markAsUnread(supabase, emailId, userId)` - Mark as unread
- `setStarred(supabase, emailId, userId, isStarred)` - Toggle star
- `deleteEmail(supabase, emailId, userId)` - Delete email
- `bulkMarkAsRead(supabase, emailIds, userId)` - Bulk mark read
- `bulkDeleteEmails(supabase, emailIds, userId)` - Bulk delete
- `searchEmails(supabase, userId, searchTerm)` - Search emails
- `getEmailCounts(supabase, userId)` - Get inbox/unread/starred counts

### Gmail
- `syncGmail(supabase)` - Sync from Gmail
- `sendEmail(supabase, { to, subject, body, cc, bcc })` - Send email
- `getGmailConnectionStatus(supabase, userId)` - Check connection
- `disconnectGmail(supabase, userId)` - Disconnect Gmail

### Realtime
- `subscribeToEmails(supabase, userId, { onInsert, onUpdate, onDelete })` - Subscribe to changes
- `unsubscribeFromEmails(supabase, channel)` - Unsubscribe
- `subscribeToEmailChanges(supabase, userId, onChange)` - Simple subscription

## Database Schema Required

```sql
-- emails table
CREATE TABLE emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  gmail_id TEXT NOT NULL,
  thread_id TEXT,
  subject TEXT,
  sender TEXT NOT NULL,
  sender_email TEXT,
  recipients TEXT[],
  body_html TEXT,
  body_text TEXT,
  snippet TEXT,
  labels TEXT[],
  is_read BOOLEAN DEFAULT false,
  is_starred BOOLEAN DEFAULT false,
  received_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  google_access_token TEXT,
  google_refresh_token TEXT,
  google_token_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```
