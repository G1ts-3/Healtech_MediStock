import React, { useState, useRef } from 'react';
import { Calendar, ChevronDown, RotateCcw } from 'lucide-react';

export default function DatePickerButton({ initialDate, onDateChange, className = "" }) {
  const getTodayIso = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState(() => {
    if (initialDate) {
      if (initialDate instanceof Date) {
        return initialDate.toISOString().split('T')[0];
      }
      return initialDate;
    }
    return getTodayIso();
  });

  const inputRef = useRef(null);
  const todayIso = getTodayIso();
  const isToday = selectedDate === todayIso;

  const formatDateDisplay = (isoStr) => {
    if (!isoStr) return '';
    const [year, month, day] = isoStr.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    return dateObj.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    if (newDate) {
      setSelectedDate(newDate);
      if (onDateChange) {
        onDateChange(newDate);
      }
    }
  };

  const handleResetToday = (e) => {
    e.stopPropagation();
    const tIso = getTodayIso();
    setSelectedDate(tIso);
    if (onDateChange) {
      onDateChange(tIso);
    }
  };

  const triggerPicker = () => {
    if (inputRef.current) {
      if (typeof inputRef.current.showPicker === 'function') {
        try {
          inputRef.current.showPicker();
        } catch (err) {
          // fallback to focus/click
          inputRef.current.focus();
        }
      }
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        onClick={triggerPicker}
        className="relative flex items-center gap-2 bg-white px-3.5 py-2 rounded-lg border border-gray-200 shadow-sm hover:border-primary-light hover:shadow transition-all cursor-pointer group"
      >
        <Calendar className="w-4 h-4 text-primary group-hover:scale-110 transition-transform shrink-0" />
        <span className="text-sm font-medium text-text select-none">
          {formatDateDisplay(selectedDate)}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors shrink-0" />
        <input
          ref={inputRef}
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
        />
      </div>

      {!isToday && (
        <button
          type="button"
          onClick={handleResetToday}
          title="Kembali ke Hari Ini"
          className="flex items-center gap-1 px-2.5 py-2 bg-gray-100 hover:bg-primary-light hover:text-white text-gray-600 rounded-lg text-xs font-medium transition-all shadow-sm"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Hari Ini</span>
        </button>
      )}
    </div>
  );
}
