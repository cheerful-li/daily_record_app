import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog"

interface ConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
}

export function ConfirmDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = "确认",
  cancelText = "取消",
  variant = "default",
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText}</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            className={variant === "destructive" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [callback, setCallback] = useState<() => void>(() => {})
  const [dialogProps, setDialogProps] = useState<Omit<ConfirmDialogProps, 'isOpen' | 'onOpenChange' | 'onConfirm'>>({
    title: "确认操作",
    description: "您确定要执行此操作吗？",
    confirmText: "确认",
    cancelText: "取消",
    variant: "default",
  })
  
  const confirm = (options: {
    onConfirm: () => void;
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "default" | "destructive";
  }) => {
    setCallback(() => options.onConfirm)
    setDialogProps({
      title: options.title || "确认操作",
      description: options.description || "您确定要执行此操作吗？",
      confirmText: options.confirmText || "确认",
      cancelText: options.cancelText || "取消",
      variant: options.variant || "default",
    })
    setIsOpen(true)
  }

  const dialog = (
    <ConfirmDialog
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      onConfirm={callback}
      {...dialogProps}
    />
  )

  return { confirm, dialog }
}