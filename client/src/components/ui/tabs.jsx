import React, { useState } from "react";

export function Tabs({ defaultValue, children, className = "" }) {
  const [value, setValue] = useState(defaultValue);
  return (
    <div className={className}>
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { value, setValue })
      )}
    </div>
  );
}

export function TabsList({ children, className = "" }) {
  return <div className={`flex space-x-2 mb-4 ${className}`}>{children}</div>;
}

export function TabsTrigger({ value, setValue, children, className = "" }) {
  return (
    <button
      onClick={() => setValue(value)}
      className={`flex-1 py-2 text-sm font-medium border-b-2 ${
        className || ""
      } ${setValue ? "border-blue-500 text-blue-600" : "border-gray-200 text-gray-600"}`}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, setValue }) {
  return <div>{children}</div>;
}
