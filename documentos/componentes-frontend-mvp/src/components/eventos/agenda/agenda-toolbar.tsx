"use client"

import { ChevronLeft, ChevronRight, Check, ChevronDown, ChevronUp } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { ViewMode } from "./agenda-eventos"
import { MonthYearPicker } from "./month-year-picker"
import { Switch } from "@/components/ui/switch"

import { ButtonBack } from "@/components/layouts/ui/buttons/button-back/button-back"

import { useState, useRef, useEffect } from "react"

interface AgendaToolbarProps {
    currentDate: Date
    onPreviousMonth: () => void
    onNextMonth: () => void
    onFilterChange: (filter: string) => void
    onDateChange: (date: Date) => void
    availableThemes: string[]
    selectedThemes: string[]
    onThemeChange: (themes: string[]) => void
    showEstrategicos: boolean
    onShowEstrategicosChange: (show: boolean) => void
    isPublic?: boolean
}

export function AgendaToolbar({
    currentDate,
    onPreviousMonth,
    onNextMonth,
    onFilterChange,
    onDateChange,
    availableThemes,
    selectedThemes,
    onThemeChange,
    showEstrategicos,
    onShowEstrategicosChange,
    isPublic = false,
}: AgendaToolbarProps) {
    const [isThemeOpen, setIsThemeOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsThemeOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            onThemeChange([...availableThemes])
        } else {
            onThemeChange([])
        }
    }

    const handleThemeToggle = (theme: string) => {
        if (selectedThemes.includes(theme)) {
            onThemeChange(selectedThemes.filter(t => t !== theme))
        } else {
            onThemeChange([...selectedThemes, theme])
        }
    }

    const isAllSelected = availableThemes.length > 0 && selectedThemes.length === availableThemes.length
    const isIndeterminate = selectedThemes.length > 0 && selectedThemes.length < availableThemes.length

    return (
        <div className="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4 w-full">

            {/* 1. Logo + Date Navigation (Left) */}
            <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4 w-full md:w-auto">
                <div className="flex items-center gap-3">
                    {isPublic && <ButtonBack url="/eventos" className="shrink-0" />}
                    <img
                        src="/logo-cnc.png"
                        alt="CNC Sesc Senac"
                        className="block h-16 w-auto shrink-0 -translate-y-1 md:-translate-y-2.5"
                    />
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
                    <button
                        onClick={onPreviousMonth}
                        className="p-1 text-brand-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ChevronLeft size={24} strokeWidth={2.5} />
                    </button>

                    <MonthYearPicker
                        currentDate={currentDate}
                        onDateChange={onDateChange}
                    />

                    <button
                        onClick={onNextMonth}
                        className="p-1 text-brand-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ChevronRight size={24} strokeWidth={2.5} />
                    </button>
                </div>
            </div>

            {/* 2. Temática Filter and Strategico Toggle (Right) */}
            <div className="flex items-center gap-4 w-full md:w-auto justify-end relative" ref={dropdownRef}>
                <div className="flex items-center space-x-2 mr-2">
                    <Switch
                        id="estrategicos-mode"
                        checked={showEstrategicos}
                        onCheckedChange={onShowEstrategicosChange}
                        className="scale-90"
                    />
                    <label
                        htmlFor="estrategicos-mode"
                        className="text-[10px] font-bold text-gray-500 uppercase cursor-pointer"
                    >
                        Apenas Estratégicos
                    </label>
                </div>
                <button
                    onClick={() => setIsThemeOpen(!isThemeOpen)}
                    className={cn(
                        "flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold border rounded-full transition-colors uppercase",
                        isThemeOpen || selectedThemes.length > 0 && selectedThemes.length < availableThemes.length
                            ? "text-[#004a8d] border-[#004a8d] bg-blue-50"
                            : "text-brand-gray-500 border-brand-gray-500 hover:bg-brand-blue-50"
                    )}
                >
                    Temática
                    {isThemeOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>

                {isThemeOpen && (
                    <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Escolha a Temática</h4>
                            <button onClick={() => setIsThemeOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <ChevronUp size={14} />
                            </button>
                        </div>

                        <div className="space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                            {/* Select All */}
                            <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors select-none">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        className="peer appearance-none w-5 h-5 border border-gray-300 rounded checked:bg-[#004a8d] checked:border-[#004a8d] transition-colors"
                                        checked={isAllSelected}
                                        ref={input => {
                                            if (input) input.indeterminate = isIndeterminate;
                                        }}
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                    />
                                    <Check size={14} className="absolute left-0.5 top-0.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                                    {isIndeterminate && !isAllSelected && (
                                        <div className="absolute left-1 top-2 w-3 h-0.5 bg-[#004a8d] pointer-events-none"></div>
                                    )}
                                </div>
                                <span className={cn("text-sm font-medium", isAllSelected ? "text-[#004a8d]" : "text-gray-600")}>
                                    Todos
                                </span>
                            </label>

                            <div className="h-px bg-gray-100 my-1 mx-2"></div>

                            {/* Individual Options */}
                            {availableThemes.map(theme => {
                                const isSelected = selectedThemes.includes(theme)
                                return (
                                    <label key={theme} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors select-none">
                                        <div className="relative flex items-center">
                                            <input
                                                type="checkbox"
                                                className="peer appearance-none w-5 h-5 border border-gray-300 rounded checked:bg-[#004a8d] checked:border-[#004a8d] transition-colors"
                                                checked={isSelected}
                                                onChange={() => handleThemeToggle(theme)}
                                            />
                                            <Check size={14} className="absolute left-0.5 top-0.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                                        </div>
                                        <span className={cn("text-sm font-medium truncate", isSelected ? "text-[#004a8d]" : "text-gray-600")}>
                                            {theme}
                                        </span>
                                    </label>
                                )
                            })}

                            {availableThemes.length === 0 && (
                                <p className="text-xs text-gray-400 text-center py-2">Nenhuma temática disponível</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
