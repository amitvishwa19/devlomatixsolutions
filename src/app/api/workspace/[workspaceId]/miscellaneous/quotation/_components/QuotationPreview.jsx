import { QuotationHeader } from './QuotationHeader';
import { QuotationInfo } from './QuotationInfo';
import { LineItemsTable } from './LineItemsTable';
import { ModuleFeatures } from './ModuleFeatures';
import { FinancialSummary } from './FinancialSummary';
import { TermsAndConditions } from './TermsAndConditions';

export function QuotationPreview({ data }) {
  return (
    <div className="flex flex-col gap-4 max-w-6xl mx-auto" id="quotation-preview">
      <QuotationHeader companyInfo={data.companyInfo} />

      <QuotationInfo
        quotationNumber={data.quotationNumber}
        date={data.date}
        validTill={data.validTill}
        clientName={data.clientName}
        clientAddress={data.clientAddress}
        quotationTitle={data.quotationTitle}
      />

      <LineItemsTable
        items={data.lineItems}
        totalBeds={data.totalBeds}
        perBedPrice={data.perBedPrice}
        currency={data.currency}
      />

      <ModuleFeatures modules={data.modules} />

      <FinancialSummary
        subtotal={data.subtotal}
        discountType={data.discountType}
        discountValue={data.discountValue}
        discountAmount={data.discountAmount}
        gstPercent={data.gstPercent}
        gstAmount={data.gstAmount}
        total={data.total}
        currency={data.currency}
      />

      <TermsAndConditions terms={data.termsAndConditions} notes={data.notes} />
    </div>
  );
}