'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  actionLabel?: string;
  variant?: 'default' | 'destructive';
}

export function ConfirmationModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  actionLabel = 'Confirm',
  variant = 'default',
}: ConfirmationModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="bg-[#1E293B] border-slate-700">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-slate-100">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-400">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-slate-700 text-slate-200 hover:bg-slate-600 border-slate-600">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={
              variant === 'destructive'
                ? 'bg-red-900 text-red-100 hover:bg-red-800'
                : 'bg-blue-900 text-blue-100 hover:bg-blue-800'
            }
          >
            {actionLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
