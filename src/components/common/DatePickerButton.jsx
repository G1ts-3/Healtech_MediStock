import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

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

  const [isOpen, setIsOpen] = useState(false);
  const [isIconWiggling, setIsIconWiggling] = useState(false);

  const parseIsoToDate = (isoStr) => {
    if (!isoStr) return new Date();
    const [year, month, day] = isoStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const [viewDate, setViewDate] = useState(() => parseIsoToDate(selectedDate));
  const containerRef = useRef(null);

  const todayIso = getTodayIso();
  const isToday = selectedDate === todayIso;

  const MONTH_NAMES = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const togglePopover = () => {
    if (!isOpen) {
      setViewDate(parseIsoToDate(selectedDate));
      setIsIconWiggling(true);
      setTimeout(() => setIsIconWiggling(false), 400);
    }
    setIsOpen(prev => !prev);
  };

  const handleSelectDate = (isoStr) => {
    setSelectedDate(isoStr);
    if (onDateChange) {
      onDateChange(isoStr);
    }
    setIsOpen(false);
  };

  const handleResetToday = (e) => {
    e.stopPropagation();
    const tIso = getTodayIso();
    setSelectedDate(tIso);
    setViewDate(parseIsoToDate(tIso));
    if (onDateChange) {
      onDateChange(tIso);
    }
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const generateCalendarDays = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];

    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevMonthDate = new Date(year, month - 1, dayNum);
      const isoStr = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      days.push({ dayNum, isCurrentMonth: false, isoStr });
    }

    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const isoStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dayNum: d, isCurrentMonth: true, isoStr });
    }

    const totalCells = days.length > 35 ? 42 : 35;
    const remainingCells = totalCells - days.length;
    for (let d = 1; d <= remainingCells; d++) {
      const nextMonthDate = new Date(year, month + 1, d);
      const isoStr = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dayNum: d, isCurrentMonth: false, isoStr });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  return (
    <div ref={containerRef} className={`relative flex items-center gap-2 ${className}`}>
      
      <button
        type="button"
        onClick={togglePopover}
        className={`relative flex items-center gap-2 bg-white px-3.5 py-2 rounded-lg border shadow-sm hover:border-primary-light hover:shadow transition-all cursor-pointer group ${
          isOpen ? 'border-primary ring-2 ring-primary/20 shadow-md' : 'border-gray-200'
        }`}
      >
        <Calendar className={`w-4 h-4 text-primary group-hover:scale-110 transition-transform shrink-0 ${isIconWiggling ? 'animate-icon-bounce' : ''}`} />
        <span className="text-sm font-medium text-text select-none">
          {formatDateDisplay(selectedDate)}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 group-hover:text-primary transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
      </button>

      {!isToday && (
        <button
          type="button"
          onClick={handleResetToday}
          title="Kembali ke Hari Ini"
          className="flex items-center gap-1 px-2.5 py-2 bg-gray-100 hover:bg-primary-light hover:text-white text-gray-600 rounded-lg text-xs font-medium transition-all shadow-sm active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Hari Ini</span>
        </button>
      )}

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-50 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 w-72 md:w-80 animate-calendar-open transform origin-top-right">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-primary transition-colors active:scale-90"
              title="Bulan Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-sm font-bold text-gray-800 tracking-wide select-none">
              {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-primary transition-colors active:scale-90"
              title="Bulan Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {DAY_NAMES.map((day, idx) => (
              <span key={idx} className="text-xs font-semibold text-gray-400 py-1 select-none">
                {day}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((cell, idx) => {
              const isSelected = cell.isoStr === selectedDate;
              const isCellToday = cell.isoStr === todayIso;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectDate(cell.isoStr)}
                  className={`h-9 rounded-xl text-xs font-medium flex items-center justify-center transition-all duration-150 select-none relative ${
                    isSelected
                      ? 'bg-primary text-white font-bold shadow-md shadow-primary/30 scale-105 z-10'
                      : isCellToday
                      ? 'bg-blue-50 text-primary font-bold border border-primary/40 hover:bg-primary-light hover:text-white'
                      : cell.isCurrentMonth
                      ? 'text-gray-700 hover:bg-gray-100 hover:text-primary'
                      : 'text-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {cell.dayNum}
                  {isCellToday && !isSelected && (
                    <span className="absolute bottom-1 w-1 h-1 bg-primary rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100 text-xs">
            <button
              type="button"
              onClick={handleResetToday}
              className="text-primary hover:text-primary-dark font-medium transition-colors hover:underline"
            >
              Pilih Hari Ini
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
