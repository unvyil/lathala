import React, { useState, useRef, useEffect, useCallback } from 'react';

interface ScrubbableNumberInputProps {
  label?: string | React.ReactNode;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  className?: string;
  title?: string;
  sensitivity?: number; // pixels of pointer movement per step
}

export function ScrubbableNumberInput({
  label,
  value,
  onChange,
  min = -9999,
  max = 9999,
  step = 1,
  suffix = '',
  className = '',
  title,
  sensitivity = 2,
}: ScrubbableNumberInputProps) {
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubDelta, setScrubDelta] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [textValue, setTextValue] = useState(String(value));

  const startPointerX = useRef(0);
  const initialValue = useRef(value);
  const activePointerId = useRef<number | null>(null);

  // Sync internal text state with external value when not manually editing
  useEffect(() => {
    if (!isEditing && !isScrubbing) {
      setTextValue(String(value));
    }
  }, [value, isEditing, isScrubbing]);

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only left click initiates scrub
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();

    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);
    activePointerId.current = e.pointerId;

    startPointerX.current = e.clientX;
    initialValue.current = value;
    setIsScrubbing(true);
    setScrubDelta(0);
  };

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isScrubbing) return;
      e.preventDefault();

      const dx = e.clientX - startPointerX.current;
      // Modifier keys: Shift = 10x, Alt = 0.1x
      let currentStep = step;
      if (e.shiftKey) currentStep = step * 10;
      else if (e.altKey) currentStep = Math.max(0.1, step * 0.1);

      const stepsMoved = Math.round(dx / sensitivity);
      const deltaAmount = stepsMoved * currentStep;

      let newValue = initialValue.current + deltaAmount;
      if (min !== undefined) newValue = Math.max(min, newValue);
      if (max !== undefined) newValue = Math.min(max, newValue);

      // Round to 1 decimal place if fine step, else integers
      const rounded = currentStep < 1 ? Math.round(newValue * 10) / 10 : Math.round(newValue);
      setScrubDelta(stepsMoved);
      onChange(rounded);
    },
    [isScrubbing, step, min, max, sensitivity, onChange],
  );

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isScrubbing) return;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if already released
    }
    setIsScrubbing(false);
    setScrubDelta(0);
    activePointerId.current = null;
  };

  const handleInputBlur = () => {
    setIsEditing(false);
    const parsed = parseFloat(textValue);
    if (!isNaN(parsed)) {
      let constrained = parsed;
      if (min !== undefined) constrained = Math.max(min, constrained);
      if (max !== undefined) constrained = Math.min(max, constrained);
      onChange(constrained);
    } else {
      setTextValue(String(value));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const mult = e.shiftKey ? 10 : 1;
      onChange(Math.min(max, value + step * mult));
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const mult = e.shiftKey ? 10 : 1;
      onChange(Math.max(min, value - step * mult));
    } else if (e.key === 'Escape') {
      setTextValue(String(value));
      setIsEditing(false);
    }
  };

  return (
    <div
      title={title || 'Drag left/right to scrub value, click to edit'}
      className={`group relative flex items-center h-8 rounded-lg bg-onyx/70 border border-white/10 hover:border-white/25 focus-within:border-accent transition-colors ${className}`}
    >
      {/* Figma Scrub Handle / Label */}
      {label && (
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="flex items-center justify-center pl-2.5 pr-1.5 h-full text-[11px] font-mono font-medium text-parchment/50 hover:text-parchment select-none cursor-ew-resize transition-colors"
        >
          {label}
        </div>
      )}

      {/* Editable Number Input */}
      <input
        type="text"
        value={isEditing ? textValue : `${value}${suffix}`}
        onFocus={() => {
          setIsEditing(true);
          setTextValue(String(value));
        }}
        onChange={(e) => setTextValue(e.target.value)}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        className="w-full h-full bg-transparent px-2 text-xs font-mono text-parchment focus:outline-none select-text"
      />

      {/* Figma Scrub Indicator Badge */}
      {isScrubbing && (
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-accent text-white font-mono text-[10px] font-bold shadow-md pointer-events-none flex items-center gap-1 z-50 whitespace-nowrap animate-in fade-in duration-100">
          <span>◄</span>
          <span>{scrubDelta > 0 ? `+${scrubDelta}` : scrubDelta}</span>
          <span>►</span>
        </div>
      )}
    </div>
  );
}
