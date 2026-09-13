import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const fromEmail = process.env.RESEND_FROM_EMAIL || 'AUREX Clinical Fitness <notifications@aurex.com>';

export interface EmailLog {
  id: string;
  to: string;
  subject: string;
  timestamp: string;
  type: 'BOOKING_CONFIRMATION' | 'PACKAGE_EXPIRY' | 'PAYMENT_RECEIPT';
  body: string;
}

// In-memory mock log for dev inspection
export const devEmailLogs: EmailLog[] = [];

export async function sendBookingConfirmationEmail(params: {
  toEmail: string;
  clientName: string;
  serviceType: string;
  specialistName: string;
  sessionDate: string;
  sessionTime: string;
}) {
  const subject = `Confirmed: AUREX Session on ${params.sessionDate} at ${params.sessionTime}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0A0F1D; color: #F8FAFC; padding: 24px; border-radius: 8px; border: 1px solid #1E293B;">
      <div style="border-bottom: 2px solid #10B981; padding-bottom: 12px; margin-bottom: 20px;">
        <h1 style="color: #10B981; margin: 0; font-size: 24px; letter-spacing: 1px;">AUREX CLINICAL FITNESS</h1>
        <p style="color: #94A3B8; margin: 4px 0 0 0; font-size: 13px;">Medical Fitness & Clinical Exercise Management</p>
      </div>
      <p style="font-size: 16px;">Dear <strong>${params.clientName}</strong>,</p>
      <p style="color: #CBD5E1;">Your clinical exercise session has been confirmed:</p>
      <div style="background: #161F30; padding: 16px; border-radius: 6px; margin: 16px 0; border: 1px solid #26354D;">
        <p style="margin: 6px 0;"><strong>Service:</strong> ${params.serviceType}</p>
        <p style="margin: 6px 0;"><strong>Specialist:</strong> ${params.specialistName}</p>
        <p style="margin: 6px 0;"><strong>Date:</strong> ${params.sessionDate}</p>
        <p style="margin: 6px 0;"><strong>Time:</strong> ${params.sessionTime}</p>
      </div>
      <p style="color: #94A3B8; font-size: 12px; margin-top: 24px;">Please arrive 5 minutes prior to your session time. For cancellations, notify at least 4 hours in advance.</p>
    </div>
  `;

  if (resend) {
    try {
      await resend.emails.send({
        from: fromEmail,
        to: params.toEmail,
        subject,
        html,
      });
      return { success: true, mode: 'resend' };
    } catch (err) {
      console.warn('[Resend API Error - Falling back to Dev Log]:', err);
    }
  }

  // Fallback dev mock logger
  const logEntry: EmailLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    to: params.toEmail,
    subject,
    timestamp: new Date().toISOString(),
    type: 'BOOKING_CONFIRMATION',
    body: `Booking confirmed for ${params.clientName} (${params.serviceType}) with ${params.specialistName} on ${params.sessionDate} at ${params.sessionTime}`,
  };
  devEmailLogs.unshift(logEntry);
  console.log('[Dev Mock Email Sent]:', logEntry);

  return { success: true, mode: 'mock', log: logEntry };
}

export async function sendPackageExpiryEmail(params: {
  toEmail: string;
  clientName: string;
  packageName: string;
  expiryDate: string;
  sessionsRemaining: number;
}) {
  const subject = `AUREX Package Renewal Notice — ${params.sessionsRemaining} Sessions Left`;
  const logEntry: EmailLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    to: params.toEmail,
    subject,
    timestamp: new Date().toISOString(),
    type: 'PACKAGE_EXPIRY',
    body: `Package renewal alert for ${params.clientName}: ${params.packageName} expires on ${params.expiryDate}. Remaining sessions: ${params.sessionsRemaining}`,
  };
  devEmailLogs.unshift(logEntry);
  console.log('[Dev Mock Package Reminder Sent]:', logEntry);
  return { success: true, mode: 'mock', log: logEntry };
}
