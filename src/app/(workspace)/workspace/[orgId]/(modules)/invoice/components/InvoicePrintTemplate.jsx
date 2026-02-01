import React, { forwardRef } from 'react';
import { HOSPITAL_DETAILS } from '../utils/types';
import { formatCurrency, numberToWords } from '../utils';
import { format } from 'date-fns';

/**
 * Printable Invoice Template with hospital letterhead
 * This component is designed to be printed or converted to PDF
 */
const InvoicePrintTemplate = forwardRef(({ invoice }, ref) => {
  if (!invoice) return null;

  return (
    <div
      ref={ref}
      className="bg-white text-black p-8 w-[210mm] min-h-[297mm] mx-auto print:p-0 print:m-0"
      style={{ fontFamily: 'Arial, sans-serif' }}
    >
      {/* Hospital Header / Letterhead */}
      <div className="border-b-2 border-gray-800 pb-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{HOSPITAL_DETAILS.name}</h1>
            <p className="text-sm text-gray-600 mt-1">{HOSPITAL_DETAILS.address}</p>
            <p className="text-sm text-gray-600">{HOSPITAL_DETAILS.city}</p>
            <div className="flex gap-4 mt-2 text-xs text-gray-600">
              <span>Phone: {HOSPITAL_DETAILS.phone}</span>
              <span>Email: {HOSPITAL_DETAILS.email}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-400 tracking-wider">TAX INVOICE</div>
            <div className="mt-2 text-xs text-gray-600 space-y-0.5">
              <p>GSTIN: {HOSPITAL_DETAILS.gstin}</p>
              <p>PAN: {HOSPITAL_DETAILS.pan}</p>
              <p>CIN: {HOSPITAL_DETAILS.cin}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Details & Patient Info */}
      <div className="grid grid-cols-2 gap-8 mb-6">
        <div className="border border-gray-300 rounded p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Invoice Details</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Invoice No:</span>
              <span className="font-semibold">{invoice.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Invoice Date:</span>
              <span>{format(new Date(invoice.invoiceDate), 'dd MMM yyyy')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Due Date:</span>
              <span>{format(new Date(invoice.dueDate), 'dd MMM yyyy')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Bill Reference:</span>
              <span className="font-mono text-xs">{invoice.billId}</span>
            </div>
          </div>
        </div>

        <div className="border border-gray-300 rounded p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Patient Details</h3>
          <div className="space-y-1 text-sm">
            <p className="font-semibold">{invoice.patient.name}</p>
            <p className="text-gray-600">UHID: {invoice.patient.uhid}</p>
            <p className="text-gray-600">{invoice.patient.age} yrs, {invoice.patient.gender}</p>
            <p className="text-gray-600">Phone: +91 {invoice.patient.phone}</p>
            <p className="text-gray-600 text-xs">{invoice.patient.address}</p>
          </div>
        </div>
      </div>

      {/* Services Table */}
      <div className="mb-6">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-2 py-2 text-left w-10">#</th>
              <th className="border border-gray-300 px-2 py-2 text-left">Description</th>
              <th className="border border-gray-300 px-2 py-2 text-center w-20">HSN/SAC</th>
              <th className="border border-gray-300 px-2 py-2 text-right w-24">Rate</th>
              <th className="border border-gray-300 px-2 py-2 text-center w-16">Qty</th>
              <th className="border border-gray-300 px-2 py-2 text-right w-24">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={index}>
                <td className="border border-gray-300 px-2 py-2 text-gray-600">{item.slNo || index + 1}</td>
                <td className="border border-gray-300 px-2 py-2">
                  <div>{item.description}</div>
                  {item.department && (
                    <div className="text-xs text-gray-500">{item.department}</div>
                  )}
                </td>
                <td className="border border-gray-300 px-2 py-2 text-center font-mono text-xs">{item.hsn}</td>
                <td className="border border-gray-300 px-2 py-2 text-right">{formatCurrency(item.rate)}</td>
                <td className="border border-gray-300 px-2 py-2 text-center">{item.quantity}</td>
                <td className="border border-gray-300 px-2 py-2 text-right font-medium">{formatCurrency(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Section */}
      <div className="grid grid-cols-2 gap-8 mb-6">
        {/* Amount in Words */}
        <div className="border border-gray-300 rounded p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Amount in Words</h3>
          <p className="text-sm font-medium">{numberToWords(Math.round(invoice.grandTotal))}</p>

          {invoice.insuranceClaim && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Insurance Details</h3>
              <div className="text-xs space-y-1">
                <p>Provider: {invoice.insuranceClaim.provider}</p>
                <p>Policy No: {invoice.insuranceClaim.policyNumber}</p>
                <p>Claim Amount: {formatCurrency(invoice.insuranceClaim.claimAmount)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Totals */}
        <div className="border border-gray-300 rounded p-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">CGST (9%)</span>
              <span>{formatCurrency(invoice.cgst)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">SGST (9%)</span>
              <span>{formatCurrency(invoice.sgst)}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Discount</span>
                <span className="text-green-600">-{formatCurrency(invoice.discount)}</span>
              </div>
            )}
            {invoice.roundOff !== 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Round Off</span>
                <span>{invoice.roundOff > 0 ? '+' : ''}{formatCurrency(invoice.roundOff)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-gray-300 font-bold text-base">
              <span>Grand Total</span>
              <span>{formatCurrency(invoice.grandTotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Amount Paid</span>
              <span className="text-green-600">{formatCurrency(invoice.amountPaid)}</span>
            </div>
            <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-300">
              <span>Balance Due</span>
              <span className={invoice.balanceDue > 0 ? 'text-red-600' : 'text-green-600'}>
                {formatCurrency(invoice.balanceDue)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment History */}
      {invoice.payments && invoice.payments.length > 0 && (
        <div className="mb-6 border border-gray-300 rounded p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Payment History</h3>
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-2 py-1 text-left">Date</th>
                <th className="px-2 py-1 text-left">Method</th>
                <th className="px-2 py-1 text-left">Reference</th>
                <th className="px-2 py-1 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.payments.map((payment, index) => (
                <tr key={index} className="border-t border-gray-200">
                  <td className="px-2 py-1">{format(new Date(payment.date), 'dd MMM yyyy')}</td>
                  <td className="px-2 py-1 capitalize">{payment.method}</td>
                  <td className="px-2 py-1 font-mono">{payment.reference}</td>
                  <td className="px-2 py-1 text-right font-medium">{formatCurrency(payment.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-gray-300 pt-4 mt-8">
        <div className="grid grid-cols-2 gap-8">
          <div className="text-xs text-gray-500 space-y-1">
            <p>Terms & Conditions:</p>
            <ol className="list-decimal ml-4 space-y-0.5">
              <li>All payments are due by the due date mentioned above.</li>
              <li>This is a computer-generated invoice and does not require a physical signature.</li>
              <li>For any queries, please contact our billing department.</li>
            </ol>
          </div>
          <div className="text-right">
            <div className="border-t border-gray-400 pt-2 mt-8 inline-block w-48">
              <p className="text-xs text-gray-600">Authorized Signatory</p>
              <p className="text-xs text-gray-500">{invoice.authorizedBy || 'Pending'}</p>
            </div>
          </div>
        </div>
        <div className="text-center text-xs text-gray-400 mt-6">
          <p>Generated by: {invoice.generatedBy} | Print Count: {(invoice.printCount || 0) + 1} | {format(new Date(), 'dd MMM yyyy HH:mm')}</p>
        </div>
      </div>
    </div>
  );
});

InvoicePrintTemplate.displayName = 'InvoicePrintTemplate';

export { InvoicePrintTemplate };
