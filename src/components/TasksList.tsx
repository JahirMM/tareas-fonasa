import { useState, useMemo } from 'react'
import type { Tarea } from './TaskForm'

interface TasksListProps {
  tareas: Tarea[]
  proyectos: string[]
}

export const TasksList = ({ tareas, proyectos }: TasksListProps) => {
  const [filtroProyecto, setFiltroProyecto] = useState('')
  const [filtroDesde, setFiltroDesde] = useState('')
  const [filtroHasta, setFiltroHasta] = useState('')

  const tareasFiltradas = useMemo(() => {
    return tareas.filter((tarea) => {
      if (filtroProyecto && tarea.proyecto !== filtroProyecto) return false
      if (filtroDesde && tarea.fechaInicio < filtroDesde) return false
      if (filtroHasta && tarea.fechaTermino > filtroHasta) return false
      return true
    })
  }, [tareas, filtroProyecto, filtroDesde, filtroHasta])

  const limpiarFiltros = () => {
    setFiltroProyecto('')
    setFiltroDesde('')
    setFiltroHasta('')
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">Filtros</h3>
          {(filtroProyecto || filtroDesde || filtroHasta) && (
            <button
              onClick={limpiarFiltros}
              className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              Limpiar filtros
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Proyecto</label>
            <select
              value={filtroProyecto}
              onChange={(e) => setFiltroProyecto(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              {proyectos.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Desde</label>
            <input
              type="date"
              value={filtroDesde}
              onChange={(e) => setFiltroDesde(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Hasta</label>
            <input
              type="date"
              value={filtroHasta}
              onChange={(e) => setFiltroHasta(e.target.value)}
              min={filtroDesde || undefined}
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800">Tareas</h2>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {tareasFiltradas.length} {tareasFiltradas.length === 1 ? 'tarea' : 'tareas'}
          </span>
        </div>

        {tareasFiltradas.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            No hay tareas que coincidan con los filtros.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-4 py-3 font-medium">Tarea</th>
                  <th className="px-4 py-3 font-medium">Proyecto</th>
                  <th className="px-4 py-3 font-medium">Inicio</th>
                  <th className="px-4 py-3 font-medium">Término</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Repositorios</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tareasFiltradas.map((tarea) => (
                  <tr key={tarea.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 text-gray-800 font-medium">{tarea.tarea}</td>
                    <td className="px-4 py-3 text-gray-600">{tarea.proyecto}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{tarea.fechaInicio}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{tarea.fechaTermino}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          tarea.estado === 'Finalizado'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {tarea.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {tarea.repositorios.split('/').map((repo, i) => (
                          <span
                            key={i}
                            className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded"
                          >
                            {repo.trim()}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
