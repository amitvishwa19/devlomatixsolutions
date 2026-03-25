import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
  console.log("Testing Resend with key:", process.env.RESEND_API_KEY ? "Present (HIDDEN)" : "MISSING");
  console.log("From:", process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev');
  console.log("To: devlomatix@gmail.com");

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: 'devlomatix@gmail.com',
      subject: 'Resend Test - Career Page',
      html: '<p>If you see this, Resend is working correctly!</p>'
    });

    if (error) {
      console.error("Resend Error:", error);
    } else {
      console.log("Resend Success! Message ID:", data.id);
    }
  } catch (err) {
    console.error("Exception:", err);
  }
}

testEmail();
