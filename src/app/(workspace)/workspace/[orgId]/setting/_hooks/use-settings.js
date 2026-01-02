import { useState, useCallback } from "react";
import { toast } from "sonner";
import {
  upsertSettings,
  getSettings,
  getAllUserSettings,
  deleteSettings,
} from "@/lib/settings-service";

// Mock user ID - replace with actual auth when available
const MOCK_USER_ID = "user-1";

export const useSettings = (category) => {
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState(null);

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getSettings(MOCK_USER_ID, category);
      setSettings(data);
      return data;
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      toast.error("Failed to load settings");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [category]);

  const saveSettings = useCallback(
    async (data) => {
      setIsLoading(true);
      try {
        const saved = await upsertSettings(MOCK_USER_ID, category, data);
        setSettings(saved);
        toast.success("Settings saved successfully");
        return saved;
      } catch (error) {
        console.error("Failed to save settings:", error);
        toast.error(error instanceof Error ? error.message : "Failed to save settings");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [category]
  );

  const removeSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      await deleteSettings(MOCK_USER_ID, category);
      setSettings(null);
      toast.success("Settings deleted successfully");
      return true;
    } catch (error) {
      console.error("Failed to delete settings:", error);
      toast.error("Failed to delete settings");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [category]);

  return {
    settings,
    isLoading,
    fetchSettings,
    saveSettings,
    removeSettings,
  };
};

export const useAllSettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [allSettings, setAllSettings] = useState([]);

  const fetchAllSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAllUserSettings(MOCK_USER_ID);
      setAllSettings(data);
      return data;
    } catch (error) {
      console.error("Failed to fetch all settings:", error);
      toast.error("Failed to load settings");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    allSettings,
    isLoading,
    fetchAllSettings,
  };
};
