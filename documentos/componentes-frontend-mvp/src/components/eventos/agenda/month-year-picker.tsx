"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from "lucide-react"
import { format, setMonth, setYear, addYears, subYears } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface MonthYearPickerProps {
    currentDate: Date
    onDateChange: (date: Date) => void
}

export function MonthYearPicker({ currentDate, onDateChange }: MonthYearPickerProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [viewYear, setViewYear] = useState(currentDate.getFullYear())
    const containerRef = useRef<HTMLDivElement>(null)

    // Sync view year when popover opens
    useEffect(() => {
        if (isOpen) {
            setViewYear(currentDate.getFullYear())
        }
    }, [isOpen, currentDate])

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleMonthSelect = (monthIndex: number) => {
        let newDate = new Date(currentDate)
        newDate = setYear(newDate, viewYear)
        newDate = setMonth(newDate, monthIndex)

        // Handle end of month edge cases (e.g. Feb 30)
        if (newDate.getMonth() !== monthIndex) {
            newDate.setDate(0)
        }

        onDateChange(newDate)
        setIsOpen(false)
    }

    const handlePrevYear = () => setViewYear(prev => prev - 1)
    const handleNextYear = () => setViewYear(prev => prev + 1)

    const months = [
        "JAN", "FEV", "MAR", "ABR", "MAI", "JUN",
        "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"
    ]

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 text-brand-blue-600 font-bold uppercase rounded-full hover:bg-brand-blue-50 transition-colors"
            >
                <span className="text-sm md:text-base tracking-wide">
                    {format(currentDate, "MMMM yyyy", { locale: ptBR })}
                </span>
                <ChevronDown
                    size={16}
                    className={cn("transition-transform duration-200", isOpen ? "rotate-180" : "")}
                />
            </button>

            {isOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 w-[280px] bg-white rounded-3xl shadow-xl border border-gray-100 p-6 animate-in fade-in zoom-in-95 duration-200">
                    {/* Header: Year Navigation */}
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={handlePrevYear}
                            className="p-1 text-gray-400 hover:text-brand-blue-600 hover:bg-brand-blue-50 rounded-full transition-colors"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <span className="text-lg font-bold text-brand-blue-600">
                            {viewYear}
                        </span>
                        <button
                            onClick={handleNextYear}
                            className="p-1 text-gray-400 hover:text-brand-blue-600 hover:bg-brand-blue-50 rounded-full transition-colors"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    {/* Body: Month Grid */}
                    <div className="grid grid-cols-3 gap-y-4 gap-x-2">
                        {months.map((month, index) => {
                            const isSelected =
                                currentDate.getMonth() === index &&
                                currentDate.getFullYear() === viewYear

                            return (
                                <button
                                    key={month}
                                    onClick={() => handleMonthSelect(index)}
                                    className={cn(
                                        "text-[10px] font-bold py-2 rounded-lg transition-all",
                                        isSelected
                                            ? "cnc-bg-primary-800 text-white shadow-md transform scale-105"
                                            : "text-gray-400 hover:text-brand-blue-600 hover:bg-gray-50 bg-transparent"
                                    )}
                                >
                                    {month}
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
