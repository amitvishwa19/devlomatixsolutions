import { forwardRef } from 'react';
import { format } from 'date-fns';

export const PrintableResult = forwardRef(
  ({ order }, ref) => {
    return (
      <div ref={ref} className="print-container p-8 max-w-2xl mx-auto bg-background">
        {/* Header */}
        <div className="text-center border-b-2 border-foreground pb-4 mb-6">
          <h1 className="text-2xl font-bold tracking-tight">HOSPITAL LABORATORY</h1>
          <p className="text-muted-foreground">Clinical Pathology & Diagnostics</p>
          <p className="text-sm text-muted-foreground mt-1">
            123 Medical Center Drive • Phone: (555) 123-4567
          </p>
        </div>

        {/* Report Title */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold uppercase tracking-wide">Laboratory Test Report</h2>
          <p className="text-sm text-muted-foreground">Report ID: {order.orderId}</p>
        </div>

        {/* Patient & Specimen Info */}
        <div className="grid grid-cols-2 gap-8 mb-6 text-sm">
          <div className="space-y-2">
            <h3 className="font-semibold border-b border-border pb-1">Patient Information</h3>
            <div className="grid grid-cols-[100px_1fr] gap-1">
              <span className="text-muted-foreground">Name:</span>
              <span className="font-medium">{order.patient.name}</span>
              <span className="text-muted-foreground">MRN:</span>
              <span>{order.patient.mrn}</span>
              <span className="text-muted-foreground">Age/Gender:</span>
              <span>{order.patient.age} years / {order.patient.gender}</span>
              <span className="text-muted-foreground">Contact:</span>
              <span>{order.patient.contact}</span>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold border-b border-border pb-1">Specimen Details</h3>
            <div className="grid grid-cols-[100px_1fr] gap-1">
              <span className="text-muted-foreground">Specimen ID:</span>
              <span>{order.specimenId}</span>
              <span className="text-muted-foreground">Type:</span>
              <span>{order.specimenTypes.join(', ')}</span>
              <span className="text-muted-foreground">Collected:</span>
              <span>{format(order.collectedAt, 'MMM dd, yyyy HH:mm')}</span>
              <span className="text-muted-foreground">Reported:</span>
              <span>{order.completedAt ? format(order.completedAt, 'MMM dd, yyyy HH:mm') : '-'}</span>
            </div>
          </div>
        </div>

        {/* Test Information */}
        <div className="mb-6">
          <h3 className="font-semibold border-b border-border pb-1 mb-3">Test Information</h3>
          {order.tests.map((test, index) => (
            <div key={test.id} className={`bg-muted/30 rounded-lg p-4 ${index > 0 ? 'mt-3' : ''}`}>
              <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
                <span className="text-muted-foreground">Test Name:</span>
                <span className="font-medium">{test.testName}</span>
                <span className="text-muted-foreground">Test Code:</span>
                <span>{test.testCode}</span>
                <span className="text-muted-foreground">Category:</span>
                <span>{test.category}</span>
                {test.normalRange && (
                  <>
                    <span className="text-muted-foreground">Reference:</span>
                    <span>{test.normalRange} {test.unit}</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Results */}
        <div className="mb-6">
          <h3 className="font-semibold border-b border-border pb-1 mb-3">Test Results</h3>
          <div className="bg-muted/30 rounded-lg p-4 min-h-[100px]">
            <pre className="whitespace-pre-wrap text-sm font-mono">{order.result || 'No results available'}</pre>
          </div>
        </div>

        {/* Notes */}
        {order.resultNote && (
          <div className="mb-6">
            <h3 className="font-semibold border-b border-border pb-1 mb-3">Clinical Notes</h3>
            <p className="text-sm italic">{order.resultNote}</p>
          </div>
        )}

        {/* Critical Alerts */}
        {order.criticalAlerts && order.criticalAlerts.length > 0 && (
          <div className="mb-6 border-2 border-destructive rounded-lg p-4">
            <h3 className="font-semibold text-destructive mb-2">⚠️ Critical Values</h3>
            <ul className="text-sm space-y-1">
              {order.criticalAlerts.map(alert => (
                <li key={alert.id}>
                  <strong>{alert.parameterName}:</strong> {alert.value} ({alert.flag === 'critical-high' ? 'HIGH' : 'LOW'})
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Footer */}
        <div className="border-t-2 border-foreground pt-4 mt-8">
          <div className="grid grid-cols-2 gap-8 text-sm">
            <div>
              <p className="text-muted-foreground">Ordered By:</p>
              <p className="font-medium">{order.orderedBy}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Verified By:</p>
              <p className="font-medium">{order.technicianName || 'N/A'}</p>
            </div>
          </div>
          <div className="text-center mt-6 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              This report is electronically generated and is valid without signature.
            </p>
            <p className="text-xs text-muted-foreground">
              Printed on: {format(new Date(), 'MMMM dd, yyyy HH:mm:ss')}
            </p>
          </div>
        </div>
      </div>
    );
  }
);

PrintableResult.displayName = 'PrintableResult';
