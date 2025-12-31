import * as React from 'react';
import { getCompanyName } from '@/lib/config/company-info';

interface WelcomeEmailProps {
  userName: string;
  userEmail: string;
  lang?: 'ar' | 'en';
}

export const WelcomeEmail: React.FC<Readonly<WelcomeEmailProps>> = ({
  userName,
  userEmail,
  lang = 'en',
}) => {
  const isRTL = lang === 'ar';
  
  const content = {
    ar: {
      greeting: `مرحباً ${userName}!`,
      welcome: `مرحباً بك في ${getCompanyName("rtl")}`,
      message: 'نحن سعداء بانضمامك إلينا. تم إنشاء حسابك بنجاح.',
      accountInfo: 'معلومات الحساب:',
      email: 'البريد الإلكتروني:',
      getStarted: 'ابدأ الآن:',
      browseProducts: 'تصفح منتجاتنا',
      contactUs: 'إذا كان لديك أي أسئلة، لا تتردد في التواصل معنا.',
      thanks: `شكراً لاختيارك ${getCompanyName("rtl")}`,
      team: `فريق ${getCompanyName("rtl")}`,
    },
    en: {
      greeting: `Hello ${userName}!`,
      welcome: `Welcome to ${getCompanyName("ltr")}`,
      message: 'We are excited to have you on board. Your account has been created successfully.',
      accountInfo: 'Account Information:',
      email: 'Email:',
      getStarted: 'Get Started:',
      browseProducts: 'Browse our products',
      contactUs: 'If you have any questions, feel free to contact us.',
      thanks: `Thank you for choosing ${getCompanyName("ltr")}`,
      team: `${getCompanyName("ltr")} Team`,
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
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
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
          .info-box {
            background-color: #fef3c7;
            border-left: ${isRTL ? 'none' : '4px solid #f59e0b'};
            border-right: ${isRTL ? '4px solid #f59e0b' : 'none'};
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #f59e0b;
            color: #ffffff;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            margin: 20px 0;
          }
          .footer {
            background-color: #f9fafb;
            padding: 20px 30px;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          <div className="header">
            <h1>🛒 {t.welcome}</h1>
          </div>
          <div className="content">
            <h2>{t.greeting}</h2>
            <p>{t.message}</p>
            
            <div className="info-box">
              <strong>{t.accountInfo}</strong><br />
              <strong>{t.email}</strong> {userEmail}
            </div>

            <p><strong>{t.getStarted}</strong></p>
            <a href={process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'} className="button">
              {t.browseProducts}
            </a>

            <p>{t.contactUs}</p>
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
