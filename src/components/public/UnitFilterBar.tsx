'use client'

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
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
                onClick={() => onSelect(null)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${selectedUnitId === null
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-sm'
                    }`}
            >
                ทั้งหมด
            </button>
            {units.map((unit) => (
                <button
                    key={unit.id}
                    onClick={() => onSelect(unit.id)}
                    className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${selectedUnitId === unit.id
                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25'
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-sm'
                        }`}
                >
                    {unit.name}
                </button>
            ))}
        </div>
    )
}
