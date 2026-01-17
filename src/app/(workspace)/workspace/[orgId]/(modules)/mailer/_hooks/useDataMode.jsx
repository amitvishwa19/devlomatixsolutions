import { createContext, useContext, useState, useEffect } from 'react';

const DataModeContext = createContext(undefined);

export function DataModeProvider({ children }) {
  const [isLiveMode, setIsLiveMode] = useState(() => {
    const saved = localStorage.getItem('mailbox-data-mode');
    return saved === 'live';
  });

  useEffect(() => {
    localStorage.setItem('mailbox-data-mode', isLiveMode ? 'live' : 'local');
  }, [isLiveMode]);

  const toggleMode = () => {
    setIsLiveMode(prev => !prev);
  };

  return (
    <DataModeContext.Provider value={{ isLiveMode, toggleMode }}>
      {children}
    </DataModeContext.Provider>
  );
}

export function useDataMode() {
  const context = useContext(DataModeContext);
  if (context === undefined) {
    throw new Error('useDataMode must be used within a DataModeProvider');
  }
  return context;
}
