import React from 'react';

import { ThemeProvider } from './_hooks/use-theme';
import { LanguageProvider } from './_hooks/use-language';

export const metadata = {
  title: 'KonnectX - WhatsApp Business API Platform',
  description: 'The complete WhatsApp Business API platform for modern businesses.',
};

export default function SolarBrightLayout({ children }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="konnectx-site min-h-screen relative overflow-x-hidden">
          {/* Root Container */}
          <div className="relative flex flex-col min-h-screen">
            {children}
          </div>
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}
