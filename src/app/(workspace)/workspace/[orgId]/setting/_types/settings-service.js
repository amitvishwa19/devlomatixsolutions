import {
  generalSettingsSchema,
  departmentSchema,
  staffSettingsSchema,
  appointmentSettingsSchema,
  notificationSettingsSchema,
  securitySettingsSchema,
  billingSettingsSchema,
  integrationSchema,
  patientSettingsSchema,
  pharmacySettingsSchema,
} from "./validations/settings";

// Schema mapping for validation
const schemaMap = {
  GENERAL: generalSettingsSchema,
  DEPARTMENT: departmentSchema,
  STAFF: staffSettingsSchema,
  APPOINTMENT: appointmentSettingsSchema,
  NOTIFICATION: notificationSettingsSchema,
  SECURITY: securitySettingsSchema,
  BILLING: billingSettingsSchema,
  INTEGRATION: integrationSchema,
  PATIENT: patientSettingsSchema,
  PHARMACY: pharmacySettingsSchema,
};

const STORAGE_KEY = "app_settings";

// Generate a unique ID
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Get all settings from storage
const getAllSettings = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

// Save all settings to storage
const saveAllSettings = (settings) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
};

// Validate settings data against schema
export const validateSettings = (category, data) => {
  const schema = schemaMap[category];
  if (!schema) {
    return { success: true, data: data };
  }
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
};

// Create or update settings
export const upsertSettings = async (userId, category, settingsData) => {
  // Validate data
  const validation = validateSettings(category, settingsData);
  if (validation.success === false) {
    throw new Error(`Validation failed: ${validation.error.errors.map(e => e.message).join(", ")}`);
  }

  const allSettings = getAllSettings();
  const existingIndex = allSettings.findIndex(
    (s) => s.userId === userId && s.category === category
  );

  const now = new Date().toISOString();

  if (existingIndex >= 0) {
    // Update existing
    allSettings[existingIndex] = {
      ...allSettings[existingIndex],
      settings: validation.data,
      updatedAt: now,
    };
    saveAllSettings(allSettings);
    return allSettings[existingIndex];
  } else {
    // Create new
    const newRecord = {
      id: generateId(),
      userId,
      category,
      settings: validation.data,
      createdAt: now,
      updatedAt: now,
    };
    allSettings.push(newRecord);
    saveAllSettings(allSettings);
    return newRecord;
  }
};

// Get settings by category
export const getSettings = async (userId, category) => {
  const allSettings = getAllSettings();
  return allSettings.find(
    (s) => s.userId === userId && s.category === category
  ) || null;
};

// Get all settings for a user
export const getAllUserSettings = async (userId) => {
  const allSettings = getAllSettings();
  return allSettings.filter((s) => s.userId === userId);
};

// Delete settings by category
export const deleteSettings = async (userId, category) => {
  const allSettings = getAllSettings();
  const filteredSettings = allSettings.filter(
    (s) => !(s.userId === userId && s.category === category)
  );
  
  if (filteredSettings.length === allSettings.length) {
    return false;
  }
  
  saveAllSettings(filteredSettings);
  return true;
};

// Delete all settings for a user
export const deleteAllUserSettings = async (userId) => {
  const allSettings = getAllSettings();
  const filteredSettings = allSettings.filter((s) => s.userId !== userId);
  saveAllSettings(filteredSettings);
};
