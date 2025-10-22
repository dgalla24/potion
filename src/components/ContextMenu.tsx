'use client';

import { useEffect, useRef } from 'react';
import { Trash2, Copy, Clipboard } from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  onDelete?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onClose: () => void;
}

export default function ContextMenu({ x, y, onDelete, onCopy, onPaste, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleDelete = () => {
    onDelete?.();
    onClose();
  };

  const handleCopy = () => {
    onCopy?.();
    onClose();
  };

  const handlePaste = () => {
    onPaste?.();
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="fixed bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50 min-w-32"
      style={{ left: x, top: y }}
    >
      {onCopy && (
        <button
          onClick={handleCopy}
          className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
        >
          <Copy className="w-4 h-4" />
          <span>Copy</span>
        </button>
      )}
      {onPaste && (
        <button
          onClick={handlePaste}
          className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
        >
          <Clipboard className="w-4 h-4" />
          <span>Paste</span>
        </button>
      )}
      {onDelete && (
        <button
          onClick={handleDelete}
          className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete</span>
        </button>
      )}
    </div>
  );
}