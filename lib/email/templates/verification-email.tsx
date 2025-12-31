import * as React from 'react';
import { getCompanyName, companyInfo } from '@/lib/config/company-info';

interface VerificationEmailProps {
  userName: string;
  verificationLink: string;
  expiresIn: string;
  lang: 'ar' | 'en';
}

export const VerificationEmail: React.FC<VerificationEmailProps> = ({
  userName,
  verificationLink,
  expiresIn,
  lang,
}) => {
  const isArabic = lang === 'ar';
  const direction = isArabic ? 'rtl' : 'ltr';
  const textAlign = isArabic ? 'right' : 'left';

  return (
    <html dir={direction}>
      <head>
        <meta charSet="utf-8" />
      </head>
      <body
        style={{
          fontFamily: isArabic
            ? "'Arial', 'Helvetica', sans-serif"
            : "'Helvetica Neue', 'Arial', sans-serif",
          backgroundColor: '#f6f9fc',
          padding: '40px 20px',
          margin: 0,
        }}
      >
        <table
          cellPadding="0"
          cellSpacing="0"
          style={{
            maxWidth: '600px',
            margin: '0 auto',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <tr>
            <td
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '40px 30px',
                textAlign: 'center',
              }}
            >
              <h1
                style={{
                  color: '#ffffff',
                  fontSize: '28px',
                  fontWeight: 'bold',
                  margin: 0,
                }}
              >
                {isArabic ? '🔐 تحقق من بريدك الإلكتروني' : '🔐 Verify Your Email'}
              </h1>
            </td>
          </tr>

          {/* Content */}
          <tr>
            <td style={{ padding: '40px 30px', textAlign }}>
              <p
                style={{
                  fontSize: '18px',
                  color: '#333333',
                  marginBottom: '20px',
                }}
              >
                {isArabic ? `مرحباً ${userName}،` : `Hello ${userName},`}
              </p>

              <p
                style={{
                  fontSize: '16px',
                  color: '#666666',
                  lineHeight: '1.6',
                  marginBottom: '30px',
                }}
              >
                {isArabic
                  ? `شكراً لتسجيلك في ${getCompanyName("rtl")}! يرجى تأكيد عنوان بريدك الإلكتروني بالنقر على الزر أدناه:`
                  : `Thank you for signing up with ${getCompanyName("ltr")}! Please confirm your email address by clicking the button below:`}
              </p>

              {/* Verification Button */}
              <div style={{ textAlign: 'center', margin: '40px 0' }}>
                <a
                  href={verificationLink}
                  style={{
                    display: 'inline-block',
                    padding: '16px 40px',
                    backgroundColor: '#667eea',
                    color: '#ffffff',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 6px rgba(102, 126, 234, 0.4)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {isArabic ? 'تأكيد البريد الإلكتروني' : 'Verify Email Address'}
                </a>
              </div>

              {/* Alternative Link */}
              <p
                style={{
                  fontSize: '14px',
                  color: '#999999',
                  lineHeight: '1.6',
                  marginTop: '30px',
                }}
              >
                {isArabic
                  ? 'إذا لم يعمل الزر أعلاه، يمكنك نسخ ولصق الرابط التالي في متصفحك:'
                  : "If the button above doesn't work, you can copy and paste the following link into your browser:"}
              </p>

              <div
                style={{
                  backgroundColor: '#f8f9fa',
                  padding: '15px',
                  borderRadius: '6px',
                  marginTop: '15px',
                  wordBreak: 'break-all',
                }}
              >
                <a
                  href={verificationLink}
                  style={{
                    color: '#667eea',
                    fontSize: '14px',
                    textDecoration: 'none',
                  }}
                >
                  {verificationLink}
                </a>
              </div>

              {/* Expiry Notice */}
              <div
                style={{
                  backgroundColor: '#fff3cd',
                  border: '1px solid #ffc107',
                  borderRadius: '6px',
                  padding: '15px',
                  marginTop: '30px',
                }}
              >
                <p
                  style={{
                    fontSize: '14px',
                    color: '#856404',
                    margin: 0,
                    lineHeight: '1.6',
                  }}
                >
                  ⏰{' '}
                  {isArabic
                    ? `هذا الرابط صالح لمدة ${expiresIn} فقط. إذا انتهت صلاحيته، يمكنك طلب رابط جديد من صفحة تسجيل الدخول.`
                    : `This link will expire in ${expiresIn}. If it expires, you can request a new one from the sign-in page.`}
                </p>
              </div>

              {/* Security Notice */}
              <p
                style={{
                  fontSize: '13px',
                  color: '#999999',
                  marginTop: '30px',
                  lineHeight: '1.6',
                }}
              >
                {isArabic
                  ? 'إذا لم تقم بإنشاء حساب، يرجى تجاهل هذا البريد الإلكتروني.'
                  : "If you didn't create an account, please ignore this email."}
              </p>
            </td>
          </tr>

          {/* Footer */}
          <tr>
            <td
              style={{
                backgroundColor: '#f8f9fa',
                padding: '30px',
                textAlign: 'center',
                borderTop: '1px solid #e9ecef',
              }}
            >
              <p
                style={{
                  fontSize: '14px',
                  color: '#666666',
                  margin: 0,
                  marginBottom: '10px',
                }}
              >
                {isArabic
                  ? 'أطيب التحيات،'
                  : 'Best regards,'}
              </p>
              <p
                style={{
                  fontSize: '16px',
                  color: '#333333',
                  fontWeight: 'bold',
                  margin: 0,
                }}
              >
                {isArabic ? `فريق ${getCompanyName("rtl")}` : `${getCompanyName("ltr")} Team`}
              </p>

              <div
                style={{
                  marginTop: '20px',
                  paddingTop: '20px',
                  borderTop: '1px solid #e9ecef',
                }}
              >
                <p
                  style={{
                    fontSize: '12px',
                    color: '#999999',
                    margin: 0,
                  }}
                >
                  © {companyInfo.copyrightYear}{' '}
                  {isArabic ? `${getCompanyName("rtl")}. جميع الحقوق محفوظة.` : `${getCompanyName("ltr")}. All rights reserved.`}
                </p>
              </div>
            </td>
          </tr>
        </table>
      </body>
    </html>
  );
};
