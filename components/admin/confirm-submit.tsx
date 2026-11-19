"use client";

import type { ReactNode } from "react";

type ConfirmSubmitProps = {
  action: (formData: FormData) => Promise<void>;
  id: string;
  message: string;
  className?: string;
  children: ReactNode;
};

export function ConfirmSubmit({
  action,
  id,
  message,
  className,
  children,
}: ConfirmSubmitProps) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(message)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className={className}>
        {children}
      </button>
    </form>
  );
}
