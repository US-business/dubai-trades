import * as React from 'react';
import { getCompanyName } from '@/lib/config/company-info';

interface ResetPasswordEmailProps {
  userName: string;
  resetLink: string;
  expiresIn?: string;
  lang?: 'ar' | 'en';
}

export const ResetPasswordEmail: React.FC<Readonly<ResetPasswordEmailProps>> = ({
  userName,
  resetLink,
  expiresIn = '1 hour',
  lang = 'en',
}) => {
  const isRTL = lang === 'ar';
  
  const content = {
    ar: {
      title: 'إعادة تعيين كلمة المرور',
      greeting: `عزيزي ${userName}،`,
      message: 'لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بك.',
      instruction: 'انقر على الزر أدناه لإعادة تعيين كلمة المرور:',
      button: 'إعادة تعيين كلمة المرور',
      expires: `هذا الرابط صالح لمدة ${expiresIn} فقط.`,
      notRequested: 'إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذه الرسالة.',
      security: 'لأسباب أمنية، لا تشارك هذا الرابط مع أي شخص.',
      thanks: 'شكراً لك',
      team: `فريق ${getCompanyName("rtl")}`,
      alternativeText: 'إذا لم يعمل الزر، انسخ هذا الرابط والصقه في المتصفح:',
    },
    en: {
      title: 'Reset Your Password',
      greeting: `Dear ${userName},`,
      message: 'We received a request to reset your password.',
      instruction: 'Click the button below to reset your password:',
      button: 'Reset Password',
      expires: `This link is valid for ${expiresIn} only.`,
      notRequested: 'If you did not request a password reset, please ignore this email.',
      security: 'For security reasons, do not share this link with anyone.',
      thanks: 'Thank you',
      team: `${getCompanyName("ltr")} Team`,
      alternativeText: 'If the button doesn\'t work, copy and paste this link into your browser:',
    },
  };

  const t = content[lang];

  return (
    <html dir={isRTL ? 'rtl' : 'ltr'}>
      <head>
        <style>{`
          body {
            font-family: ${isRTL ? 'Arial, sans-serif' : 'Helvetica, Arial, sans-serif'};
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            padding: 40px 20px;
            text-align: center;
            color: #ffffff;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
          }
          .content {
            padding: 40px 30px;
            color: #333333;
            line-height: 1.6;
          }
          .warning-box {
            background-color: #fef2f2;
            border-left: ${isRTL ? 'none' : '4px solid #ef4444'};
            border-right: ${isRTL ? '4px solid #ef4444' : 'none'};
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 4px;
            color: #991b1b;
          }
          .button {
            display: inline-block;
            padding: 14px 40px;
            background-color: #ef4444;
            color: #ffffff;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            margin: 20px 0;
            font-size: 16px;
          }
          .button:hover {
            background-color: #dc2626;
          }
          .link-box {
            background-color: #f9fafb;
            padding: 15px;
            margin: 20px 0;
            border-radius: 6px;
            word-break: break-all;
            font-size: 12px;
            color: #6b7280;
          }
          .footer {
            background-color: #f9fafb;
            padding: 20px 30px;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
          }
          .security-note {
            background-color: #fffbeb;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 4px;
            border: 1px solid #fbbf24;
            color: #92400e;
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          <div className="header">
            <h1>🔐 {t.title}</h1>
          </div>
          <div className="content">
            <p>{t.greeting}</p>
            <p>{t.message}</p>
            
            <p><strong>{t.instruction}</strong></p>

            <center>
              <a href={resetLink} className="button">
                {t.button}
              </a>
            </center>

            <div className="warning-box">
              <strong>⏰ {t.expires}</strong>
            </div>

            <div className="security-note">
              <strong>🔒 {t.security}</strong>
            </div>

            <p style={{ fontSize: '14px', color: '#6b7280' }}>
              {t.alternativeText}
            </p>
            <div className="link-box">
              {resetLink}
            </div>

            <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '30px' }}>
              {t.notRequested}
            </p>
          </div>
          <div className="footer">
            <p>{t.thanks}</p>
            <p><strong>{t.team}</strong></p>
          </div>
        </div>
      </body>
    </html>
  );
};
