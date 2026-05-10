"use client";

import type { ReactNode } from "react";

type FormAction = (formData: FormData) => void | Promise<void>;

export function ConfirmSubmitForm({
  action,
  confirmMessage,
  className,
  children,
}: {
  action: FormAction;
  confirmMessage: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <form
      action={action}
      className={className}
      onSubmit={(e) => {
        if (typeof window !== "undefined" && !window.confirm(confirmMessage)) {
          e.preventDefault();
        }
      }}
    >
      {children}
    </form>
  );
}
