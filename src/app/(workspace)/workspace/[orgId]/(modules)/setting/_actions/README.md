# Data Flow Pattern - Server Actions

This document describes the standard pattern for saving data to the database using server actions, safe actions, and hooks.

---

## Architecture Overview

```
Component (Form) 
    ↓ 
useAction Hook 
    ↓ 
Server Action (action file) 
    ↓ 
createSafeAction (validation) 
    ↓ 
Prisma DB (Neon PostgreSQL)
```

---

## Database Schema

### GeneralSetting Table
Individual columns for each field (hospital info, localization, theme).

### Setting Table  
One JSON column per section:
- `appointments` - Appointment scheduling settings
- `billing` - Billing & subscription settings
- `departments` - Department list (JSON array)
- `integrations` - Third-party integrations
- `inventory` - Inventory management settings
- `invoice` - Invoice & tax settings
- `notifications` - Notification preferences
- `patients` - Patient settings
- `pharmacy` - Pharmacy settings
- `prescription` - Prescription settings
- `security` - Security & auth settings
- `services` - Services list (JSON array)
- `staff` - Staff list (JSON array)

---

## Form Field Mappings

### General Settings
```json
{
  "hospitalName": "string",
  "hospitalCode": "string",
  "contactEmail": "string",
  "contactPhone": "string",
  "website": "string",
  "timezone": "string",
  "language": "string",
  "dateFormat": "string",
  "timeFormat": "string"
}
```

### Appointments
```json
{
  "defaultDuration": "string",
  "bufferTime": "string",
  "advanceBookingLimit": "string",
  "cancellationNotice": "string",
  "openingTime": "string",
  "closingTime": "string",
  "allowWeekendAppointments": "boolean",
  "allowOnlineBooking": "boolean",
  "sendSmsReminders": "boolean",
  "sendEmailReminders": "boolean",
  "reminderTime": "string"
}
```

### Security
```json
{
  "minPasswordLength": "string",
  "passwordExpiry": "string",
  "requireUppercase": "boolean",
  "requireNumbers": "boolean",
  "requireSpecialChars": "boolean",
  "twoFactorAuth": "boolean",
  "sessionTimeout": "string",
  "failedLoginLockout": "string"
}
```

### Notifications
```json
{
  "emailAppointmentConfirmations": "boolean",
  "emailAppointmentReminders": "boolean",
  "emailInvoiceBilling": "boolean",
  "emailLabResults": "boolean",
  "smsAppointmentReminders": "boolean",
  "smsPrescriptionReady": "boolean",
  "smsPaymentConfirmations": "boolean",
  "inAppNewPatient": "boolean",
  "inAppEmergencyAlerts": "boolean",
  "inAppLowInventory": "boolean",
  "inAppScheduleChanges": "boolean",
  "quietHoursStart": "string",
  "quietHoursEnd": "string"
}
```

### Inventory
```json
{
  "skuPrefix": "string",
  "barcodeFormat": "string",
  "autoGenerateSku": "boolean",
  "trackSerialNumbers": "boolean",
  "trackBatchNumbers": "boolean",
  "stockValuationMethod": "string",
  "reorderPointCalculation": "string",
  "lowStockAlertThreshold": "number",
  "expiryAlertDays": "number",
  "dailyStockReport": "boolean",
  "autoReorderSuggestions": "boolean"
}
```

### Invoice
```json
{
  "invoicePrefix": "string",
  "nextInvoiceNumber": "number",
  "dueDatePeriod": "string",
  "currency": "string",
  "invoiceNotes": "string",
  "taxRate": "number",
  "taxId": "string",
  "includeTaxInPrice": "boolean",
  "showTaxBreakdown": "boolean",
  "acceptCash": "boolean",
  "acceptCard": "boolean",
  "acceptInsurance": "boolean",
  "allowPartialPayments": "boolean"
}
```

### Patients
```json
{
  "patientIdPrefix": "string",
  "idNumberLength": "string",
  "autoGenerateId": "boolean",
  "requirePhotoUpload": "boolean",
  "smsNotifications": "boolean",
  "recordRetentionPeriod": "string",
  "defaultBloodType": "string",
  "requireConsentForm": "boolean",
  "hipaaComplianceMode": "boolean"
}
```

### Pharmacy
```json
{
  "pharmacyName": "string",
  "licenseNumber": "string",
  "requirePrescriptionVerification": "boolean",
  "trackControlledSubstances": "boolean",
  "lowStockThreshold": "number",
  "criticalStockThreshold": "number",
  "emailLowStockAlerts": "boolean",
  "expiryDateAlerts": "boolean",
  "defaultDispensingUnit": "string",
  "printFormat": "string"
}
```

### Prescription
```json
{
  "prescriptionPrefix": "string",
  "defaultValidityPeriod": "string",
  "defaultInstructions": "string",
  "footerText": "string",
  "checkDrugInteractions": "boolean",
  "allergyWarnings": "boolean",
  "dosageValidation": "boolean",
  "requireDigitalSignature": "boolean",
  "paperSize": "string",
  "copies": "string"
}
```

### Integrations
```json
{
  "twilioSms": "boolean",
  "sendGridEmail": "boolean",
  "stripePayments": "boolean",
  "paypal": "boolean",
  "googleCalendar": "boolean",
  "microsoft365": "boolean",
  "slack": "boolean",
  "awsS3": "boolean"
}
```

### Departments (List)
```json
{
  "items": [
    {
      "id": "string",
      "name": "string",
      "code": "string",
      "head": "string",
      "beds": "number",
      "active": "boolean"
    }
  ]
}
```

### Services (List)
```json
{
  "items": [
    {
      "id": "string",
      "name": "string",
      "category": "string",
      "price": "number",
      "duration": "string",
      "active": "boolean"
    }
  ]
}
```

### Staff (List)
```json
{
  "items": [
    {
      "id": "string",
      "name": "string",
      "email": "string",
      "role": "string",
      "department": "string",
      "status": "string"
    }
  ]
}
```

---

## Usage in Components

```javascript
import { useAction } from "@/hooks/use-action";
import { upsertAppointmentsSetting } from "../_actions";

const { execute, isLoading } = useAction(upsertAppointmentsSetting, {
  onSuccess: (data) => {
    toast.success('Settings saved!');
  },
  onError: (error) => {
    toast.error('Failed to save');
  }
});

// On form submit
const onSubmit = (formData) => {
  execute({ userId: currentUserId, formData });
};
```

---

## File Structure

```
src/
├── hooks/
│   └── use-action.js
├── utils/
│   └── CreateSafeAction.js
├── lib/
│   └── db.js
├── _prisma/
│   ├── schema.prisma
│   └── README.md
└── components/
    └── settings/
        ├── _actions/
        │   ├── index.js
        │   ├── README.md
        │   ├── general.js
        │   ├── appointments.js
        │   ├── billing.js
        │   ├── departments.js
        │   ├── integrations.js
        │   ├── inventory.js
        │   ├── invoice.js
        │   ├── notifications.js
        │   ├── patients.js
        │   ├── pharmacy.js
        │   ├── prescription.js
        │   ├── security.js
        │   ├── services.js
        │   ├── staff.js
        │   └── dbseed.js
        └── sections/
            └── [section]/
                └── [Section]Settings.jsx
```
