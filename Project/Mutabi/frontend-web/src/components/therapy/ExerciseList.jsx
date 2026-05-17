const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
const EX_COLORS = ['#FF8C42', '#4ECDC4', '#0F4C81', '#9B59B6', '#E67E22', '#1ABC9C', '#3498DB', '#E74C3C']
const exColor = (str) => EX_COLORS[(str || 'A').charCodeAt(0) % EX_COLORS.length]

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)

const DragIcon = () => (
  <svg className="w-3.5 h-3.5 text-gray-300" fill="currentColor" viewBox="0 0 16 16">
    <circle cx="5" cy="4" r="1.2" /><circle cx="11" cy="4" r="1.2" />
    <circle cx="5" cy="8" r="1.2" /><circle cx="11" cy="8" r="1.2" />
    <circle cx="5" cy="12" r="1.2" /><circle cx="11" cy="12" r="1.2" />
  </svg>
)

const EmptyPlanIcon = () => (
  <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
  </svg>
)

export default function ExerciseList({ selected, removeExercise, updateDay }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-gray-800">Selected Exercises</h2>
        {selected.length > 0 && (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
            {selected.length} {selected.length === 1 ? 'Item' : 'Items'}
          </span>
        )}
      </div>

      {selected.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
            <EmptyPlanIcon />
          </div>
          <p className="text-sm font-medium text-gray-400">No exercises added yet</p>
          <p className="text-xs text-gray-300 mt-1">Click an exercise from the library on the right.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {selected.map(({ exercise, target_days }) => {
            const color = exColor(exercise.id)
            return (
              <div key={exercise.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition">
                <span className="cursor-grab active:cursor-grabbing flex-shrink-0"><DragIcon /></span>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ background: color }}>
                  {exercise.title[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{exercise.title}</p>
                  <p className="text-xs text-gray-400 truncate">{exercise.description}</p>
                </div>
                <div className="relative flex-shrink-0">
                  <select value={target_days} onChange={e => updateDay(exercise.id, e.target.value)}
                    className="appearance-none text-xs font-semibold border border-gray-200 rounded-lg
                      px-3 py-1.5 pr-6 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-100 transition">
                    {DAYS.map(d => (
                      <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▾</span>
                </div>
                <button onClick={() => removeExercise(exercise.id)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300
                    hover:text-red-400 hover:bg-red-50 transition flex-shrink-0">
                  <TrashIcon />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}