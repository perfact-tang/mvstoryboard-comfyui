import React, { useState, useEffect, useRef } from 'react';

interface EditableTextProps {
  value: string;
  onSave: (value: string) => void;
  className?: string; // Class for the display element
  textareaClassName?: string; // Class for the textarea element
  placeholder?: string;
}

export const EditableText: React.FC<EditableTextProps> = ({
  value,
  onSave,
  className = '',
  textareaClassName = '',
  placeholder = '双击编辑...',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      // Cursor at end
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (localValue !== value) {
      onSave(localValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsEditing(false);
      setLocalValue(value); // Revert
    }
  };

  if (isEditing) {
    return (
      <textarea
        ref={textareaRef}
        className={`resize-none outline-none focus:ring-2 focus:ring-blue-500 rounded-md p-2 ${textareaClassName}`}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
      />
    );
  }

  return (
    <div
      className={`cursor-text whitespace-pre-wrap ${className}`}
      onDoubleClick={handleDoubleClick}
      title="双击编辑"
    >
      {value || <span className="text-gray-400 italic">{placeholder}</span>}
    </div>
  );
};
