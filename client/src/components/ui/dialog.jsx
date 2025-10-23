import React from "react";

export function Dialog({ open, onOpenChange, children }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export function DialogContent({ children, className = "" }) {
  return <div className={`space-y-4 ${className}`}>{children}</div>;
}

export function DialogHeader({ children }) {
  return <div className="border-b pb-2 mb-4">{children}</div>;
}

export function DialogTitle({ children }) {
  return <h2 className="text-xl font-semibold">{children}</h2>;
}

export function DialogDescription({ children }) {
  return <p className="text-gray-600">{children}</p>;
}

export function DialogTrigger({ asChild, children }) {
  return children;
}
