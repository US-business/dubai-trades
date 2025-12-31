import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/shadcnUI/alert-dialog"
import { cn } from "@/lib/utils"
import type { Dictionary } from "@/lib/i18n/dictionary-types"

interface RemoveConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  dir: "ltr" | "rtl"
  dictionary: Dictionary
}

export default function RemoveConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  dir,
  dictionary,
}: RemoveConfirmationDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className={cn(dir === "rtl" && "text-right")}>
            {dir === "rtl" ? "تأكيد الحذف" : "Confirm Remove"}
          </AlertDialogTitle>
          <AlertDialogDescription className={cn(dir === "rtl" && "text-right")}>
            {dir === "rtl"
              ? "هل أنت متأكد من حذف هذا المنتج من قائمة الأمنيات؟"
              : "Are you sure you want to remove this product from your wishlist?"}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className={cn(dir === "rtl" && "flex-row-reverse")}>
          <AlertDialogCancel>{dictionary.common.cancel}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            {dictionary.common.delete}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
