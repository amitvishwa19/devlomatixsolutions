'use client';

import { useState } from 'react';
import { 
 Dialog, 
 DialogContent, 
 DialogHeader, 
 DialogTitle,
 DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useModal } from "@/hooks/useModal";
import axios from "@/utils/axios";
import { toast } from "sonner";
import { 
 Loader2, 
 Share2, 
 Link as LinkIcon,
 Shield,
 Facebook,
 Linkedin,
 Twitter,
 MessageCircle,
 Key
} from "lucide-react";

export const AddSocialAccountModal = () => {
 const { isOpen, onClose, type, data, activeModals } = useModal();
 const isModalOpen = !!activeModals["addSocialAccount"];
 const modalData = activeModals["addSocialAccount"] || {};
 const { workspaceId, onApply } = modalData;

 const [isLoading, setIsLoading] = useState(false);
 
  // Form States
  const [platform, setPlatform] = useState('FACEBOOK');
  const [accessToken, setAccessToken] = useState('');
  const [profileName, setProfileName] = useState('');
  const [profileId, setProfileId] = useState('');
  const [pageId, setPageId] = useState(''); // New state for Facebook Page ID

  const onSubmit = async (e) => {
  e.preventDefault();
  if (!accessToken || !platform) {
  toast.error("Please provide a platform and access token");
  return;
  }

  setIsLoading(true);
  try {
  // CRITICAL FIX: The backend expects 'credentials' object to store tokens
  const payload = {
  platform,
  profile: profileName || `${platform} Account`,
  status: 'connected',
  credentials: {
      accessToken,
      ...(platform === 'FACEBOOK' && pageId ? { pageId } : {}),
      profileId: profileId || `manual_${Date.now()}`
  }
  };

  await axios.post(`/api/workspace/${workspaceId}/social/accounts`, payload);
  toast.success(`${platform} account linked successfully`);
  onApply?.();
  handleClose();
  } catch (error) {
  console.error(error);
  toast.error("Failed to link social account");
  } finally {
  setIsLoading(false);
  }
  };

  const handleClose = () => {
  setAccessToken('');
  setProfileName('');
  setProfileId('');
  setPageId('');
  onClose("addSocialAccount");
  };

  const platforms = [
  { id: 'FACEBOOK', name: 'Facebook', icon: Facebook, color: 'text-blue-600' },
  { id: 'LINKEDIN', name: 'LinkedIn', icon: Linkedin, color: 'text-blue-700' },
  { id: 'TWITTER', name: 'Twitter', icon: Twitter, color: 'text-sky-500' },
  { id: 'WHATSAPP', name: 'WhatsApp', icon: MessageCircle, color: 'text-emerald-500' }
  ];

  return (
  <Dialog open={isModalOpen} onOpenChange={handleClose}>
  <DialogContent className="sm:max-w-md bg-background border border-border/100 rounded-lg shadow-2xl p-0 overflow-hidden font-sans">
  <form onSubmit={onSubmit} className="flex flex-col">
  <DialogHeader className="p-8 pb-4">
  <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-2 uppercase tracking-tight">
  <LinkIcon className="text-primary h-6 w-6" /> Connect Account
  </DialogTitle>
  </DialogHeader>

  <div className="p-8 pt-0 space-y-6">
  <div className="p-4 bg-primary/5 border border-primary/10 rounded-md flex items-start gap-3">
  <Shield className="text-primary h-5 w-5 mt-0.5 shrink-0" />
  <p className="text-[10px] font-bold text-muted-foreground leading-relaxed text-left uppercase">
  This is a <span className="text-primary font-bold">manual connection</span> for development. In production, we would use OAuth flows to securely retrieve these tokens.
  </p>
  </div>

  {/* Platform Select */}
  <div className="space-y-3 text-left">
  <label className="text-[10px] font-bold text-muted-foreground opacity-70 ml-1 uppercase">Platform</label>
  <div className="grid grid-cols-2 gap-2">
  {platforms.map((p) => (
  <button
  key={p.id}
  type="button"
  onClick={() => setPlatform(p.id)}
  className={`
  flex items-center gap-3 px-4 py-3 rounded-md border-2 transition-all duration-300
  ${platform === p.id 
  ? 'border-primary bg-primary/10 text-primary shadow-lg shadow-primary/10' 
  : 'border-border/10 bg-muted/20 text-muted-foreground hover:border-border/30'}
  `}
  >
  <p.icon size={16} className={platform === p.id ? 'text-primary' : p.color} />
  <span className="text-[10px] font-bold">{p.name}</span>
  </button>
  ))}
  </div>
  </div>

  {/* Connection Details */}
  <div className="space-y-4 text-left">
  <div className="space-y-2">
  <label className="text-[10px] font-bold text-muted-foreground opacity-70 ml-1 uppercase">Access Token</label>
  <div className="relative">
  <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
  <Input
  disabled={isLoading}
  placeholder="Paste your API token here..."
  value={accessToken}
  onChange={(e) => setAccessToken(e.target.value)}
  className="pl-12 bg-muted/30 border-none rounded-md focus-visible:ring-1 focus-visible:ring-primary shadow-inner h-12 text-[10px]"
  />
  </div>
  </div>

  {platform === 'FACEBOOK' && (
      <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
          <label className="text-[10px] font-bold text-muted-foreground opacity-70 ml-1 uppercase">Page ID (Required for Pages)</label>
          <div className="relative">
              <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                  disabled={isLoading}
                  placeholder="e.g. 1029384756..."
                  value={pageId}
                  onChange={(e) => setPageId(e.target.value)}
                  className="pl-12 bg-muted/50 border-primary/10 border-2 rounded-md focus-visible:ring-1 focus-visible:ring-primary shadow-inner h-12 text-[10px] font-black"
              />
          </div>
      </div>
  )}

  <div className="grid grid-cols-1 gap-4">
      <div className="space-y-2">
      <label className="text-[10px] font-bold text-muted-foreground opacity-70 ml-1 uppercase">Profile Name (Display Only)</label>
      <Input
      disabled={isLoading}
      placeholder="e.g. Acme Corp Official"
      value={profileName}
      onChange={(e) => setProfileName(e.target.value)}
      className="bg-muted/30 border-none rounded-md focus-visible:ring-1 focus-visible:ring-primary shadow-inner h-12 text-[10px]"
      />
      </div>
  </div>
  </div>
  </div>

  <DialogFooter className="p-8 bg-muted/10 border-t border-border/10">
  <Button
  type="button"
  variant="ghost"
  onClick={handleClose}
  className="rounded-md font-bold text-muted-foreground uppercase text-[10px]"
  >
  Cancel
  </Button>
  <Button
  type="submit"
  disabled={isLoading}
  className="bg-primary hover:bg-primary/90 min-w-[140px] rounded-md font-black uppercase text-[10px] shadow-lg shadow-primary/20"
  >
  {isLoading ? (
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  ) : "Connect Account"}
  </Button>
  </DialogFooter>
  </form>
  </DialogContent>
  </Dialog>
 );
};
