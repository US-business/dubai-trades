'use client';

import React, { useState, useTransition } from "react";
import { updatePaymentStatus } from "@/lib/actions/orders";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcnUI/select";
import { Button } from "@/components/shadcnUI/button";
import { toast } from "@/hooks/use-toast";
import { Loader2, DollarSign, CheckCircle, XCircle, Clock } from "lucide-react";
import { useI18nStore } from "@/lib/stores/i18n-store";
import { cn } from "@/lib/utils";

type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

interface UpdatePaymentStatusProps {
  orderId: number;
  currentPaymentStatus: PaymentStatus;
  paymentType: string;
  orderStatus: string;
}

const paymentStatuses: PaymentStatus[] = ["pending", "paid", "failed", "refunded"];

const paymentStatusConfig = {
  pending: { 
    icon: Clock, 
    color: "text-yellow-600", 
    bg: "bg-yellow-50",
    border: "border-yellow-200"
  },
  paid: { 
    icon: CheckCircle, 
    color: "text-green-600", 
    bg: "bg-green-50",
    border: "border-green-200"
  },
  failed: { 
    icon: XCircle, 
    color: "text-red-600", 
    bg: "bg-red-50",
    border: "border-red-200"
  },
  refunded: { 
    icon: DollarSign, 
    color: "text-blue-600", 
    bg: "bg-blue-50",
    border: "border-blue-200"
  }
};

export function UpdatePaymentStatus({ 
  orderId, 
  currentPaymentStatus, 
  paymentType, 
  orderStatus 
}: UpdatePaymentStatusProps) {
  const { t, dir } = useI18nStore();
  const [isPending, startTransition] = useTransition();
  const [selectedStatus, setSelectedStatus] = useState<PaymentStatus>(currentPaymentStatus);

  const config = paymentStatusConfig[selectedStatus];
  const Icon = config.icon;

  // تحديد الحالات المسموحة بناءً على نوع الدفع وحالة الطلب
  const getAllowedStatuses = (): PaymentStatus[] => {
    if (paymentType === "cash_on_delivery") {
      // للدفع عند الاستلام
      if (orderStatus === "delivered") {
        return ["pending", "paid", "failed"];
      } else {
        return ["pending"]; // لا يمكن الدفع قبل التسليم
      }
    } else {
      // للدفع الإلكتروني
      return paymentStatuses;
    }
  };

  const allowedStatuses = getAllowedStatuses();

  const handleStatusChange = (newStatus: PaymentStatus) => {
    setSelectedStatus(newStatus);
    startTransition(async () => {
      const result = await updatePaymentStatus(orderId, newStatus);
      if (result.success) {
        toast({ 
          title: t("orders.success"), 
          description: t("orders.paymentStatusUpdated")
        });
      } else {
        toast({ 
          title: t("orders.error"), 
          description: result.error, 
          variant: "destructive" 
        });
        setSelectedStatus(currentPaymentStatus); // إعادة للحالة السابقة عند الفشل
      }
    });
  };

  return (
    <div className="space-y-2">
      {/* عرض الحالة الحالية */}
      <div className={cn(
        "flex items-center gap-2 p-2 rounded-md border",
        config.bg,
        config.border
      )}>
        <Icon className={cn("h-4 w-4", config.color)} />
        <span className={cn("text-sm font-medium", config.color)}>
          {dir === "rtl" ? (
            paymentType === "cash_on_delivery" 
              ? `${t(`orders.paymentStatus${selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)}`)} - دفع عند الاستلام`
              : t(`orders.paymentStatus${selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)}`)
          ) : (
            `${t(`orders.paymentStatus${selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)}`)}${paymentType === "cash_on_delivery" ? " - COD" : ""}`
          )}
        </span>
      </div>

      {/* تغيير الحالة */}
      <div className="flex items-center gap-2">
        <Select 
          value={selectedStatus} 
          onValueChange={handleStatusChange} 
          disabled={isPending || allowedStatuses.length <= 1}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={t("orders.changePaymentStatus")} />
          </SelectTrigger>
          <SelectContent>
            {allowedStatuses.map((status) => (
              <SelectItem key={status} value={status}>
                <div className="flex items-center gap-2">
                  {React.createElement(paymentStatusConfig[status].icon, {
                    className: cn("h-4 w-4", paymentStatusConfig[status].color)
                  })}
                  {t(`orders.paymentStatus${status.charAt(0).toUpperCase() + status.slice(1)}`)}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
      </div>

      {/* تنبيهات للدفع عند الاستلام */}
      {paymentType === "cash_on_delivery" && (
        <div className="text-xs text-gray-600 space-y-1">
          {orderStatus !== "delivered" && (
            <p className="text-amber-600">
              {dir === "rtl" 
                ? "⚠️ لا يمكن تحديث حالة الدفع قبل تسليم الطلب"
                : "⚠️ Payment status cannot be updated before delivery"
              }
            </p>
          )}
          {orderStatus === "delivered" && selectedStatus === "pending" && (
            <p className="text-blue-600">
              {dir === "rtl"
                ? "💡 يمكنك الآن تحديث حالة الدفع بعد التسليم"
                : "💡 You can now update payment status after delivery"
              }
            </p>
          )}
        </div>
      )}
    </div>
  );
}
