import * as React from 'react';
import { getCompanyName } from '@/lib/config/company-info';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderConfirmationEmailProps {
  userName: string;
  orderNumber: string;
  orderDate: string;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: string;
  lang?: 'ar' | 'en';
}

export const OrderConfirmationEmail: React.FC<Readonly<OrderConfirmationEmailProps>> = ({
  userName,
  orderNumber,
  orderDate,
  items,
  totalAmount,
  shippingAddress,
  lang = 'en',
}) => {
  const isRTL = lang === 'ar';
  
  const content = {
    ar: {
      title: 'تأكيد الطلب',
      greeting: `عزيزي ${userName}،`,
      message: 'شكراً لطلبك! تم استلام طلبك وجاري معالجته.',
      orderDetails: 'تفاصيل الطلب:',
      orderNumber: 'رقم الطلب:',
      orderDate: 'تاريخ الطلب:',
      items: 'المنتجات:',
      quantity: 'الكمية:',
      price: 'السعر:',
      shippingAddress: 'عنوان الشحن:',
      total: 'المجموع:',
      currency: 'درهم',
      tracking: 'سنرسل لك تحديثات حول حالة طلبك.',
      viewOrder: 'عرض تفاصيل الطلب',
      thanks: 'شكراً لثقتك بنا',
      team: `فريق ${getCompanyName("rtl")}`,
    },
    en: {
      title: 'Order Confirmation',
      greeting: `Dear ${userName},`,
      message: 'Thank you for your order! Your order has been received and is being processed.',
      orderDetails: 'Order Details:',
      orderNumber: 'Order Number:',
      orderDate: 'Order Date:',
      items: 'Items:',
      quantity: 'Quantity:',
      price: 'Price:',
      shippingAddress: 'Shipping Address:',
      total: 'Total:',
      currency: 'AED',
      tracking: 'We will send you updates about your order status.',
      viewOrder: 'View Order Details',
      thanks: 'Thank you for your trust',
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
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
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
          .order-box {
            background-color: #f0fdf4;
            border: 2px solid #10b981;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
          }
          .order-info {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            padding: 10px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .item-row {
            padding: 15px;
            margin: 10px 0;
            background-color: #f9fafb;
            border-radius: 6px;
          }
          .item-name {
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 5px;
          }
          .item-details {
            color: #6b7280;
            font-size: 14px;
          }
          .total-box {
            background-color: #fef3c7;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            text-align: center;
          }
          .total-amount {
            font-size: 32px;
            font-weight: bold;
            color: #f59e0b;
            margin: 10px 0;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #10b981;
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
            <h1>✅ {t.title}</h1>
          </div>
          <div className="content">
            <p>{t.greeting}</p>
            <p>{t.message}</p>
            
            <div className="order-box">
              <div className="order-info">
                <strong>{t.orderNumber}</strong>
                <span>{orderNumber}</span>
              </div>
              <div className="order-info">
                <strong>{t.orderDate}</strong>
                <span>{orderDate}</span>
              </div>
            </div>

            <h3>{t.items}</h3>
            {items.map((item, index) => (
              <div key={index} className="item-row">
                <div className="item-name">{item.name}</div>
                <div className="item-details">
                  {t.quantity} {item.quantity} × {item.price} {t.currency}
                </div>
              </div>
            ))}

            <div className="total-box">
              <div><strong>{t.total}</strong></div>
              <div className="total-amount">{totalAmount} {t.currency}</div>
            </div>

            <div className="order-box">
              <strong>{t.shippingAddress}</strong><br />
              {shippingAddress}
            </div>

            <p>{t.tracking}</p>

            <center>
              <a href={`${process.env.NEXT_PUBLIC_APP_URL}/account/orders/${orderNumber}`} className="button">
                {t.viewOrder}
              </a>
            </center>
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
