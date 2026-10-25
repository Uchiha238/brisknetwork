import React, { useState, useRef, useEffect } from 'react';

/**
 * AutocompleteInput - A rock-solid combobox input that provides:
 * 1. Scrollable dropdown list of matching options as you type (supports mousewheel & arrow scroll).
 * 2. Instant Tab or Enter autoselect (selects highlighted item or top matching item).
 * 3. ArrowUp / ArrowDown keyboard navigation.
 * 4. Reliable mouse selection via onMouseDown.
 * 5. Full compatibility with React controlled state and uppercase typing.
 */
export function AutocompleteInput({
  name,
  value = '',
  onChange,
  onSelect,
  options = [], // Array of string values OR objects { value, label }
  getBestMatch, // Optional fallback matching function (query) => bestString
  placeholder = '',
  className = '',
  disabled = false,
  readOnly = false,
  tabIndex,
  inputRef: externalRef
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const internalRef = useRef(null);
  const inputRef = externalRef || internalRef;
  const listRef = useRef(null);

  // Normalize options to { value, label }
  const normalizedOptions = React.useMemo(() => {
    return (options || []).map(opt => {
      if (typeof opt === 'string') {
        return { value: opt, label: opt };
      }
      return { 
        value: opt.value || opt.code || '', 
        label: opt.label || opt.name || opt.value || opt.code || '' 
      };
    });
  }, [options]);

  // Filter options based on typed input
  const filteredOptions = React.useMemo(() => {
    const q = (value || '').trim().toUpperCase();
    if (!q) {
      return normalizedOptions;
    }
    
    // Exact match
    const exact = normalizedOptions.filter(o => o.value.toUpperCase() === q);
    
    // Starts with in value
    const startsWithValue = normalizedOptions.filter(o => 
      o.value.toUpperCase() !== q && o.value.toUpperCase().startsWith(q)
    );
    
    // Starts with in label
    const startsWithLabel = normalizedOptions.filter(o => 
      !o.value.toUpperCase().startsWith(q) && o.label.toUpperCase().startsWith(q)
    );
    
    // Contains in value or label
    const contains = normalizedOptions.filter(o => 
      !o.value.toUpperCase().startsWith(q) && 
      !o.label.toUpperCase().startsWith(q) && 
      (o.value.toUpperCase().includes(q) || o.label.toUpperCase().includes(q))
    );
    
    return [...exact, ...startsWithValue, ...startsWithLabel, ...contains];
  }, [normalizedOptions, value]);

  // Ensure highlighted item is visible in the scrollable container
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const items = listRef.current.children;
      if (items && items[highlightedIndex]) {
        items[highlightedIndex].scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  const selectOption = (opt) => {
    if (!opt) return;
    const selectedVal = typeof opt === 'string' ? opt : opt.value;
    
    if (onChange) {
      onChange({
        target: {
          name,
          value: selectedVal
        }
      });
    }
    if (onSelect) {
      onSelect(selectedVal, opt);
    }
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (disabled || readOnly) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
      setHighlightedIndex(prev => 
        prev < filteredOptions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
    } else if (e.key === 'Tab') {
      // User pressed Tab! Autoselect the matching option
      if (filteredOptions.length > 0) {
        let chosen = null;
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          chosen = filteredOptions[highlightedIndex];
        } else if (getBestMatch) {
          const best = getBestMatch(value);
          if (best) {
            chosen = normalizedOptions.find(o => o.value.toUpperCase() === best.toUpperCase()) || { value: best, label: best };
          }
        }
        
        if (!chosen && filteredOptions.length > 0) {
          chosen = filteredOptions[0];
        }

        if (chosen) {
          selectOption(chosen);
        }
      } else if (getBestMatch) {
        const best = getBestMatch(value);
        if (best) {
          selectOption({ value: best, label: best });
        }
      }
      setIsOpen(false);
      // DO NOT prevent default so focus naturally tabs to next field!
    } else if (e.key === 'Enter') {
      if (filteredOptions.length > 0) {
        e.preventDefault();
        let chosen = highlightedIndex >= 0 && highlightedIndex < filteredOptions.length
          ? filteredOptions[highlightedIndex]
          : filteredOptions[0];
        if (chosen) {
          selectOption(chosen);
        }
      }
      setIsOpen(false);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleInputChange = (e) => {
    if (onChange) {
      onChange(e);
    }
    setIsOpen(true);
    setHighlightedIndex(0); // Highlight top match by default as user types
  };

  const handleBlur = () => {
    // Small timeout to allow onMouseDown on suggestions to execute first
    setTimeout(() => {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }, 200);
  };

  return (
    <div className="relative w-full h-full">
      <input
        ref={inputRef}
        type="text"
        name={name}
        value={value}
        onChange={handleInputChange}
        onFocus={() => {
          setIsOpen(true);
          setHighlightedIndex(filteredOptions.length > 0 ? 0 : -1);
        }}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        tabIndex={tabIndex}
        autoComplete="off"
        className={className || "w-full h-full px-1 border border-slate-300 text-[10px] font-bold uppercase outline-none focus:border-blue-500 bg-[#fcfcfc] focus:bg-white"}
      />

      {isOpen && !readOnly && !disabled && filteredOptions.length > 0 && (
        <div
          ref={listRef}
          className="absolute left-0 right-0 top-full mt-0.5 bg-white border border-slate-300 rounded shadow-xl max-h-48 overflow-y-auto z-[9999] text-[9px] text-slate-800 font-bold uppercase"
        >
          {filteredOptions.map((opt, idx) => (
            <div
              key={`${opt.value}-${idx}`}
              onMouseDown={(e) => {
                e.preventDefault(); // Prevents blur before selection
                selectOption(opt);
              }}
              onMouseEnter={() => setHighlightedIndex(idx)}
              className={`px-2 py-1.5 cursor-pointer border-b border-slate-100 flex items-center justify-between transition-colors ${
                idx === highlightedIndex ? 'bg-blue-600 text-white font-black' : 'hover:bg-blue-50'
              }`}
            >
              <span>{opt.label}</span>
              {opt.value !== opt.label && (
                <span className={`text-[8px] ml-2 ${idx === highlightedIndex ? 'text-blue-100' : 'text-slate-400'}`}>
                  {opt.value}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
