"use client";

import type React from "react";
import { useRef, useEffect } from "react";
import { AlertTriangle, LoaderCircle, X } from "lucide-react";

interface DeleteJobDialogProps {
  isOpen: boolean;
  jobTitle: string;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteJobDialog({
  isOpen,
  jobTitle,
  loading,
  onClose,
  onConfirm,
}: DeleteJobDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  // Handle escape key press to close the dialog
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Focus the cancel button when the dialog opens
  useEffect(() => {
    if (isOpen && cancelButtonRef.current) {
      cancelButtonRef.current.focus();
    }
  }, [isOpen]);

  // Prevent clicks inside the dialog from closing it
  const handleDialogClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby="delete-dialog-title"
    >
      <div
        ref={dialogRef}
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg"
        onClick={handleDialogClick}
      >
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center">
            <AlertTriangle className="mr-2 h-6 w-6 text-[#8b5d3b]" />
            <h2
              id="delete-dialog-title"
              className="text-xl font-semibold text-[#2d2418]"
            >
              Confirm Deletion
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6">
          <p className="mb-2 text-[#2d2418]">
            Are you sure you want to delete this job?
          </p>
          <p className="font-medium text-[#2d2418]">"{jobTitle}"</p>
          <p className="mt-2 text-sm text-gray-600">
            This action cannot be undone. The job will be permanently removed
            from your account.
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <button
            ref={cancelButtonRef}
            onClick={onClose}
            className="rounded-md bg-[#e9e4d8] px-4 py-2 text-[#2d2418] transition-colors hover:bg-[#dfd9c9]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-md bg-[#8b5d3b] px-4 py-2 text-white transition-colors hover:bg-[#7a4d2e]"
          >
            {!loading && <p>Delete</p>}
            {loading && <LoaderCircle className="animate-spin" />}
          </button>
        </div>
      </div>
    </div>
  );
}
