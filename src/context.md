# Technical Context & Blueprint: Devlomatix Business OS

> [!IMPORTANT]
> **Maintenance Protocol:** This document MUST be updated at the end of every work session or after any significant architectural change. Every agent is responsible for maintaining the accuracy and "Live State" of this context.

---

## 1. Core Architecture
Devlomatix is built as a **Multi-tenant Business OS**. Every entity in the system is isolated by a `workspaceId`.

### Multi-tenancy Strategy
*   **Identification:** `workspaceId` is extracted from the URL params in the Next.js App Router (`/workspace/[workspaceId]/...`).
*   **Authentication:** `next-auth` handles user sessions. Every API request verifies the `session.user.userId` and ensures it has access to the requested `workspaceId`.
*   **Database Isolation:** All queries include a `where: { workspaceId }` clause.

---

## 2. Database Layer (Prisma)
We use PostgreSQL (Supabase) via Prisma ORM.

### Key Models

#### `Contact`
The central model for all human/business relationships.
```prisma
model Contact {
  id              String           @id @default(cuid())
  workspaceId     String?          @default("cmnbhifag000458ikwhv1zso2")
  userId          String
  name            String
  phone           String
  email           String?
  type            String?          @default("CONTACT") // CONTACT, CLIENT, LEAD
  info            Json?
  tags            String[]         @default([])
  lastMessage     String?
  lastInteraction DateTime?
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  user            User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  groups          ContactGroup[]   @relation("ContactToGroup")
  ecommerceOrders ECommerceOrder[]

  @@unique([workspaceId, phone])
  @@index([userId])
  @@index([workspaceId])
  @@index([phone])
}
```

#### `ContactGroup`
Used for labeling and categorizing contacts.
```prisma
model ContactGroup {
  id          String    @id @default(cuid())
  workspaceId String?   @default("cmnbhifag000458ikwhv1zso2")
  userId      String
  name        String
  description String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  contacts    Contact[] @relation("ContactToGroup")

  @@unique([workspaceId, name])
}
```

---

## 3. API Specifications

### Contacts API (`/api/workspace/[workspaceId]/contacts`)
*   `GET`: Fetch contacts. Supports `search` (name/phone/email) and `groupId` query parameters.
*   `POST`: Create a new contact. Performs a duplicate check on `{ workspaceId, phone }`.
    *   *Payload:* `{ name, phone, email, type, groupIds: [], info: {} }`

### Individual Contact API (`/api/workspace/[workspaceId]/contacts/[id]`)
*   `GET`: Fetch details including group relations.
*   `PATCH`: Update contact fields or relations (uses `connect`/`disconnect` mapping).
*   `DELETE`: Secure, workspace-scoped deletion.

### Group API (`/api/workspace/[workspaceId]/contacts/groups`)
*   `GET`: Fetch all groups with contact counts (`_count: { contacts: true }`).
*   `POST`: Create a new category/label.

---

## 4. Security & Encryption
Located at `src/lib/encryption.js`, this module uses `aes-256-cbc` for securing API credentials.

*   **Encryption Key:** Required in `.env` as `ENCRYPTION_KEY`.
*   **Logic:**
    1.  Generate a random 16-byte IV.
    2.  Cipher the data using the environment key.
    3.  Store as `iv:encryptedText` string in the database.
*   **Safe-guards:** Sensitive keys are never logged or exposed to the client.

---

## 5. UI/UX Design System
The "Devlomatix Aesthetic" is characterized by a high-performance, dark-mode first, glassmorphic look.

### Design Tokens
*   **Surface:** `bg-[#0a0a0a]/50` with `backdrop-blur-xl`.
*   **Borders:** `border-white/5` or `border-primary/20`.
*   **Classification Colors:**
    *   `CLIENT`: Emerald (`bg-emerald-500/10 text-emerald-400`)
    *   `LEAD`: Amber (`bg-amber-500/10 text-amber-400`)
    *   `CONTACT`: Blue (`bg-blue-500/10 text-blue-400`)

### Component Strategy
*   **HUD HUD Stats:** Dynamic summary cards at the top of pages for immediate insight.
*   **Universal Table:** A highly interactive data table with motion-enhanced rows (`framer-motion`).
*   **Batch Actions:** Integrated selection logic for bulk operations.

---

## 6. System Integrations
### Lead Discovery -> Vault Flow
1.  User runs a search in the **LeadFinder** (`/miscellaneous/leads`).
2.  Leads are exported via the `POST /api/workspace/[workspaceId]/miscellaneous/leads/save` endpoint.
3.  The API performs an `upsert` on the `Contact` model, setting `type: "LEAD"` and populating the `info` JSON field with scraped metadata (Rating, Reviews, etc.).

---

## 7. Critical File Map
*   `src/app/workspace/[workspaceId]/contact/page.jsx`: The main CRM command center.
*   `src/app/api/workspace/[workspaceId]/contacts/route.js`: Contact CRUD backend.
*   `src/lib/db.js`: Prisma client singleton.
*   `src/app/workspace/_components/AppSidebar.jsx`: Unified navigation logic.

---

## 8. Current Status & Verification
*   **Database:** Fully migrated with `workspaceId` support (`prisma db push` completed).
*   **UI:** Consolidated into a single `/contact` route with pre-filtered views for Clients.
*   **Security:** AES encryption is active for all platform credentials.

---

## 9. Activity Log (Session History)

### Session: 2026-04-10 (Unification & Context)
*   **Action:** Unified "Contacts" and "Clients" into a single Universal Vault.
*   **Infrastructure:** Executed `prisma db push` to synchronize `workspaceId` and `type` fields in the database.
*   **UI:** Built the premium Glassmorphic CRM dashboard at `/contact` and removed redundant `/client` routes.
*   **Protocol:** Established the "Agent Context Protocol" to ensure all future work is documented here.

---
*Generated by Antigravity AI for continuous project alignment.*
