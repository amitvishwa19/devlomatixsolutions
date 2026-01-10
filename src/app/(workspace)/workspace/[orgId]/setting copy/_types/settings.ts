import { z } from "zod";

// General Settings Schema
export const generalSettingsSchema = z.object({
  hospitalName: z
    .string()
    .trim()
    .min(2, "Hospital name must be at least 2 characters")
    .max(100, "Hospital name must be less than 100 characters"),
  hospitalCode: z
    .string()
    .trim()
    .min(3, "Hospital code must be at least 3 characters")
    .max(20, "Hospital code must be less than 20 characters")
    .regex(/^[A-Z0-9-]+$/, "Hospital code must contain only uppercase letters, numbers, and hyphens"),
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters"),
  phone: z
    .string()
    .trim()
    .min(10, "Phone number must be at least 10 digits")
    .max(20, "Phone number must be less than 20 digits")
    .regex(/^[+]?[\d\s-()]+$/, "Invalid phone number format"),
  address: z
    .string()
    .trim()
    .min(10, "Address must be at least 10 characters")
    .max(500, "Address must be less than 500 characters"),
  website: z
    .string()
    .trim()
    .url("Invalid website URL")
    .max(255, "Website URL must be less than 255 characters")
    .optional()
    .or(z.literal("")),
  timezone: z.string().min(1, "Timezone is required"),
  language: z.string().min(1, "Language is required"),
  dateFormat: z.string().min(1, "Date format is required"),
  timeFormat: z.enum(["12h", "24h"]),
  autoLogout: z.boolean(),
  maintenanceMode: z.boolean(),
  enableAnalytics: z.boolean(),
  // Advanced General Settings
  fiscalYearStart: z.string().min(1, "Fiscal year start is required"),
  bedCapacity: z.number().int().min(1).max(10000),
  emergencyCapacity: z.number().int().min(0).max(1000),
  operatingRooms: z.number().int().min(0).max(100),
  enableMultiBranch: z.boolean(),
  defaultBranch: z.string().optional(),
  enableDarkMode: z.boolean(),
  compactMode: z.boolean(),
  showWelcomeScreen: z.boolean(),
  enableKeyboardShortcuts: z.boolean(),
  autoSaveInterval: z.number().int().min(30).max(600),
  sessionWarningMinutes: z.number().int().min(1).max(30),
  maxConcurrentSessions: z.number().int().min(1).max(10),
  enableActivityLog: z.boolean(),
  dataRetentionDays: z.number().int().min(30).max(3650),
  enableBackup: z.boolean(),
  backupFrequency: z.enum(["hourly", "daily", "weekly", "monthly"]),
  backupRetentionDays: z.number().int().min(7).max(365),
  enableDisasterRecovery: z.boolean(),
  enableLoadBalancing: z.boolean(),
  enableCaching: z.boolean(),
  cacheExpiryMinutes: z.number().int().min(5).max(1440),
});

// Department Settings Schema
export const departmentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Department name must be at least 2 characters")
    .max(50, "Department name must be less than 50 characters"),
  code: z
    .string()
    .trim()
    .min(2, "Department code must be at least 2 characters")
    .max(10, "Department code must be less than 10 characters")
    .regex(/^[A-Z0-9]+$/, "Code must contain only uppercase letters and numbers"),
  headOfDepartment: z
    .string()
    .trim()
    .min(2, "Head of department name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  beds: z
    .number()
    .int("Beds must be a whole number")
    .min(0, "Beds cannot be negative")
    .max(1000, "Beds cannot exceed 1000"),
  floor: z
    .number()
    .int("Floor must be a whole number")
    .min(-5, "Floor cannot be less than -5")
    .max(100, "Floor cannot exceed 100"),
  extension: z
    .string()
    .trim()
    .max(10, "Extension must be less than 10 characters")
    .regex(/^[0-9]*$/, "Extension must contain only numbers")
    .optional()
    .or(z.literal("")),
  operatingHours: z.object({
    start: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
    end: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  }),
  active: z.boolean(),
  emergency: z.boolean(),
});

// Staff Settings Schema
export const staffSettingsSchema = z.object({
  defaultRole: z.string().min(1, "Default role is required"),
  maxShiftHours: z
    .number()
    .int("Shift hours must be a whole number")
    .min(4, "Minimum shift is 4 hours")
    .max(24, "Maximum shift is 24 hours"),
  minBreakMinutes: z
    .number()
    .int("Break time must be a whole number")
    .min(0, "Break time cannot be negative")
    .max(120, "Break time cannot exceed 120 minutes"),
  overtimeThreshold: z
    .number()
    .int("Overtime threshold must be a whole number")
    .min(20, "Minimum threshold is 20 hours")
    .max(60, "Maximum threshold is 60 hours"),
  requireApproval: z.boolean(),
  allowSelfSchedule: z.boolean(),
  breakReminder: z.boolean(),
  allowShiftSwap: z.boolean(),
  requireCertification: z.boolean(),
  trackAttendance: z.boolean(),
  enableOvertimeAlerts: z.boolean(),
  // Advanced Staff Settings
  enableBiometricAttendance: z.boolean(),
  enableGeolocationTracking: z.boolean(),
  maxConsecutiveShifts: z.number().int().min(1).max(14),
  minRestHoursBetweenShifts: z.number().int().min(6).max(24),
  enableOnCallScheduling: z.boolean(),
  onCallCompensationRate: z.number().min(1).max(5),
  enablePerformanceTracking: z.boolean(),
  performanceReviewFrequency: z.enum(["monthly", "quarterly", "biannual", "annual"]),
  enableSkillsMatrix: z.boolean(),
  enableTrainingManagement: z.boolean(),
  mandatoryTrainingHours: z.number().int().min(0).max(200),
  enableCredentialExpiry: z.boolean(),
  credentialExpiryWarningDays: z.number().int().min(7).max(90),
  enableTimeOffManagement: z.boolean(),
  maxVacationDays: z.number().int().min(0).max(60),
  maxSickDays: z.number().int().min(0).max(30),
  enableFlexTime: z.boolean(),
  enableRemoteWork: z.boolean(),
  requireManagerApproval: z.boolean(),
  enableStaffMessaging: z.boolean(),
  enableEmergencyContacts: z.boolean(),
  enablePayrollIntegration: z.boolean(),
  overtimeMultiplier: z.number().min(1).max(3),
  holidayMultiplier: z.number().min(1).max(4),
  enableUnionCompliance: z.boolean(),
});

// Appointment Settings Schema
export const appointmentSettingsSchema = z.object({
  slotDuration: z.enum(["15", "30", "45", "60"]),
  bufferTime: z.enum(["0", "5", "10", "15"]),
  maxAdvanceBookingDays: z
    .number()
    .int("Days must be a whole number")
    .min(1, "Minimum is 1 day")
    .max(365, "Maximum is 365 days"),
  minAdvanceBookingHours: z
    .number()
    .int("Hours must be a whole number")
    .min(0, "Cannot be negative")
    .max(168, "Maximum is 168 hours"),
  cancellationWindowHours: z
    .number()
    .int("Hours must be a whole number")
    .min(0, "Cannot be negative")
    .max(72, "Maximum is 72 hours"),
  reminderTime: z
    .number()
    .int("Hours must be a whole number")
    .min(1, "Minimum is 1 hour")
    .max(72, "Maximum is 72 hours"),
  allowOnlineBooking: z.boolean(),
  requireConfirmation: z.boolean(),
  autoReminder: z.boolean(),
  allowWalkIns: z.boolean(),
  enableWaitlist: z.boolean(),
  requireInsurance: z.boolean(),
  sendSmsReminders: z.boolean(),
  allowRescheduling: z.boolean(),
  // Advanced Appointment Settings
  enableRecurringAppointments: z.boolean(),
  maxRecurringInstances: z.number().int().min(1).max(52),
  enableGroupAppointments: z.boolean(),
  maxGroupSize: z.number().int().min(2).max(50),
  enableVirtualAppointments: z.boolean(),
  virtualPlatform: z.enum(["zoom", "teams", "webex", "custom"]),
  enableVideoRecording: z.boolean(),
  requirePreVisitQuestionnaire: z.boolean(),
  enableCheckInKiosk: z.boolean(),
  checkInWindowMinutes: z.number().int().min(5).max(60),
  enableNoShowTracking: z.boolean(),
  noShowFeeAmount: z.number().min(0).max(500),
  maxNoShowsBeforeBlock: z.number().int().min(1).max(10),
  enablePriorityScheduling: z.boolean(),
  enableUrgentSlots: z.boolean(),
  urgentSlotsPerDay: z.number().int().min(0).max(20),
  enableReferralRequired: z.boolean(),
  enablePreauthorization: z.boolean(),
  enableMultiProvider: z.boolean(),
  enableResourceBooking: z.boolean(),
  enableWaitTimeTracking: z.boolean(),
  targetWaitTimeMinutes: z.number().int().min(5).max(60),
  enablePatientFeedback: z.boolean(),
  feedbackReminderHours: z.number().int().min(1).max(72),
  enableAppointmentNotes: z.boolean(),
  requireReasonForVisit: z.boolean(),
});

// Notification Settings Schema
export const notificationSettingsSchema = z.object({
  emailAlerts: z.boolean(),
  smsAlerts: z.boolean(),
  pushNotifications: z.boolean(),
  emergencyAlerts: z.boolean(),
  appointmentReminders: z.boolean(),
  reportReady: z.boolean(),
  staffUpdates: z.boolean(),
  systemMaintenance: z.boolean(),
  patientDischarge: z.boolean(),
  labResults: z.boolean(),
  prescriptionAlerts: z.boolean(),
  billingNotifications: z.boolean(),
  inventoryAlerts: z.boolean(),
  quietHoursEnabled: z.boolean(),
  quietHoursStart: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  quietHoursEnd: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  emailDigestFrequency: z.enum(["realtime", "hourly", "daily", "weekly"]),
  // Advanced Notification Settings
  enableCriticalAlerts: z.boolean(),
  criticalAlertSound: z.boolean(),
  criticalAlertVibration: z.boolean(),
  enableCodeBlueAlerts: z.boolean(),
  enableRapidResponseAlerts: z.boolean(),
  enableSecurityAlerts: z.boolean(),
  enableFireAlerts: z.boolean(),
  enableEvacuationAlerts: z.boolean(),
  enableBedAvailability: z.boolean(),
  enableORScheduleChanges: z.boolean(),
  enableVitalSignAlerts: z.boolean(),
  vitalAlertThresholdHeart: z.number().int().min(40).max(200),
  vitalAlertThresholdBP: z.number().int().min(60).max(200),
  vitalAlertThresholdO2: z.number().int().min(80).max(100),
  enableMedicationDueAlerts: z.boolean(),
  medicationAlertLeadMinutes: z.number().int().min(5).max(60),
  enableLabCriticalValues: z.boolean(),
  enableRadiologyResults: z.boolean(),
  enablePathologyResults: z.boolean(),
  enableConsultRequests: z.boolean(),
  enableDischargeReadiness: z.boolean(),
  enableBedTurnaround: z.boolean(),
  enableStaffShortage: z.boolean(),
  enableEquipmentMalfunction: z.boolean(),
  enableComplianceDeadlines: z.boolean(),
  enableExpirationAlerts: z.boolean(),
  enableBudgetAlerts: z.boolean(),
  budgetAlertThreshold: z.number().min(50).max(100),
  enableEscalation: z.boolean(),
  escalationDelayMinutes: z.number().int().min(5).max(60),
  maxEscalationLevels: z.number().int().min(1).max(5),
});

// Security Settings Schema
export const securitySettingsSchema = z.object({
  twoFactor: z.boolean(),
  sessionTimeout: z.enum(["15", "30", "60", "120"]),
  passwordExpiry: z.enum(["30", "60", "90", "never"]),
  minPasswordLength: z
    .number()
    .int("Password length must be a whole number")
    .min(8, "Minimum password length is 8")
    .max(32, "Maximum password length is 32"),
  requireSpecialChars: z.boolean(),
  requireNumbers: z.boolean(),
  requireUppercase: z.boolean(),
  ipWhitelist: z.boolean(),
  auditLog: z.boolean(),
  failedLoginAttempts: z
    .number()
    .int("Attempts must be a whole number")
    .min(3, "Minimum is 3 attempts")
    .max(10, "Maximum is 10 attempts"),
  lockoutDuration: z
    .number()
    .int("Duration must be a whole number")
    .min(5, "Minimum is 5 minutes")
    .max(60, "Maximum is 60 minutes"),
  enforceDeviceLimit: z.boolean(),
  maxDevices: z
    .number()
    .int("Device count must be a whole number")
    .min(1, "Minimum is 1 device")
    .max(10, "Maximum is 10 devices"),
  requireVpn: z.boolean(),
  encryptBackups: z.boolean(),
  // Advanced Security Settings
  enableSSOIntegration: z.boolean(),
  ssoProvider: z.enum(["azure", "okta", "google", "saml", "none"]),
  enableLDAP: z.boolean(),
  enableBiometricLogin: z.boolean(),
  biometricTypes: z.array(z.enum(["fingerprint", "facial", "iris"])),
  enableSmartCardAuth: z.boolean(),
  enableRoleBasedAccess: z.boolean(),
  enableAttributeBasedAccess: z.boolean(),
  enableDataMasking: z.boolean(),
  maskingSensitivity: z.enum(["low", "medium", "high"]),
  enableFieldLevelEncryption: z.boolean(),
  enableTransitEncryption: z.boolean(),
  encryptionAlgorithm: z.enum(["AES-256", "RSA-4096", "ChaCha20"]),
  enableDLPPolicies: z.boolean(),
  enableWatermarking: z.boolean(),
  enableScreenCapturePrevention: z.boolean(),
  enableClipboardControl: z.boolean(),
  enableUSBControl: z.boolean(),
  enablePrintControl: z.boolean(),
  enableGeoFencing: z.boolean(),
  allowedCountries: z.array(z.string()),
  enableTimeBasedAccess: z.boolean(),
  accessWindowStart: z.string(),
  accessWindowEnd: z.string(),
  enableBreakGlass: z.boolean(),
  breakGlassApprovers: z.number().int().min(1).max(5),
  enableThreatDetection: z.boolean(),
  enableAnomalyDetection: z.boolean(),
  anomalyAlertThreshold: z.number().min(0.5).max(1),
  enablePenetrationTesting: z.boolean(),
  penTestFrequency: z.enum(["monthly", "quarterly", "biannual", "annual"]),
  enableVulnerabilityScanning: z.boolean(),
  vulnScanFrequency: z.enum(["daily", "weekly", "monthly"]),
  enableComplianceMonitoring: z.boolean(),
  complianceFrameworks: z.array(z.enum(["HIPAA", "HITRUST", "SOC2", "ISO27001", "GDPR"])),
  enableIncidentResponse: z.boolean(),
  incidentResponseSLA: z.number().int().min(15).max(240),
  enableForensicLogging: z.boolean(),
  logRetentionYears: z.number().int().min(1).max(10),
});

// Billing Settings Schema
export const billingSettingsSchema = z.object({
  currency: z.string().min(1, "Currency is required"),
  taxRate: z
    .number()
    .min(0, "Tax rate cannot be negative")
    .max(100, "Tax rate cannot exceed 100%"),
  invoicePrefix: z
    .string()
    .trim()
    .min(1, "Invoice prefix is required")
    .max(10, "Invoice prefix must be less than 10 characters")
    .regex(/^[A-Z0-9-]+$/, "Prefix must contain only uppercase letters, numbers, and hyphens"),
  paymentTermsDays: z
    .number()
    .int("Days must be a whole number")
    .min(0, "Cannot be negative")
    .max(90, "Maximum is 90 days"),
  lateFeePercentage: z
    .number()
    .min(0, "Cannot be negative")
    .max(25, "Maximum is 25%"),
  autoInvoice: z.boolean(),
  insuranceIntegration: z.boolean(),
  paymentReminders: z.boolean(),
  taxCalculation: z.boolean(),
  allowPartialPayments: z.boolean(),
  enableDiscounts: z.boolean(),
  maxDiscountPercentage: z
    .number()
    .min(0, "Cannot be negative")
    .max(100, "Maximum is 100%"),
  requirePrepayment: z.boolean(),
  enableInstallments: z.boolean(),
  sendReceiptEmail: z.boolean(),
  // Advanced Billing Settings
  enableRealTimeEligibility: z.boolean(),
  enablePreAuthorization: z.boolean(),
  enableClaimsScrubbing: z.boolean(),
  enableDenialManagement: z.boolean(),
  denialFollowUpDays: z.number().int().min(1).max(90),
  enableElectronicRemittance: z.boolean(),
  enablePatientStatements: z.boolean(),
  statementFrequency: z.enum(["weekly", "biweekly", "monthly"]),
  enableCollectionAgency: z.boolean(),
  collectionThresholdDays: z.number().int().min(30).max(180),
  collectionMinimumAmount: z.number().min(0).max(10000),
  enableCharityProgram: z.boolean(),
  charityIncomeThreshold: z.number().min(0).max(500),
  enableSlidingFeeScale: z.boolean(),
  enablePriceTransparency: z.boolean(),
  enableGoodFaithEstimates: z.boolean(),
  enableSurpriseActCompliance: z.boolean(),
  enableBundledPayments: z.boolean(),
  enableValueBasedContracts: z.boolean(),
  enableCapitation: z.boolean(),
  enableRiskAdjustment: z.boolean(),
  enableCostAccounting: z.boolean(),
  enableProfitabilityAnalysis: z.boolean(),
  enableRevenueForecasting: z.boolean(),
  enableContractModeling: z.boolean(),
  enablePayerScorecard: z.boolean(),
  enableCreditCardOnFile: z.boolean(),
  enableRecurringPayments: z.boolean(),
  enablePaymentPlans: z.boolean(),
  maxPaymentPlanMonths: z.number().int().min(3).max(60),
  minPaymentPlanAmount: z.number().min(25).max(500),
  enableACHPayments: z.boolean(),
  enableDigitalWallets: z.boolean(),
  enableCryptocurrency: z.boolean(),
});

// Integration Settings Schema
export const integrationSchema = z.object({
  id: z.string(),
  name: z.string(),
  apiKey: z
    .string()
    .trim()
    .max(255, "API key must be less than 255 characters")
    .optional()
    .or(z.literal("")),
  webhookUrl: z
    .string()
    .trim()
    .url("Invalid webhook URL")
    .max(500, "Webhook URL must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  enabled: z.boolean(),
  syncFrequency: z.enum(["realtime", "hourly", "daily"]).optional(),
});

// Patient Settings Schema
export const patientSettingsSchema = z.object({
  requireIdVerification: z.boolean(),
  autoAssignPatientId: z.boolean(),
  patientIdPrefix: z
    .string()
    .trim()
    .min(1, "Patient ID prefix is required")
    .max(10, "Prefix must be less than 10 characters")
    .regex(/^[A-Z0-9]+$/, "Prefix must contain only uppercase letters and numbers"),
  retentionYears: z
    .number()
    .int("Years must be a whole number")
    .min(5, "Minimum retention is 5 years")
    .max(100, "Maximum retention is 100 years"),
  enablePatientPortal: z.boolean(),
  allowOnlinePayments: z.boolean(),
  requireEmergencyContact: z.boolean(),
  enableMedicalHistory: z.boolean(),
  hipaaCompliance: z.boolean(),
  consentRequired: z.boolean(),
  photoRequired: z.boolean(),
  allowDataExport: z.boolean(),
  // Advanced Patient Settings
  enablePatientMatching: z.boolean(),
  matchingAlgorithm: z.enum(["probabilistic", "deterministic", "hybrid"]),
  matchingThreshold: z.number().min(0.7).max(1),
  enableMasterPatientIndex: z.boolean(),
  enableDuplicateDetection: z.boolean(),
  enablePatientMerge: z.boolean(),
  enableFamilyAccounts: z.boolean(),
  maxFamilyMembers: z.number().int().min(2).max(20),
  enableProxyAccess: z.boolean(),
  enableMinorConsent: z.boolean(),
  minorConsentAge: z.number().int().min(12).max(18),
  enableAdvanceDirectives: z.boolean(),
  enableOrganDonorRegistry: z.boolean(),
  enableHealthcareProxy: z.boolean(),
  enablePatientPreferences: z.boolean(),
  enableCulturalPreferences: z.boolean(),
  enableLanguagePreferences: z.boolean(),
  enableAccessibilityNeeds: z.boolean(),
  enableAllergyManagement: z.boolean(),
  allergyVerificationRequired: z.boolean(),
  enableImmunizationTracking: z.boolean(),
  enableGrowthCharts: z.boolean(),
  enablePreventiveCare: z.boolean(),
  preventiveCareReminders: z.boolean(),
  enableChronicCareManagement: z.boolean(),
  enableRemotePatientMonitoring: z.boolean(),
  enablePatientEducation: z.boolean(),
  enableCareTransitions: z.boolean(),
  enablePatientNavigation: z.boolean(),
  enableSocialDeterminants: z.boolean(),
  enableRiskStratification: z.boolean(),
  riskAssessmentFrequency: z.enum(["admission", "monthly", "quarterly", "annual"]),
  enablePatientSatisfaction: z.boolean(),
  surveyFrequency: z.enum(["post-visit", "weekly", "monthly", "quarterly"]),
  enablePatientReporting: z.boolean(),
  enablePopulationHealth: z.boolean(),
});

// Pharmacy Settings Schema
export const pharmacySettingsSchema = z.object({
  enablePrescriptions: z.boolean(),
  requireDoctorApproval: z.boolean(),
  lowStockThreshold: z
    .number()
    .int("Threshold must be a whole number")
    .min(1, "Minimum is 1")
    .max(1000, "Maximum is 1000"),
  expiryWarningDays: z
    .number()
    .int("Days must be a whole number")
    .min(7, "Minimum is 7 days")
    .max(180, "Maximum is 180 days"),
  enableControlledSubstances: z.boolean(),
  requireWitness: z.boolean(),
  enableRefills: z.boolean(),
  maxRefills: z
    .number()
    .int("Refills must be a whole number")
    .min(0, "Cannot be negative")
    .max(12, "Maximum is 12 refills"),
  enableDrugInteractionCheck: z.boolean(),
  enableGenericSubstitution: z.boolean(),
  // Advanced Pharmacy Settings
  enableBarcodeScan: z.boolean(),
  enableNDCValidation: z.boolean(),
  enableLotTracking: z.boolean(),
  enableSerialTracking: z.boolean(),
  enableColdChainMonitoring: z.boolean(),
  coldChainAlertThreshold: z.number().min(-80).max(8),
  enableCompounding: z.boolean(),
  requireCompoundingLog: z.boolean(),
  enable340BCompliance: z.boolean(),
  enableWACPricing: z.boolean(),
  enableAWPTracking: z.boolean(),
  enableGPOIntegration: z.boolean(),
  enablePBMIntegration: z.boolean(),
  enableePrescribing: z.boolean(),
  enableEPCSCompliance: z.boolean(),
  enableControlledSubstanceReporting: z.boolean(),
  reportingFrequency: z.enum(["daily", "weekly", "monthly"]),
  enablePatientCounseling: z.boolean(),
  counselingDocumentation: z.boolean(),
  enableMTMServices: z.boolean(),
  enableMedicationReconciliation: z.boolean(),
  enableAdherenceTracking: z.boolean(),
  adherenceThreshold: z.number().min(0.5).max(1),
  enablePatientAssistancePrograms: z.boolean(),
  enableCopayAssistance: z.boolean(),
  enableAutomatedDispensing: z.boolean(),
  enableRobotIntegration: z.boolean(),
  enablePneumaticTube: z.boolean(),
  enableUnitDose: z.boolean(),
  enableMultiDose: z.boolean(),
  enableIVAdmixture: z.boolean(),
  enableTPNCompounding: z.boolean(),
  enableChemotherapy: z.boolean(),
  requireChemoVerification: z.boolean(),
  enableHazardousDrug: z.boolean(),
  enableUSP797Compliance: z.boolean(),
  enableUSP800Compliance: z.boolean(),
  enableBeyondUseDate: z.boolean(),
  defaultBeyondUseDays: z.number().int().min(1).max(180),
  enableReturnsManagement: z.boolean(),
  enableReverseDistribution: z.boolean(),
  enableDrugRecall: z.boolean(),
  recallNotificationMethod: z.enum(["email", "sms", "both"]),
});

export type GeneralSettings = z.infer<typeof generalSettingsSchema>;
export type Department = z.infer<typeof departmentSchema>;
export type StaffSettings = z.infer<typeof staffSettingsSchema>;
export type AppointmentSettings = z.infer<typeof appointmentSettingsSchema>;
export type NotificationSettings = z.infer<typeof notificationSettingsSchema>;
export type SecuritySettings = z.infer<typeof securitySettingsSchema>;
export type BillingSettings = z.infer<typeof billingSettingsSchema>;
export type Integration = z.infer<typeof integrationSchema>;
export type PatientSettings = z.infer<typeof patientSettingsSchema>;
export type PharmacySettings = z.infer<typeof pharmacySettingsSchema>;
