'use client'

import { useState } from 'react'

interface Unit {
    id: string
    name: string
}

interface UnitFilterBarProps {
    units: Unit[]
    selectedUnitId: string | null
    onSelect: (id: string | null) => void
}

export function UnitFilterBar({ units, selectedUnitId, onSelect }: UnitFilterBarProps) {
    return (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
                onClick={() => onSelect(null)}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-all ${selectedUnitId === null
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                    }`}
            >
                ทั้งหมด
            </button>
            {units.map((unit) => (
                <button
                    key={unit.id}
                    onClick={() => onSelect(unit.id)}
                    className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-all ${selectedUnitId === unit.id
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                        }`}
                >
                    {unit.name}
                </button>
            ))}
        </div>
    )
}
