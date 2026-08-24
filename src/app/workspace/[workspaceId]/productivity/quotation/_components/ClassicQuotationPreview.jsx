

import logo from '@/assets/images/logo/logo.png';
import { currencies } from '../_types/quotation';

export function ClassicQuotationPreview({ data }) {
  const currencyConfig = currencies.find(c => c.code === data.currency) || currencies[0];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(currencyConfig.locale, {
      style: 'currency',
      currency: currencyConfig.code,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const logoSrc = data.companyInfo.customLogo || logo;
  const hasDiscount = data.discountValue > 0 && data.discountAmount > 0;

  return (
    <div className="bg-[#fffef5] p-8 min-h-[1100px] font-serif" id="classic-quotation-preview">
      {/* Header */}
      <div className="flex justify-between items-start mb-6 border-b-2 border-[#2d4a3e] pb-4">
        <div className="flex items-center gap-4">
          <img src={logoSrc} alt={data.companyInfo.name} className="h-12 w-auto object-contain" />
          <div>
            <h1 className="text-2xl font-bold text-[#2d4a3e] tracking-wide">
              {data.companyInfo.name}
            </h1>
            <p className="text-sm text-[#2d4a3e]/70 italic">
              {data.companyInfo.tagline}
            </p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-light text-[#2d4a3e] tracking-widest">
            Quotation
          </h2>
        </div>
      </div>

      {/* Address and Quote Info */}
      <div className="grid grid-cols-2 gap-8 mb-6 text-sm">
        <div>
          <p className="font-bold text-[#2d4a3e] underline mb-2">ADDRESS:</p>
          <p className="text-gray-700">{data.companyInfo.name}</p>
          <p className="text-gray-700">Tel: {data.companyInfo.phone1}</p>
          {data.companyInfo.phone2 && (
            <p className="text-gray-700">Tel: {data.companyInfo.phone2}</p>
          )}
          <p className="text-gray-700">{data.companyInfo.email}</p>

          <div className="mt-4">
            <p className="font-bold text-[#2d4a3e]">To:</p>
            <p className="text-gray-700">{data.clientName}</p>
            <p className="text-gray-700 whitespace-pre-line">{data.clientAddress}</p>
          </div>
        </div>

        <div className="text-right">
          <table className="ml-auto text-sm">
            <tbody>
              <tr>
                <td className="pr-4 py-1 text-[#2d4a3e] font-medium border-b border-[#2d4a3e]/30">DATE:</td>
                <td className="py-1 text-gray-700 border-b border-[#2d4a3e]/30">{data.date}</td>
              </tr>
              <tr>
                <td className="pr-4 py-1 text-[#2d4a3e] font-medium border-b border-[#2d4a3e]/30">Quote No:</td>
                <td className="py-1 text-gray-700 border-b border-[#2d4a3e]/30">{data.quotationNumber}</td>
              </tr>
              <tr>
                <td className="pr-4 py-1 text-[#2d4a3e] font-medium">Valid Till:</td>
                <td className="py-1 text-gray-700">{data.validTill}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Quotation Title */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">Quotation prepared for:</p>
        <p className="font-medium text-[#2d4a3e] border-b border-dotted border-gray-400 pb-1 inline-block">
          {data.quotationTitle}
        </p>
      </div>

      {/* Line Items Table */}
      <div className="mb-4">
        <div className="flex justify-between items-center bg-[#2d4a3e] text-white px-3 py-2 text-sm">
          <span className="font-medium">PRICING DETAILS</span>
          <span>Total Beds: <span className="font-bold">{data.totalBeds}</span> | Per Bed Price: <span className="font-bold">{formatCurrency(data.perBedPrice)}</span></span>
        </div>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-[#2d4a3e]/80 text-white">
              <th className="border border-[#2d4a3e] px-3 py-2 text-left font-medium w-12">S.NO</th>
              <th className="border border-[#2d4a3e] px-3 py-2 text-left font-medium">DESCRIPTION</th>
              <th className="border border-[#2d4a3e] px-3 py-2 text-right font-medium">RATE</th>
              <th className="border border-[#2d4a3e] px-3 py-2 text-center font-medium">QTY</th>
              <th className="border border-[#2d4a3e] px-3 py-2 text-right font-medium">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {data.lineItems.map((item, index) => (
              <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-[#f5f5f0]'}>
                <td className="border border-gray-300 px-3 py-2 text-center">{index + 1}</td>
                <td className="border border-gray-300 px-3 py-2">{item.description}</td>
                <td className="border border-gray-300 px-3 py-2 text-right">{formatCurrency(item.rate)}</td>
                <td className="border border-gray-300 px-3 py-2 text-center">{item.quantity}</td>
                <td className="border border-gray-300 px-3 py-2 text-right">{formatCurrency(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Module Features */}
      <div className="mb-6">
        <h3 className="font-bold text-[#2d4a3e] text-sm mb-2 underline">MODULES & FEATURES INCLUDED:</h3>
        <div className="text-xs text-gray-700 space-y-2">
          {data.modules.map((module) => (
            <div key={module.id} className="border-b border-dotted border-gray-300 pb-2">
              <p className="font-semibold text-[#2d4a3e]">{module.name}</p>
              <p className="text-gray-600 pl-2">
                {module.features.join(' • ')}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Totals Section */}
      <div className="flex justify-end mb-6">
        <table className="text-sm w-64">
          <tbody>
            <tr>
              <td className="px-3 py-2 text-right font-medium text-[#2d4a3e]">SUB TOTAL:</td>
              <td className="px-3 py-2 text-right border-b border-gray-300">{formatCurrency(data.subtotal)}</td>
            </tr>
            {hasDiscount && (
              <tr className="text-green-700">
                <td className="px-3 py-2 text-right font-medium">
                  DISCOUNT {data.discountType === 'percentage' ? `(${data.discountValue}%)` : ''}:
                </td>
                <td className="px-3 py-2 text-right border-b border-gray-300">- {formatCurrency(data.discountAmount)}</td>
              </tr>
            )}
            <tr>
              <td className="px-3 py-2 text-right font-medium text-[#2d4a3e]">TAX ({data.gstPercent}%):</td>
              <td className="px-3 py-2 text-right border-b border-gray-300">{formatCurrency(data.gstAmount)}</td>
            </tr>
            <tr className="font-bold">
              <td className="px-3 py-2 text-right text-[#2d4a3e]">GRAND TOTAL:</td>
              <td className="px-3 py-2 text-right bg-[#2d4a3e]/10">{formatCurrency(data.total)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Terms and Conditions */}
      <div className="mb-4">
        <h3 className="font-bold text-[#2d4a3e] text-sm mb-2 underline">TERMS AND CONDITIONS:</h3>
        <ol className="list-decimal list-inside text-xs text-gray-700 space-y-1">
          {data.termsAndConditions.map((term, index) => (
            <li key={index}>{term}</li>
          ))}
        </ol>
      </div>

      {/* Notes */}
      {data.notes && data.notes.length > 0 && (
        <div className="mb-4">
          <h3 className="font-bold text-[#2d4a3e] text-sm mb-2 underline">NOTES:</h3>
          <ul className="list-disc list-inside text-xs text-gray-700 space-y-1">
            {data.notes.map((note, index) => (
              <li key={index}>{note}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Signature Section */}
      <div className="flex justify-between items-end mt-8 mb-8 text-sm">
        <div>
          <p className="text-gray-600 text-xs">To accept this quotation, Please sign here and return:</p>
          <div className="border-b border-dotted border-gray-400 w-64 mt-8"></div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center border-t border-[#2d4a3e]/30 pt-4 mt-8">
        <p className="text-xs text-gray-600 mb-1">
          If you have any questions about this quotation, Please contact:
        </p>
        <p className="text-xs text-gray-700">
          {data.companyInfo.name} | Ph: {data.companyInfo.phone1} | {data.companyInfo.email}
        </p>
        <p className="text-sm font-bold text-[#2d4a3e] mt-4 tracking-widest">
          THANK YOU FOR YOUR BUSINESS!
        </p>
      </div>
    </div>
  );
}