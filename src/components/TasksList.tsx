import { useState, useMemo } from 'react'
import type { Tarea } from './TaskForm'

interface TasksListProps {
  tareas: Tarea[]
  proyectos: string[]
}

const formatDate = (fecha: string): string => {
  if (!fecha) return ''
  const date = new Date(fecha)
  return date.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export const TasksList = ({ tareas, proyectos }: TasksListProps) => {
  const [filtroProyecto, setFiltroProyecto] = useState('')
  const [filtroDesde, setFiltroDesde] = useState('')
  const [filtroHasta, setFiltroHasta] = useState('')
  const [copied, setCopied] = useState(false)

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

  const copyAsMarkdown = () => {
    if (tareasFiltradas.length === 0) return

    const header = '| Tarea | Proyecto | Inicio | Término | Estado | Repositorios |'
    const separator = '|-------|----------|--------|---------|--------|--------------|'
    const rows = tareasFiltradas.map(
      (t) => `| ${t.tarea} | ${t.proyecto} | ${t.fechaInicio} | ${t.fechaTermino} | ${t.estado} | ${t.repositorios} |`
    )

    const markdown = [header, separator, ...rows].join('\n')
    navigator.clipboard.writeText(markdown).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const inputClass = "bg-surface border border-border rounded-2xl px-4 py-2.5 text-sm text-text focus:outline-none focus:border-primary/60 focus:shadow-[0_0_0_3px_rgba(124,92,252,0.1)] transition-all w-full"

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-card rounded-3xl border border-border p-6">
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Filtros</p>
          {(filtroProyecto || filtroDesde || filtroHasta) && (
            <button onClick={limpiarFiltros} className="text-xs text-primary-light hover:text-primary cursor-pointer font-medium border border-primary/20 px-3 py-1 rounded-full">
              Limpiar
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-text-dim">Proyecto</label>
            <select value={filtroProyecto} onChange={(e) => setFiltroProyecto(e.target.value)} className={inputClass}>
              <option value="">Todos</option>
              {proyectos.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-text-dim">Desde</label>
            <input type="date" value={filtroDesde} onChange={(e) => setFiltroDesde(e.target.value)} className={inputClass} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-text-dim">Hasta</label>
            <input type="date" value={filtroHasta} onChange={(e) => setFiltroHasta(e.target.value)} min={filtroDesde || undefined} className={inputClass} />
          </div>
        </div>
      </div>

      {/* Lista de tareas como cards */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-text">Tareas</h2>
          <span className="text-xs text-text-dim bg-surface border border-border px-3 py-1 rounded-full">
            {tareasFiltradas.length} resultados
          </span>
        </div>
        <button
          onClick={copyAsMarkdown}
          disabled={tareasFiltradas.length === 0}
          className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary-light border border-border rounded-full px-4 py-2 hover:border-primary/30 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {copied ? (
            <span className="text-accent font-medium">✓ Copiado</span>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
              </svg>
              Copiar MD
            </>
          )}
        </button>
      </div>

      {tareasFiltradas.length === 0 ? (
        <div className="bg-card rounded-3xl border border-border p-16 text-center">
          <div className="w-16 h-16 bg-surface rounded-2xl flex items-center justify-center mx-auto mb-4 border border-border">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-text-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-text-dim">No hay tareas registradas.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {tareasFiltradas.map((tarea) => (
            <div key={tarea.id} className="bg-card rounded-3xl border border-border p-6 hover:border-primary/30 transition-all group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-text font-semibold text-base mb-2 group-hover:text-primary-light transition-colors">
                    {tarea.tarea}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-text-secondary">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                      {tarea.proyecto}
                    </span>
                    <span>{formatDate(tarea.fechaInicio)} → {formatDate(tarea.fechaTermino)}</span>
                  </div>
                </div>
                <span
                  className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                    tarea.estado === 'Finalizado'
                      ? 'bg-accent/10 text-accent border border-accent/20'
                      : 'bg-warning/10 text-warning border border-warning/20'
                  }`}
                >
                  {tarea.estado}
                </span>
              </div>
              {tarea.repositorios && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
                  {tarea.repositorios.split('/').map((repo, i) => (
                    <span
                      key={i}
                      className="inline-block bg-surface text-text-dim text-xs px-3 py-1.5 rounded-full border border-border font-medium"
                    >
                      {repo.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
