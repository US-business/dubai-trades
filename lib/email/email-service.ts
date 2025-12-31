import { Resend } from 'resend';
import React from 'react';
import { getCompanyName } from '@/lib/config/company-info';

// Simple logger utility
const logger = {
  info: (message: string, meta?: any) => {}, // console.log('[INFO]', message, meta),
  error: (message: string, meta?: any) => {}, // console.error('[ERROR]', message, meta),
};

// Email configuration
const EMAIL_CONFIG = {
  // Use Resend's test email for development, or your verified domain in production
  from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
  replyTo: process.env.EMAIL_REPLY_TO || 'onboarding@resend.dev',
};

// Lazy initialize Resend to avoid errors when API key is not set
let resendInstance: Resend | null = null;

function getResendInstance(): Resend {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured. Please add it to your .env.local file.');
  }
  
  if (!resendInstance) {
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  
  return resendInstance;
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(
  to: string,
  userName: string,
  lang: 'ar' | 'en' = 'en'
) {
  try {
    const { WelcomeEmail } = await import('./templates/welcome-email');
    
    const { data, error } = await getResendInstance().emails.send({
      from: EMAIL_CONFIG.from,
      to,
      subject: lang === 'ar' ? `مرحباً بك في ${getCompanyName("rtl")}!` : `Welcome to ${getCompanyName("ltr")}!`,
      react: WelcomeEmail({ userName, userEmail: to, lang }) as React.ReactElement,
    });

    if (error) {
      logger.error('Failed to send welcome email', { error, to });
      throw new Error('Failed to send welcome email');
    }

    logger.info('Welcome email sent successfully', { to, emailId: data?.id });
    return { success: true, emailId: data?.id };
  } catch (error) {
    logger.error('Error sending welcome email', { error, to });
    return { success: false, error };
  }
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(
  to: string,
  orderData: {
    userName: string;
    orderNumber: string;
    orderDate: string;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
    totalAmount: number;
    shippingAddress: string;
  },
  lang: 'ar' | 'en' = 'en'
) {
  try {
    const { OrderConfirmationEmail } = await import('./templates/order-confirmation-email');
    
    const { data, error } = await getResendInstance().emails.send({
      from: EMAIL_CONFIG.from,
      to,
      subject: lang === 'ar' 
        ? `تأكيد الطلب #${orderData.orderNumber}` 
        : `Order Confirmation #${orderData.orderNumber}`,
      react: OrderConfirmationEmail({ ...orderData, lang }) as React.ReactElement,
    });

    if (error) {
      logger.error('Failed to send order confirmation email', { error, to });
      throw new Error('Failed to send order confirmation email');
    }

    logger.info('Order confirmation email sent successfully', { 
      to, 
      orderNumber: orderData.orderNumber, 
      emailId: data?.id 
    });
    return { success: true, emailId: data?.id };
  } catch (error) {
    logger.error('Error sending order confirmation email', { error, to });
    return { success: false, error };
  }
}

/**
 * Send password reset email (when user clicks reset link)
 */
export async function sendPasswordResetEmail(
  to: string,
  userName: string,
  resetToken: string,
  lang: 'ar' | 'en' = 'en'
) {
  try {
    const { ResetPasswordEmail } = await import('./templates/reset-password-email');
    
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/${lang}/reset-password?token=${resetToken}`;
    const expiresIn = lang === 'ar' ? 'ساعة واحدة' : '1 hour';
    
    const { data, error } = await getResendInstance().emails.send({
      from: EMAIL_CONFIG.from,
      to,
      subject: lang === 'ar' ? 'إعادة تعيين كلمة المرور' : 'Reset Your Password',
      react: ResetPasswordEmail({ userName, resetLink, expiresIn, lang }) as React.ReactElement,
    });

    if (error) {
      logger.error('Failed to send password reset email', { error, to });
      throw new Error('Failed to send password reset email');
    }

    logger.info('Password reset email sent successfully', { to, emailId: data?.id });
    return { success: true, emailId: data?.id };
  } catch (error) {
    logger.error('Error sending password reset email', { error, to });
    return { success: false, error };
  }
}

/**
 * Send forgot password email (when user requests password reset)
 * This is the initial email sent when user clicks "Forgot Password"
 */
export async function sendForgotPasswordEmail(
  to: string,
  userName: string,
  resetToken: string,
  lang: 'ar' | 'en' = 'en'
) {
  try {
    const { ResetPasswordEmail } = await import('./templates/reset-password-email');
    
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/${lang}/reset-password?token=${resetToken}`;
    const expiresIn = lang === 'ar' ? 'ساعة واحدة' : '1 hour';
    
    const { data, error } = await getResendInstance().emails.send({
      from: EMAIL_CONFIG.from,
      to,
      subject: lang === 'ar' ? 'طلب إعادة تعيين كلمة المرور' : 'Password Reset Request',
      react: ResetPasswordEmail({ userName, resetLink, expiresIn, lang }) as React.ReactElement,
    });

    if (error) {
      logger.error('Failed to send forgot password email', { error, to });
      throw new Error('Failed to send forgot password email');
    }

    logger.info('Forgot password email sent successfully', { to, emailId: data?.id });
    return { success: true, emailId: data?.id };
  } catch (error) {
    logger.error('Error sending forgot password email', { error, to });
    return { success: false, error };
  }
}

/**
 * Send email verification link to new users
 */
export async function sendVerificationEmail(
  to: string,
  userName: string,
  verificationToken: string,
  lang: 'ar' | 'en' = 'en'
) {
  try {
    const { VerificationEmail } = await import('./templates/verification-email');
    
    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/${lang}/verify-email?token=${verificationToken}`;
    const expiresIn = lang === 'ar' ? '24 ساعة' : '24 hours';
    
    const { data, error } = await getResendInstance().emails.send({
      from: EMAIL_CONFIG.from,
      to,
      subject: lang === 'ar' ? 'تأكيد بريدك الإلكتروني' : 'Verify Your Email Address',
      react: VerificationEmail({ userName, verificationLink, expiresIn, lang }) as React.ReactElement,
    });

    if (error) {
      logger.error('Failed to send verification email', { error, to });
      throw new Error('Failed to send verification email');
    }

    logger.info('Verification email sent successfully', { to, emailId: data?.id });
    return { success: true, emailId: data?.id };
  } catch (error) {
    logger.error('Error sending verification email', { error, to });
    return { success: false, error };
  }
}

/**
 * Send order status update email
 */
export async function sendOrderStatusEmail(
  to: string,
  orderData: {
    userName: string;
    orderNumber: string;
    status: string;
    statusMessage: string;
  },
  lang: 'ar' | 'en' = 'en'
) {
  try {
    const statusText = lang === 'ar' 
      ? {
          processing: 'قيد المعالجة',
          shipped: 'تم الشحن',
          delivered: 'تم التسليم',
          cancelled: 'ملغى',
        }
      : {
          processing: 'Processing',
          shipped: 'Shipped',
          delivered: 'Delivered',
          cancelled: 'Cancelled',
        };

    const subject = lang === 'ar'
      ? `تحديث حالة الطلب #${orderData.orderNumber}`
      : `Order Status Update #${orderData.orderNumber}`;

    const htmlContent = `
      <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>${subject}</h2>
          <p>${lang === 'ar' ? 'عزيزي' : 'Dear'} ${orderData.userName},</p>
          <p>${orderData.statusMessage}</p>
          <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <strong>${lang === 'ar' ? 'الحالة الحالية:' : 'Current Status:'}</strong>
            <span style="color: #0284c7; font-weight: bold;">${statusText[orderData.status as keyof typeof statusText] || orderData.status}</span>
          </div>
          <p>${lang === 'ar' ? 'شكراً لك' : 'Thank you'}</p>
          <p><strong>${getCompanyName(lang === 'ar' ? 'rtl' : 'ltr')} ${lang === 'ar' ? 'فريق' : 'Team'}</strong></p>
        </body>
      </html>
    `;

    const { data, error } = await getResendInstance().emails.send({
      from: EMAIL_CONFIG.from,
      to,
      subject,
      html: htmlContent,
    });

    if (error) {
      logger.error('Failed to send order status email', { error, to });
      throw new Error('Failed to send order status email');
    }

    logger.info('Order status email sent successfully', { 
      to, 
      orderNumber: orderData.orderNumber, 
      emailId: data?.id 
    });
    return { success: true, emailId: data?.id };
  } catch (error) {
    logger.error('Error sending order status email', { error, to });
    return { success: false, error };
  }
}

/**
 * Send custom email
 */
export async function sendCustomEmail(
  to: string | string[],
  subject: string,
  htmlContent: string,
  options?: {
    replyTo?: string;
    cc?: string[];
    bcc?: string[];
  }
) {
  try {
    const { data, error } = await getResendInstance().emails.send({
      from: EMAIL_CONFIG.from,
      to,
      subject,
      html: htmlContent,
      replyTo: options?.replyTo || EMAIL_CONFIG.replyTo,
      cc: options?.cc,
      bcc: options?.bcc,
    });

    if (error) {
      logger.error('Failed to send custom email', { error, to });
      throw new Error('Failed to send custom email');
    }

    logger.info('Custom email sent successfully', { to, emailId: data?.id });
    return { success: true, emailId: data?.id };
  } catch (error) {
    logger.error('Error sending custom email', { error, to });
    return { success: false, error };
  }
}

/**
 * Validate email service configuration
 */
export function validateEmailConfig(): boolean {
  if (!process.env.RESEND_API_KEY) {
    logger.error('RESEND_API_KEY is not configured');
    return false;
  }
  return true;
}

export const emailService = {
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendPasswordResetEmail,
  sendForgotPasswordEmail,
  sendVerificationEmail,
  sendOrderStatusEmail,
  sendCustomEmail,
  validateEmailConfig,
};
