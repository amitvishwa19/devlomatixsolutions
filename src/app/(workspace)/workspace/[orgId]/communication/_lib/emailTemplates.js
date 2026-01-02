export const emailTemplates = [
    {
        id: "appointment-confirmation",
        name: "Appointment Confirmation",
        category: "appointment",
        subject: "Your Appointment is Confirmed - {{appointmentDate}}",
        body: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafb; padding: 40px 20px;">
        <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #0d9488; margin: 0; font-size: 24px;">Appointment Confirmed</h1>
          </div>
          <p style="color: #334155; font-size: 16px; line-height: 1.6;">Dear {{patientName}},</p>
          <p style="color: #334155; font-size: 16px; line-height: 1.6;">Your appointment has been successfully scheduled.</p>
          <div style="background: #f0fdfa; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="margin: 5px 0; color: #0f766e;"><strong>Date:</strong> {{appointmentDate}}</p>
            <p style="margin: 5px 0; color: #0f766e;"><strong>Time:</strong> {{appointmentTime}}</p>
            <p style="margin: 5px 0; color: #0f766e;"><strong>Doctor:</strong> {{doctorName}}</p>
            <p style="margin: 5px 0; color: #0f766e;"><strong>Department:</strong> {{department}}</p>
          </div>
          <p style="color: #64748b; font-size: 14px; line-height: 1.6;">Please arrive 15 minutes before your scheduled time. Bring your ID and insurance card.</p>
          <p style="color: #334155; font-size: 16px; margin-top: 30px;">Best regards,<br><strong>Hospital Management Team</strong></p>
        </div>
      </div>
    `,
        variables: ["patientName", "appointmentDate", "appointmentTime", "doctorName", "department"],
    },
    {
        id: "appointment-reminder",
        name: "Appointment Reminder",
        category: "appointment",
        subject: "Reminder: Upcoming Appointment Tomorrow",
        body: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafb; padding: 40px 20px;">
        <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #0284c7; margin: 0; font-size: 24px;">⏰ Appointment Reminder</h1>
          </div>
          <p style="color: #334155; font-size: 16px; line-height: 1.6;">Dear {{patientName}},</p>
          <p style="color: #334155; font-size: 16px; line-height: 1.6;">This is a friendly reminder about your upcoming appointment <strong>tomorrow</strong>.</p>
          <div style="background: #e0f2fe; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="margin: 5px 0; color: #0369a1;"><strong>Date:</strong> {{appointmentDate}}</p>
            <p style="margin: 5px 0; color: #0369a1;"><strong>Time:</strong> {{appointmentTime}}</p>
            <p style="margin: 5px 0; color: #0369a1;"><strong>Doctor:</strong> {{doctorName}}</p>
          </div>
          <p style="color: #64748b; font-size: 14px;">Need to reschedule? Please contact us at least 24 hours in advance.</p>
          <p style="color: #334155; font-size: 16px; margin-top: 30px;">Best regards,<br><strong>Hospital Management Team</strong></p>
        </div>
      </div>
    `,
        variables: ["patientName", "appointmentDate", "appointmentTime", "doctorName"],
    },
    {
        id: "billing-invoice",
        name: "Billing Invoice",
        category: "billing",
        subject: "Invoice #{{invoiceNumber}} - Payment Due",
        body: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafb; padding: 40px 20px;">
        <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #7c3aed; margin: 0; font-size: 24px;">Invoice</h1>
            <p style="color: #64748b; margin-top: 10px;">#{{invoiceNumber}}</p>
          </div>
          <p style="color: #334155; font-size: 16px; line-height: 1.6;">Dear {{patientName}},</p>
          <p style="color: #334155; font-size: 16px; line-height: 1.6;">Please find below your billing statement.</p>
          <div style="background: #faf5ff; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="margin: 5px 0; color: #6b21a8;"><strong>Service Date:</strong> {{serviceDate}}</p>
            <p style="margin: 5px 0; color: #6b21a8;"><strong>Description:</strong> {{description}}</p>
            <p style="margin: 15px 0 5px 0; color: #6b21a8; font-size: 20px;"><strong>Amount Due: \${{amount}}</strong></p>
            <p style="margin: 5px 0; color: #6b21a8;"><strong>Due Date:</strong> {{dueDate}}</p>
          </div>
          <p style="color: #64748b; font-size: 14px;">For payment options or questions, contact our billing department.</p>
          <p style="color: #334155; font-size: 16px; margin-top: 30px;">Best regards,<br><strong>Hospital Billing Department</strong></p>
        </div>
      </div>
    `,
        variables: ["patientName", "invoiceNumber", "serviceDate", "description", "amount", "dueDate"],
    },
    {
        id: "lab-results",
        name: "Lab Results Ready",
        category: "lab",
        subject: "Your Lab Results Are Ready",
        body: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafb; padding: 40px 20px;">
        <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #059669; margin: 0; font-size: 24px;">🔬 Lab Results Available</h1>
          </div>
          <p style="color: #334155; font-size: 16px; line-height: 1.6;">Dear {{patientName}},</p>
          <p style="color: #334155; font-size: 16px; line-height: 1.6;">Your lab test results are now available.</p>
          <div style="background: #ecfdf5; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="margin: 5px 0; color: #047857;"><strong>Test Type:</strong> {{testType}}</p>
            <p style="margin: 5px 0; color: #047857;"><strong>Test Date:</strong> {{testDate}}</p>
            <p style="margin: 5px 0; color: #047857;"><strong>Ordering Physician:</strong> {{doctorName}}</p>
          </div>
          <p style="color: #64748b; font-size: 14px;">Please log in to your patient portal to view the complete results, or contact your physician's office.</p>
          <p style="color: #334155; font-size: 16px; margin-top: 30px;">Best regards,<br><strong>Hospital Laboratory</strong></p>
        </div>
      </div>
    `,
        variables: ["patientName", "testType", "testDate", "doctorName"],
    },
    {
        id: "welcome-patient",
        name: "Welcome New Patient",
        category: "general",
        subject: "Welcome to Our Hospital",
        body: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafb; padding: 40px 20px;">
        <div style="background: linear-gradient(135deg, #0d9488 0%, #0284c7 100%); border-radius: 12px 12px 0 0; padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome!</h1>
        </div>
        <div style="background: white; border-radius: 0 0 12px 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <p style="color: #334155; font-size: 16px; line-height: 1.6;">Dear {{patientName}},</p>
          <p style="color: #334155; font-size: 16px; line-height: 1.6;">Welcome to our hospital! We're honored you've chosen us for your healthcare needs.</p>
          <div style="background: #f0fdfa; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="margin: 5px 0; color: #0f766e;"><strong>Patient ID:</strong> {{patientId}}</p>
            <p style="margin: 5px 0; color: #0f766e;"><strong>Primary Physician:</strong> {{doctorName}}</p>
          </div>
          <p style="color: #64748b; font-size: 14px;">Set up your patient portal to access medical records, schedule appointments, and communicate with your care team.</p>
          <p style="color: #334155; font-size: 16px; margin-top: 30px;">Best regards,<br><strong>Hospital Management Team</strong></p>
        </div>
      </div>
    `,
        variables: ["patientName", "patientId", "doctorName"],
    },
    {
        id: "emergency-alert",
        name: "Emergency Alert",
        category: "emergency",
        subject: "🚨 URGENT: Emergency Alert",
        body: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fef2f2; padding: 40px 20px;">
        <div style="background: #dc2626; border-radius: 12px 12px 0 0; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🚨 EMERGENCY ALERT</h1>
        </div>
        <div style="background: white; border-radius: 0 0 12px 12px; padding: 40px; border: 2px solid #dc2626;">
          <p style="color: #991b1b; font-size: 18px; font-weight: bold; line-height: 1.6;">{{alertTitle}}</p>
          <p style="color: #334155; font-size: 16px; line-height: 1.6;">{{alertMessage}}</p>
          <div style="background: #fee2e2; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="margin: 5px 0; color: #991b1b;"><strong>Issued At:</strong> {{issuedAt}}</p>
            <p style="margin: 5px 0; color: #991b1b;"><strong>Priority:</strong> {{priority}}</p>
          </div>
          <p style="color: #64748b; font-size: 14px;">Please follow all emergency protocols and stay safe.</p>
          <p style="color: #334155; font-size: 16px; margin-top: 30px;"><strong>Hospital Emergency Response Team</strong></p>
        </div>
      </div>
    `,
        variables: ["alertTitle", "alertMessage", "issuedAt", "priority"],
    },
];

export const getCategoryColor = (category) => {
    const colors = {
        appointment: "bg-primary/10 text-primary",
        billing: "bg-purple-100 text-purple-700",
        general: "bg-secondary text-secondary-foreground",
        lab: "bg-success/10 text-success",
        emergency: "bg-destructive/10 text-destructive",
    };
    return colors[category];
};

export const getCategoryIcon = (category) => {
    const icons = {
        appointment: "📅",
        billing: "💳",
        general: "📧",
        lab: "🔬",
        emergency: "🚨",
    };
    return icons[category];
};
