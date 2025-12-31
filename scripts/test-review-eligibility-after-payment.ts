#!/usr/bin/env tsx

/**
 * اختبار أهلية كتابة التقييم بعد تحديث حالة الدفع والتسليم
 * Testing review eligibility after payment and delivery status updates
 */

import { canUserWriteReview } from '../lib/actions/reviews'
import { updateOrderStatus, updatePaymentStatus } from '../lib/actions/orders'

async function testReviewEligibilityAfterPayment() {
    console.log('🔍 اختبار أهلية التقييم بعد تحديث الدفع والتسليم')
    console.log('='.repeat(60))

    try {
        const testProductId = 1 // استبدل بمعرف منتج موجود
        const testOrderId = 1    // استبدل بمعرف طلب موجود
        
        console.log('\n📋 السيناريو المختبر:')
        console.log('1. طلب تم إنشاؤه مع الدفع عند الاستلام')
        console.log('2. تحديث حالة الطلب إلى "delivered"')
        console.log('3. تحديث حالة الدفع إلى "paid"')
        console.log('4. التحقق من إمكانية كتابة التقييم')

        // الخطوة 1: التحقق من الحالة الأولية
        console.log('\n🔍 الحالة الأولية:')
        const initialCheck = await canUserWriteReview(testProductId)
        
        if (initialCheck.success) {
            console.log('📊 النتيجة الأولية:', initialCheck.data)
            if (initialCheck.data?.canWrite) {
                console.log('✅ المستخدم مؤهل بالفعل لكتابة التقييم')
            } else {
                console.log('❌ المستخدم غير مؤهل. السبب:', initialCheck.data?.reason)
                console.log('💬 الرسالة:', initialCheck.data?.message)
            }
        }

        // الخطوة 2: محاكاة تحديث حالة الطلب إلى delivered
        console.log('\n📦 تحديث حالة الطلب إلى "delivered":')
        const deliveryUpdate = await updateOrderStatus(testOrderId, "delivered")
        
        if (deliveryUpdate.success) {
            console.log('✅ تم تحديث حالة الطلب إلى "delivered"')
        } else {
            console.log('❌ فشل تحديث حالة الطلب:', deliveryUpdate.error)
        }

        // الخطوة 3: محاكاة تحديث حالة الدفع إلى paid
        console.log('\n💰 تحديث حالة الدفع إلى "paid":')
        const paymentUpdate = await updatePaymentStatus(testOrderId, "paid")
        
        if (paymentUpdate.success) {
            console.log('✅ تم تحديث حالة الدفع إلى "paid"')
        } else {
            console.log('❌ فشل تحديث حالة الدفع:', paymentUpdate.error)
        }

        // الخطوة 4: التحقق من الأهلية بعد التحديثات
        console.log('\n🎯 التحقق من الأهلية بعد التحديثات:')
        const finalCheck = await canUserWriteReview(testProductId)
        
        if (finalCheck.success) {
            console.log('📊 النتيجة النهائية:', finalCheck.data)
            if (finalCheck.data?.canWrite) {
                console.log('🎉 ممتاز! المستخدم الآن مؤهل لكتابة التقييم')
                console.log('💡 السبب:', finalCheck.data?.reason)
                console.log('✨ الرسالة:', finalCheck.data?.message)
            } else {
                console.log('⚠️  المستخدم ما زال غير مؤهل. السبب:', finalCheck.data?.reason)
                console.log('💬 الرسالة:', finalCheck.data?.message)
            }
        }

        // ملخص الاختبار
        console.log('\n📈 ملخص النتائج:')
        console.log('================')
        
        const wasEligibleBefore = initialCheck.data?.canWrite || false
        const isEligibleAfter = finalCheck.data?.canWrite || false
        
        if (!wasEligibleBefore && isEligibleAfter) {
            console.log('🟢 نجح الاختبار: المستخدم أصبح مؤهلاً بعد التحديثات')
        } else if (wasEligibleBefore && isEligibleAfter) {
            console.log('🔵 كان المستخدم مؤهلاً من البداية وما زال كذلك')
        } else if (!wasEligibleBefore && !isEligibleAfter) {
            console.log('🔴 فشل الاختبار: المستخدم غير مؤهل رغم التحديثات')
            console.log('🔧 تحقق من:')
            console.log('   - هل تم إنشاء الطلب بشكل صحيح؟')
            console.log('   - هل المستخدم مسجل دخول؟')
            console.log('   - هل معرف المنتج صحيح؟')
        } else {
            console.log('🟡 حالة غير متوقعة: كان مؤهلاً ولكن لم يعد كذلك')
        }

    } catch (error) {
        console.error('💥 خطأ في الاختبار:', error)
        
        if (error instanceof Error) {
            if (error.message.includes('Database')) {
                console.log('🔧 تأكد من اتصال قاعدة البيانات')
            } else if (error.message.includes('auth')) {
                console.log('🔐 تأكد من تسجيل دخول المستخدم')
            } else if (error.message.includes('not found')) {
                console.log('🔍 تأكد من وجود الطلب والمنتج')
            }
        }
    }
}

/**
 * اختبار تفاعلي لحالات مختلفة
 */
async function testDifferentPaymentScenarios() {
    console.log('\n🧪 اختبار سيناريوهات دفع مختلفة:')
    console.log('==================================')

    const scenarios = [
        {
            name: 'طلب مسلم + دفع مؤكد',
            orderStatus: 'delivered',
            paymentStatus: 'paid',
            expectedEligible: true
        },
        {
            name: 'طلب مسلم + دفع معلق',
            orderStatus: 'delivered', 
            paymentStatus: 'pending',
            expectedEligible: false
        },
        {
            name: 'طلب مشحون + دفع مؤكد',
            orderStatus: 'shipped',
            paymentStatus: 'paid', 
            expectedEligible: false
        },
        {
            name: 'طلب معلق + دفع معلق',
            orderStatus: 'pending',
            paymentStatus: 'pending',
            expectedEligible: false
        }
    ]

    for (const scenario of scenarios) {
        console.log(`\n📋 اختبار: ${scenario.name}`)
        console.log(`   حالة الطلب: ${scenario.orderStatus}`)
        console.log(`   حالة الدفع: ${scenario.paymentStatus}`)
        console.log(`   النتيجة المتوقعة: ${scenario.expectedEligible ? 'مؤهل' : 'غير مؤهل'}`)
        console.log('   ' + '-'.repeat(40))
    }

    console.log('\n💡 لاختبار هذه السيناريوهات:')
    console.log('1. أنشئ طلبات بحالات مختلفة')
    console.log('2. استخدم معرفات صحيحة في الكود')
    console.log('3. شغل الاختبار مع كل سيناريو')
}

// تشغيل الاختبارات
if (require.main === module) {
    console.log('🚀 بدء اختبار أهلية التقييم بعد الدفع...\n')
    
    testReviewEligibilityAfterPayment()
        .then(() => testDifferentPaymentScenarios())
        .then(() => {
            console.log('\n🎉 انتهى الاختبار!')
            console.log('\n📌 ملاحظات مهمة:')
            console.log('   ✅ يجب أن تكون حالة الطلب "delivered"')
            console.log('   ✅ يجب أن تكون حالة الدفع "paid"')
            console.log('   ✅ يجب أن يكون المستخدم مسجل دخول')
            console.log('   ✅ يجب ألا يكون قد قيم المنتج من قبل')
        })
        .catch((error) => {
            console.error('💥 فشل الاختبار:', error)
            process.exit(1)
        })
}

export { testReviewEligibilityAfterPayment, testDifferentPaymentScenarios }
