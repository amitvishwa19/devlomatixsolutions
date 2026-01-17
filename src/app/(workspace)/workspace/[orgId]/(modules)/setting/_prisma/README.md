# Prisma Schema Documentation

## Overview

This folder contains the Prisma schema for the application database (Neon PostgreSQL).

## Models

### 1. GeneralSetting

Stores general/hospital settings with individual columns for each field.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| userId | String | User identifier |
| hospitalName | String | Hospital name |
| hospitalCode | String | Hospital code |
| contactEmail | String | Contact email |
| contactPhone | String | Contact phone |
| website | String | Website URL |
| address | String | Physical address |
| logo | String | Logo URL |
| timezone | String | Timezone (default: UTC) |
| language | String | Language (default: en) |
| dateFormat | String | Date format |
| timeFormat | String | Time format (12h/24h) |
| currency | String | Currency code |
| theme | String | UI theme |

### 2. Setting

Stores all other settings as JSON data, differentiated by `type`.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| userId | String | User identifier |
| type | String | Section type |
| data | JSON | All settings data |

#### Setting Types:
- `appointments` - Appointment scheduling settings
- `billing` - Billing & subscription settings
- `departments` - Department configurations
- `integrations` - Third-party integrations
- `inventory` - Inventory management settings
- `invoice` - Invoice settings
- `notifications` - Notification preferences
- `patients` - Patient settings
- `pharmacy` - Pharmacy settings
- `prescription` - Prescription settings
- `security` - Security & auth settings
- `services` - Medical services
- `staff` - Staff management

## JSON Data Structure Examples

### Appointments Setting
```json
{
  "defaultDuration": "30",
  "bufferTime": "15",
  "maxAdvanceBooking": "30",
  "allowSameDayBooking": true,
  "workingHoursStart": "09:00",
  "workingHoursEnd": "17:00",
  "workingDays": ["mon", "tue", "wed", "thu", "fri"],
  "emailReminder": true,
  "smsReminder": false,
  "reminderTime": "24"
}
```

### Security Setting
```json
{
  "minPasswordLength": "8",
  "passwordExpiry": "90",
  "requireUppercase": true,
  "requireNumbers": true,
  "requireSpecialChars": true,
  "twoFactorAuth": false,
  "sessionTimeout": "30",
  "lockoutAttempts": "5"
}
```

## Setup Commands

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database (development)
npx prisma db push

# Create migration (production)
npx prisma migrate dev --name init

# View database in Prisma Studio
npx prisma studio
```

## Environment Variables

Required in `.env`:
```
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
```
