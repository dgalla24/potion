'use client';

import { usePotion } from '@/hooks/usePotion';
import { useEffect } from 'react';

interface DragSelectionProps {
  containerRef?: React.RefObject<HTMLElement>;
}

export default function DragSelection({ containerRef }: DragSelectionProps) {
  const { isDragging, dragStartPos, dragCurrentPos, selectMultipleItems } = usePotion();

  useEffect(() => {
    if (!isDragging || !dragStartPos || !dragCurrentPos || !containerRef?.current) {
      return;
    }

    // Calculate selection rectangle
    const left = Math.min(dragStartPos.x, dragCurrentPos.x);
    const top = Math.min(dragStartPos.y, dragCurrentPos.y);
    const right = Math.max(dragStartPos.x, dragCurrentPos.x);
    const bottom = Math.max(dragStartPos.y, dragCurrentPos.y);

    // Find all selectable items (assignments and tasks)
    const selectableItems = containerRef.current.querySelectorAll('[data-item-id]');
    const selectedIds: string[] = [];

    selectableItems.forEach((item) => {
      const rect = item.getBoundingClientRect();
      const itemId = item.getAttribute('data-item-id');

      if (itemId &&
          rect.left < right &&
          rect.right > left &&
          rect.top < bottom &&
          rect.bottom > top) {
        selectedIds.push(itemId);
      }
    });

    selectMultipleItems(selectedIds);
  }, [isDragging, dragStartPos, dragCurrentPos, containerRef, selectMultipleItems]);

  if (!isDragging || !dragStartPos || !dragCurrentPos) {
    return null;
  }

  // Calculate selection rectangle
  const left = Math.min(dragStartPos.x, dragCurrentPos.x);
  const top = Math.min(dragStartPos.y, dragCurrentPos.y);
  const width = Math.abs(dragCurrentPos.x - dragStartPos.x);
  const height = Math.abs(dragCurrentPos.y - dragStartPos.y);

  return (
    <div
      className="fixed pointer-events-none bg-blue-200 dark:bg-blue-800 bg-opacity-30 border-2 border-blue-500 dark:border-blue-400 border-dashed rounded-lg z-50"
      style={{
        left: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
        height: `${height}px`,
      }}
    />
  );
}