import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyButtonProps {
  text: string;
  className?: string;
  label?: React.ReactNode;
}

export const CopyButton: React.FC<CopyButtonProps> = ({ text, className, label }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button onClick={handleCopy} className={className}>
      {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
      {label && <span className="ml-1">{label}</span>}
    </button>
  );
};
