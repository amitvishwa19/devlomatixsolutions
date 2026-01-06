# Prisma Schema for Mailer Project

This folder contains the Prisma schema definition for the mailer application.

## Setup Instructions

### 1. Install Prisma

```bash
npm install prisma @prisma/client
npm install -D prisma
```

### 2. Environment Variables

Add these to your `.env` file:

```env
# Connection pooling URL (for serverless/edge)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct connection URL (for migrations)
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
```

### 3. Initialize Prisma

```bash
# Copy schema to your project root
cp src/mailer/_prisma/schema.prisma prisma/schema.prisma

# Generate Prisma Client
npx prisma generate

# Push schema to database (development)
npx prisma db push

# Or create migrations (production)
npx prisma migrate dev --name init
```

## Models Overview

| Model | Description |
|-------|-------------|
| `Profile` | User profile with Google OAuth tokens |
| `Email` | Synced emails from Gmail |
| `Draft` | Unsent email drafts |
| `Attachment` | Email attachments metadata |
| `Label` | Custom and system labels |
| `SyncState` | Gmail sync tracking per user |

## Usage in Next.js

### Create Prisma Client

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### Server Component Example

```typescript
// app/emails/page.tsx
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export default async function EmailsPage() {
  const session = await auth()
  
  const emails = await prisma.email.findMany({
    where: { userId: session.user.id },
    orderBy: { receivedAt: 'desc' },
    take: 50,
  })

  return <EmailList emails={emails} />
}
```

### API Route Example

```typescript
// app/api/emails/route.ts
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  const emails = await prisma.email.findMany({
    where: { userId: userId! },
    include: { attachments: true },
    orderBy: { receivedAt: 'desc' },
  })

  return NextResponse.json(emails)
}

export async function PATCH(request: Request) {
  const { id, isRead, isStarred } = await request.json()

  const email = await prisma.email.update({
    where: { id },
    data: { isRead, isStarred },
  })

  return NextResponse.json(email)
}
```

### Server Action Example

```typescript
// app/actions/emails.ts
'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function markAsRead(emailId: string) {
  await prisma.email.update({
    where: { id: emailId },
    data: { isRead: true },
  })
  revalidatePath('/emails')
}

export async function deleteEmail(emailId: string) {
  await prisma.email.delete({
    where: { id: emailId },
  })
  revalidatePath('/emails')
}

export async function saveDraft(data: {
  userId: string
  subject?: string
  recipients: string[]
  bodyHtml?: string
}) {
  const draft = await prisma.draft.create({ data })
  revalidatePath('/drafts')
  return draft
}
```

## Notes

- Schema uses `@map()` to match Supabase snake_case column naming
- UUIDs use `gen_random_uuid()` for Supabase compatibility
- Timestamps use `@db.Timestamptz` for timezone awareness
- The `Profile` model links to Supabase Auth via `userId`
