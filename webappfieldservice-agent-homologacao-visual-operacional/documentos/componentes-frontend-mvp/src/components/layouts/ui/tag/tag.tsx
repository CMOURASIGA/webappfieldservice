import Link from "next/link";
import React from "react";

export type LabelProps = {
  className?: string;
  children: string | number | null | React.ReactElement;
};

const Tag: React.FC<LabelProps> = ({ children, className }) => {
  return (
    <div
      className={`border rounded-[4px] px-1.5 flex items-center justify-content-center ${className}`}
    >
      {children}
    </div>
  );
};

export default Tag;
