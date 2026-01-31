import * as React from 'react';

/**
 * Custom hook for localStorage persistence with mock data initialization
 * @param {string} key - The localStorage key
 * @param {*} initialValue - Initial value (used if localStorage is empty)
 * @returns {[*, function, function]} - [storedValue, setValue, removeValue]
 */
export function useLocalStorage(key, initialValue) {
  // Handle function initializers (lazy initialization)
  const getInitialValue = () => {
    return typeof initialValue === 'function' ? initialValue() : initialValue;
  };

  // Initialize state with a function to read from localStorage
  const [storedValue, setStoredValue] = React.useState(() => {
    if (typeof window === 'undefined') {
      return getInitialValue();
    }

    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item, dateReviver);
        // Validate that parsed value is an array if initial value is an array
        const initial = getInitialValue();
        if (Array.isArray(initial) && !Array.isArray(parsed)) {
          // Data is corrupted, return fresh initial value
          window.localStorage.removeItem(key);
          return initial;
        }
        return parsed;
      }
      return getInitialValue();
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return getInitialValue();
    }
  });

  // Return a wrapped version of useState's setter function that persists to localStorage
  const setValue = React.useCallback(
    (value) => {
      try {
        // Allow value to be a function for same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Remove from localStorage
  const removeValue = React.useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
      const initial = typeof initialValue === 'function' ? initialValue() : initialValue;
      setStoredValue(initial);
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Listen for changes in other tabs/windows
  React.useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === key && event.newValue !== null) {
        setStoredValue(JSON.parse(event.newValue, dateReviver));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue, removeValue];
}

/**
 * JSON reviver function to parse date strings back to Date objects
 */
function dateReviver(key, value) {
  // ISO 8601 date string pattern
  const datePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
  
  if (typeof value === 'string' && datePattern.test(value)) {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  return value;
}

/**
 * Clear all app-related localStorage data
 */
export function clearAllLocalStorage() {
  const keys = [
    'hms_patients',
    'hms_appointments',
    'hms_prescriptions',
    'hms_categories',
    'hms_tags',
    'hms_opd_patients',
    'hms_ipd_patients',
    'hms_waitlist',
    'hms_doctor_schedules',
  ];
  
  keys.forEach(key => {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  });
}

/**
 * Check if localStorage has been initialized with mock data
 */
export function isLocalStorageInitialized(key) {
  try {
    return window.localStorage.getItem(key) !== null;
  } catch {
    return false;
  }
}
