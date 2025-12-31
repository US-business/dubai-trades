# دليل رفع المشروع على GitHub | GitHub Deployment Guide

## 🚀 خطوات رفع المشروع الأولى | Initial Upload Steps

### 1. **تثبيت Git | Install Git**
قم بتحميل Git من: https://git-scm.com/download/win

### 2. **إعداد Git الأولي | Initial Git Setup**
```bash
# تكوين المستخدم | Configure user
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# التحقق من التكوين | Verify configuration  
git config --list
```

### 3. **إنشاء Repository على GitHub | Create GitHub Repository**
1. اذهب إلى GitHub.com وسجل دخول
2. اضغط على "New Repository"
3. اسم المستودع: `ecommerce-dashboard`  
4. الوصف: `Modern e-commerce dashboard with Arabic/English support`
5. اختر Public أو Private
6. **لا تضع** README أو .gitignore أو License (موجودة بالفعل)
7. اضغط "Create Repository"

### 4. **ربط المشروع المحلي بـ GitHub | Connect Local Project to GitHub**

افتح PowerShell أو Command Prompt في مجلد المشروع وشغل:

```bash
# الانتقال لمجلد المشروع | Navigate to project folder
cd C:\ecommerce-dashboard

# تهيئة Git | Initialize Git
git init

# إضافة الملفات | Add files
git add .

# أول commit | First commit
git commit -m "Initial commit: Complete e-commerce dashboard with Arabic/English support

Features:
- Product management with image upload
- Order management with COD support  
- Review system with verified purchases
- Shopping cart with coupons
- Multi-language support (Arabic/English)
- Admin dashboard
- Authentication system"

# ربط بـ Remote Repository | Connect to remote repository
git remote add origin https://github.com/US-business/ecommerce-dashboard.git

# رفع الكود | Push code
git push -u origin main
```

### 5. **التحقق من الرفع | Verify Upload**
اذهب إلى: https://github.com/US-business/ecommerce-dashboard
ستجد جميع الملفات مرفوعة بنجاح.

---

## 📁 الملفات المُنشأة للمشروع | Created Project Files

### 🔧 ملفات التكوين | Configuration Files
- ✅ `.gitignore` - ملفات مُستبعدة من Git
- ✅ `README.md` - دليل شامل للمشروع
- ✅ `LICENSE` - ترخيص MIT
- ✅ `CONTRIBUTING.md` - إرشادات المساهمة
- ✅ `CHANGELOG.md` - سجل التغييرات

### 🔄 GitHub Workflows
- ✅ `.github/workflows/ci.yml` - CI/CD pipeline
- ✅ `.github/ISSUE_TEMPLATE/bug_report.md` - قالب تقرير الأخطاء
- ✅ `.github/ISSUE_TEMPLATE/feature_request.md` - قالب طلب الميزات  
- ✅ `.github/pull_request_template.md` - قالب طلب السحب

### 📚 ملفات التوثيق | Documentation Files
- ✅ `docs/REVIEWS/` - توثيق نظام التقييمات
- ✅ `docs/COD_PAYMENT_WORKFLOW.md` - سير عمل الدفع عند الاستلام
- ✅ `scripts/` - نصوص الاختبار

---

## 🔒 إعداد متغيرات البيئة | Environment Variables Setup

### للتطوير المحلي | For Local Development
```bash
# إنشاء ملف البيئة | Create environment file
cp .env.example .env.local
```

### للإنتاج | For Production
قم بإعداد المتغيرات التالية في hosting provider:

```env
# Database | قاعدة البيانات
DATABASE_URL="postgresql://username:password@host:5432/database"

# NextAuth | المصادقة
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-production-secret"

# OAuth Providers | موفرو OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
FACEBOOK_CLIENT_ID="your-facebook-client-id"  
FACEBOOK_CLIENT_SECRET="your-facebook-client-secret"

# Cloudinary | كلاوديناري
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Email | البريد الإلكتروني
EMAIL_SERVER_USER="your-email@domain.com"
EMAIL_SERVER_PASSWORD="your-email-password"
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_FROM="noreply@yourdomain.com"
```

---

## 🌐 خيارات النشر | Deployment Options

### 1. **Vercel (مُوصى به | Recommended)**
```bash
# تثبيت Vercel CLI | Install Vercel CLI
npm i -g vercel

# النشر | Deploy
vercel

# ربط بـ GitHub للنشر التلقائي | Connect to GitHub for auto-deployment
vercel --prod
```

### 2. **Netlify**
1. ربط GitHub repository
2. إعداد build commands:
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Install command: `npm install`

### 3. **Railway**
```bash
# تثبيت Railway CLI | Install Railway CLI
npm install -g @railway/cli

# تسجيل الدخول | Login
railway login

# النشر | Deploy  
railway deploy
```

### 4. **Docker**
```dockerfile
# Dockerfile موجود بالفعل في المشروع | Dockerfile already in project
docker build -t ecommerce-dashboard .
docker run -p 3000:3000 ecommerce-dashboard
```

---

## 🔧 إعداد CI/CD | CI/CD Setup

### GitHub Actions (مُعد بالفعل | Already configured)
الملف `.github/workflows/ci.yml` يشمل:
- اختبار على Node.js 18 & 20
- فحص ESLint
- فحص TypeScript  
- فحص الأمان
- بناء المشروع

### إعداد Secrets للـ Actions | Setup Secrets for Actions
في GitHub repository > Settings > Secrets:
```
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id
```

---

## 📊 مراقبة المشروع | Project Monitoring

### GitHub Insights
- **Traffic** - زيارات المستودع
- **Contributors** - المساهمون
- **Issues** - المشاكل المفتوحة
- **Pull Requests** - طلبات السحب

### Production Monitoring
- **Vercel Analytics** - تحليلات الأداء
- **Error Tracking** - تتبع الأخطاء
- **Database Monitoring** - مراقبة قاعدة البيانات

---

## 🛡️ الأمان | Security

### GitHub Security Features
- **Dependabot** - تحديثات التبعيات الآمنة
- **Code Scanning** - فحص الكود للثغرات
- **Secret Scanning** - فحص الأسرار المكشوفة

### Production Security  
- HTTPS only
- Environment variables للأسرار
- Regular dependency updates
- Database backups

---

## 📞 الدعم | Support

### مشاكل النشر | Deployment Issues
1. تحقق من logs في hosting provider
2. تأكد من متغيرات البيئة
3. فحص database connection
4. راجع build logs

### الحصول على المساعدة | Getting Help
- إنشاء Issue على GitHub
- مراجعة Documentation
- تواصل: support@us-business.com

---

## ✅ قائمة التحقق النهائية | Final Checklist

- [ ] Git مُثبت ومُكون
- [ ] Repository مُنشأ على GitHub  
- [ ] الكود مرفوع بنجاح
- [ ] متغيرات البيئة مُعدة
- [ ] CI/CD يعمل بشكل صحيح
- [ ] النشر ناجح ويعمل
- [ ] Database مُتصلة
- [ ] Authentication يعمل
- [ ] البريد الإلكتروني يعمل
- [ ] رفع الصور يعمل

🎉 **مبروك! مشروعك الآن على GitHub وجاهز للعالم** 🎉
