import React from "react";

export function Select({ value, onValueChange, children }) {
  return (
    <div className="relative w-full">
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { value, onValueChange })
      )}
    </div>
  );
}

export function SelectTrigger({ children, className = "", ...props }) {
  return (
    <button
      type="button"
      className={`border rounded-lg px-3 py-2 w-full text-left focus:outline-none focus:ring-2 focus:ring-blue-400 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function SelectContent({ children, className = "" }) {
  return <div className={`mt-2 border rounded-lg bg-white shadow ${className}`}>{children}</div>;
}

export function SelectItem({ value, children, onValueChange }) {
  return (
    <div
      onClick={() => onValueChange(value)}
      className="px-3 py-2 cursor-pointer hover:bg-gray-100"
    >
      {children}
    </div>
  );
}

export function SelectValue({ placeholder }) {
  return <span className="text-gray-700">{placeholder}</span>;
}
