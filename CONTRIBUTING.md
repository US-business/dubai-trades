# Contributing to E-Commerce Dashboard | المساهمة في لوحة التحكم

Thank you for your interest in contributing to our e-commerce dashboard! This document provides guidelines for contributing to the project.

شكراً لاهتمامك بالمساهمة في لوحة التحكم! هذا المستند يوفر إرشادات للمساهمة في المشروع.

## 🚀 Getting Started | البدء

### Prerequisites | المتطلبات
- Node.js 18+
- Git
- PostgreSQL
- Basic knowledge of Next.js, TypeScript, and React

### Development Setup | إعداد التطوير

1. **Fork the repository | فورك المستودع**
2. **Clone your fork | استنساخ الفورك**
```bash
git clone https://github.com/your-username/ecommerce-dashboard.git
cd ecommerce-dashboard
```

3. **Install dependencies | تثبيت التبعيات**
```bash
npm install
```

4. **Set up environment variables | إعداد متغيرات البيئة**
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

5. **Run the development server | تشغيل خادم التطوير**
```bash
npm run dev
```

## 📋 Guidelines | الإرشادات

### Code Style | نمط الكود
- Use TypeScript for all new code
- Follow the existing code style and formatting
- Use meaningful variable and function names
- Add comments for complex logic
- Use Arabic comments for Arabic-specific features

### Commit Messages | رسائل الالتزام
Use conventional commit format:
```
type(scope): description

feat(auth): add Google OAuth integration
fix(cart): resolve quantity update issue
docs(readme): update installation instructions
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

### Pull Request Process | عملية طلب السحب

1. **Create a feature branch | إنشاء فرع مميز**
```bash
git checkout -b feature/your-feature-name
```

2. **Make your changes | قم بالتغييرات**
   - Write clean, readable code
   - Add tests for new features
   - Update documentation if needed

3. **Test your changes | اختبر التغييرات**
```bash
npm run lint
npm run type-check
npm run build
```

4. **Commit your changes | التزم بالتغييرات**
```bash
git add .
git commit -m "feat(scope): description"
```

5. **Push to your fork | ادفع إلى الفورك**
```bash
git push origin feature/your-feature-name
```

6. **Create a Pull Request | أنشئ طلب سحب**
   - Use a clear title and description
   - Reference any related issues
   - Include screenshots for UI changes
   - Add Arabic descriptions for Arabic features

## 🐛 Bug Reports | تقارير الأخطاء

When reporting bugs, please include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Environment details (OS, browser, Node.js version)

## 💡 Feature Requests | طلبات المميزات

When requesting features:
- Explain the use case
- Describe the proposed solution
- Consider internationalization (Arabic/English)
- Think about mobile responsiveness

## 🏗️ Project Structure | هيكل المشروع

### Key Directories | المجلدات الرئيسية
```
app/[lang]/           # Internationalized pages
components/           # Reusable components
lib/                 # Utilities and configurations
├── actions/         # Server actions
├── auth/           # Authentication
├── db/             # Database schema
└── stores/         # State management
```

### Component Guidelines | إرشادات المكونات
- Use TypeScript interfaces for props
- Support both RTL and LTR layouts
- Include proper accessibility attributes
- Use Shadcn/ui components when possible

### Database Guidelines | إرشادات قاعدة البيانات
- Use Drizzle ORM for all database operations
- Write migrations for schema changes
- Include both Arabic and English field support
- Add proper indexes for performance

## 🌍 Internationalization | الدولة

### Adding New Text | إضافة نص جديد
1. Add keys to translation files
2. Use the `useI18nStore` hook in components
3. Support both Arabic and English
4. Consider RTL layout implications

### Translation Guidelines | إرشادات الترجمة
- Keep translations natural and contextual
- Use formal Arabic for business context
- Maintain consistency in terminology
- Test with long Arabic text

## 🧪 Testing | الاختبار

### Test Coverage | تغطية الاختبار
- Write unit tests for utilities
- Add integration tests for API routes
- Test both Arabic and English interfaces
- Include edge cases and error scenarios

### Running Tests | تشغيل الاختبارات
```bash
npm run test        # Run all tests
npm run test:watch  # Watch mode
npm run test:coverage # Coverage report
```

## 📚 Documentation | التوثيق

### Documentation Standards | معايير التوثيق
- Update README.md for major changes
- Add JSDoc comments for functions
- Create markdown files for complex features
- Include both Arabic and English descriptions

### API Documentation | توثيق API
- Document all API endpoints
- Include request/response examples
- Specify error codes and messages
- Add rate limiting information

## 🔒 Security | الأمان

### Security Guidelines | إرشادات الأمان
- Never commit sensitive data
- Use environment variables for secrets
- Validate all user inputs
- Follow OWASP guidelines
- Report security issues privately

## 📞 Getting Help | الحصول على المساعدة

- Create an issue for bugs or questions
- Join our community discussions
- Read existing documentation
- Check closed issues for solutions

## 🎉 Recognition | التقدير

Contributors will be:
- Added to the contributors list
- Mentioned in release notes
- Given credit in documentation

## 📄 License | الترخيص

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing! | شكراً للمساهمة!

**Happy coding! | برمجة سعيدة!** 🚀
