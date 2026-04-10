import { Mail, Globe, Phone } from 'lucide-react';
import logo from '@/assets/images/logo/logo.png';

export function QuotationHeader({ companyInfo }) {
  const logoSrc = companyInfo.customLogo || logo.src;

  return (
    <div className="quotation-header flex justify-between items-center gap-4">
      <div className="flex items-center gap-3">
        <img src={logoSrc} alt={companyInfo.name} className="h-10 w-auto object-contain" />
      </div>
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-primary" />
          <span>{companyInfo.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" />
          <span>{companyInfo.website}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-primary" />
          <span>{companyInfo.phone1}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-primary" />
          <span>{companyInfo.phone2}</span>
        </div>
      </div>
    </div>
  );
}