import { Resend } from "resend";

export async function AppMailer(
  workspaceId,
  { to, subject, templateName, templateData, from }
) {
  try {
    // Fallback to Env since DB is removed
    if (!process.env.RESEND_API_KEY) {
      throw new Error("No Resend API key found in environment");
    }
    const resendClient = new Resend(process.env.RESEND_API_KEY);

    let fromEmail =
      from || process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

    // Simplified template rendering or direct message for now
    // Since DB templates are gone, we use a simple fallback
    let html = `<div>Template: ${templateName}</div><pre>${JSON.stringify(
      templateData,
      null,
      2
    )}</pre>`;

    // Send via Resend
    const { data, error } = await resendClient.emails.send({
      from: fromEmail,
      to: to,
      subject: subject || `Notification: ${templateName}`,
      html: html,
    });

    if (error) {
      console.error("[RESEND_ERROR]", error);
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error("[APP_MAILER_ERROR]", error);
    throw error;
  }
}
