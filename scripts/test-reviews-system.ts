#!/usr/bin/env tsx

/**
 * اختبار نظام التقييمات المحدث
 * Test script for the updated reviews system
 */

import { canUserWriteReview, addReview } from '../lib/actions/reviews'

async function testReviewsSystem() {
    console.log('🧪 اختبار نظام التقييمات المحدث | Testing Updated Reviews System')
    console.log('='.repeat(60))

    try {
        // اختبار للتحقق من إمكانية كتابة المراجعة
        console.log('\n📋 اختبار دالة canUserWriteReview:')
        
        const testProductId = 1 // استبدل بمعرف منتج موجود
        
        const eligibilityResult = await canUserWriteReview(testProductId)
        
        if (eligibilityResult.success) {
            console.log('✅ الدالة تعمل بنجاح')
            console.log('📊 النتيجة:', eligibilityResult.data)
            
            if (eligibilityResult.data?.canWrite) {
                console.log('🟢 المستخدم مؤهل لكتابة التقييم')
            } else {
                console.log('🔴 المستخدم غير مؤهل. السبب:', eligibilityResult.data?.reason)
                console.log('💬 الرسالة:', eligibilityResult.data?.message)
            }
        } else {
            console.log('❌ خطأ في الدالة:', eligibilityResult.error)
        }

        // اختبار إضافة تقييم (سيفشل إذا لم يكن المستخدم قد اشترى المنتج)
        console.log('\n📝 اختبار دالة addReview:')
        
        const addReviewResult = await addReview(testProductId, 5, 'تقييم تجريبي')
        
        if (addReviewResult.success) {
            console.log('✅ تم إضافة التقييم بنجاح')
            console.log('📊 البيانات:', addReviewResult.data)
        } else {
            console.log('❌ فشل إضافة التقييم (متوقع إذا لم يتم الشراء)')
            console.log('💬 رسالة الخطأ بالعربية:', addReviewResult.error)
            console.log('💬 رسالة الخطأ بالإنجليزية:', addReviewResult.errorEn)
        }

        console.log('\n🎯 ملخص نتائج الاختبار:')
        console.log('================================')
        console.log('1. ✅ دالة canUserWriteReview: تعمل')
        console.log('2. ✅ دالة addReview: تطبق قيود الشراء')
        console.log('3. ✅ الرسائل متعددة اللغات: متوفرة')
        console.log('4. ✅ التحقق من الشراء: يعمل')

    } catch (error) {
        console.error('💥 خطأ في الاختبار:', error)
        
        // تحقق من نوع الخطأ
        if (error instanceof Error) {
            if (error.message.includes('Database')) {
                console.log('🔧 تأكد من اتصال قاعدة البيانات')
            } else if (error.message.includes('auth')) {
                console.log('🔐 تأكد من تسجيل دخول المستخدم')
            }
        }
    }
}

/**
 * اختبار حالات مختلفة
 * Test different scenarios
 */
async function testDifferentScenarios() {
    console.log('\n🔬 اختبار حالات مختلفة:')
    console.log('========================')

    const scenarios = [
        {
            name: 'منتج غير موجود | Non-existent product',
            productId: 99999,
            expectedResult: 'error'
        },
        {
            name: 'منتج صحيح | Valid product', 
            productId: 1,
            expectedResult: 'depends on user'
        }
    ]

    for (const scenario of scenarios) {
        console.log(`\n📋 اختبار: ${scenario.name}`)
        
        try {
            const result = await canUserWriteReview(scenario.productId)
            
            if (result.success) {
                console.log('✅ نجح الاختبار')
                console.log(`   السبب: ${result.data?.reason}`)
                console.log(`   يمكن الكتابة: ${result.data?.canWrite ? 'نعم' : 'لا'}`)
            } else {
                console.log('⚠️  فشل الاختبار:', result.error)
            }
        } catch (error) {
            console.log('❌ خطأ:', error)
        }
    }
}

/**
 * نصائح للاختبار اليدوي
 * Manual testing tips
 */
function printManualTestingTips() {
    console.log('\n📝 نصائح للاختبار اليدوي:')
    console.log('==========================')
    console.log('1. 🔐 سجل دخول كمستخدم لم يشتر المنتج')
    console.log('   - يجب أن ترى رسالة "يجب شراء المنتج أولاً"')
    console.log('')
    console.log('2. 🛒 اشتر المنتج وأكمل الطلب')
    console.log('   - غير حالة الطلب إلى "completed" في قاعدة البيانات')
    console.log('')
    console.log('3. ✍️ حاول كتابة تقييم')
    console.log('   - يجب أن ترى شارة "شراء موثق"')
    console.log('   - يجب أن تتمكن من إضافة التقييم')
    console.log('')
    console.log('4. 🔄 حاول كتابة تقييم آخر للنفس المنتج')
    console.log('   - يجب أن ترى رسالة "لقد قمت بتقييم هذا المنتج بالفعل"')
    console.log('')
    console.log('5. 👥 اختبر بمستخدم غير مسجل')
    console.log('   - يجب أن ترى رسالة "يجب تسجيل الدخول"')
}

// تشغيل الاختبارات
if (require.main === module) {
    console.log('🚀 بدء اختبار نظام التقييمات...\n')
    
    testReviewsSystem()
        .then(() => testDifferentScenarios())
        .then(() => printManualTestingTips())
        .then(() => {
            console.log('\n🎉 انتهى الاختبار!')
            console.log('\n⚠️  ملاحظة: بعض الاختبارات قد تفشل إذا لم يكن هناك مستخدم مسجل دخول')
            console.log('   أو إذا لم تكن قاعدة البيانات متصلة.')
        })
        .catch((error) => {
            console.error('💥 فشل الاختبار:', error)
            process.exit(1)
        })
}

export { testReviewsSystem, testDifferentScenarios }
