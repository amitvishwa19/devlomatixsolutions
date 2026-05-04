import { useState } from "react";
import { X, Settings, Shield } from "lucide-react";

const CookieBanner = () => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-4 flex justify-center">
      <div className="glass-card rounded-xl p-6 max-w-xl w-full mx-4 relative">
        <button
          onClick={() => setVisible(false)}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-start gap-3">
          <Shield className="w-8 h-8 text-gold flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-medium mb-1">We value your privacy 🍪</h3>
            <p className="text-sm text-muted-foreground mb-3">
              We use cookies to enhance your browsing experience, analyze site traffic, and
              personalize content. By clicking "Accept All", you consent to our use of cookies.
            </p>
            <div className="flex gap-2 flex-wrap">
              <button className="flex items-center gap-1 px-4 py-2 text-sm border border-border rounded-lg hover:bg-secondary transition-colors">
                <Settings className="w-3 h-3" /> Customize
              </button>
              <button
                onClick={() => setVisible(false)}
                className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-secondary transition-colors"
              >
                Reject All
              </button>
              <button
                onClick={() => setVisible(false)}
                className="flex items-center gap-1 px-4 py-2 text-sm gold-gradient text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
              >
                ✓ Accept All
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
