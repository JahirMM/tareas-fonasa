import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react'
import { GOOGLE_SCRIPT_URL } from '../config'
import { getCache, setCache } from '../hooks/useCache'

export interface Tarea {
  id: string
  tarea: string
  proyecto: string
  fechaInicio: string
  fechaTermino: string
  estado: string
  repositorios: string
}

interface Estado {
  id: number
  nombre: string
}

interface Proyecto {
  id: number
  nombre: string
}

interface Repositorio {
  id: number
  nombre: string
  url: string
}

interface TaskFormData {
  tarea: string
  proyecto: string
  fechaInicio: string
  fechaTermino: string
  estado: string
  repositorios: string[]
}

interface TaskFormProps {
  onTaskAdded: (tarea: Tarea) => void
  onClose: () => void
}

const ALLOWED_PATTERN = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-,.\/()*]*$/

export const TaskForm = ({ onTaskAdded, onClose }: TaskFormProps) => {
  const [estados, setEstados] = useState<Estado[]>([])
  const [proyectos, setProyectos] = useState<Proyecto[]>([])
  const [repositorios, setRepositorios] = useState<Repositorio[]>([])

  const [formData, setFormData] = useState<TaskFormData>({
    tarea: '',
    proyecto: '',
    fechaInicio: '',
    fechaTermino: '',
    estado: '',
    repositorios: [],
  })

  const [errors, setErrors] = useState<Partial<Record<string, string>>>({})

  useEffect(() => {
    const cachedEstados = getCache<Estado[]>('cache_estados')
    if (cachedEstados) {
      setEstados(cachedEstados)
    } else {
      fetch(`${GOOGLE_SCRIPT_URL}?action=estados`, { redirect: 'follow' })
        .then((res) => res.json())
        .then((data) => { setEstados(data); setCache('cache_estados', data) })
        .catch(console.error)
    }

    const cachedProyectos = getCache<Proyecto[]>('cache_proyectos')
    if (cachedProyectos) {
      setProyectos(cachedProyectos)
    } else {
      fetch(`${GOOGLE_SCRIPT_URL}?action=proyectos`, { redirect: 'follow' })
        .then((res) => res.json())
        .then((data) => { setProyectos(data); setCache('cache_proyectos', data) })
        .catch(console.error)
    }

    const cachedRepos = getCache<Repositorio[]>('cache_repositorios')
    if (cachedRepos) {
      setRepositorios(cachedRepos)
    } else {
      fetch(`${GOOGLE_SCRIPT_URL}?action=repositorios`, { redirect: 'follow' })
        .then((res) => res.json())
        .then((data) => { setRepositorios(data); setCache('cache_repositorios', data) })
        .catch(console.error)
    }
  }, [])

  const validateField = (name: string, value: string | string[]): string => {
    if (Array.isArray(value)) {
      return value.length === 0 ? 'Seleccione al menos un repositorio' : ''
    }
    if (!value.trim()) {
      return 'Este campo es obligatorio'
    }
    if (name === 'tarea' && !ALLOWED_PATTERN.test(value)) {
      return 'Solo se permiten caracteres alfanuméricos y los especiales: - , . / ( ) *'
    }
    return ''
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    const error = validateField(name, value)
    setErrors((prev) => ({ ...prev, [name]: error }))
  }

  const handleRepoToggle = (repoNombre: string) => {
    setFormData((prev) => {
      const repos = prev.repositorios.includes(repoNombre)
        ? prev.repositorios.filter((r) => r !== repoNombre)
        : [...prev.repositorios, repoNombre]
      return { ...prev, repositorios: repos }
    })
    setErrors((prev) => ({ ...prev, repositorios: '' }))
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    const newErrors: Partial<Record<string, string>> = {}
    let hasErrors = false

    for (const [key, value] of Object.entries(formData)) {
      const error = validateField(key, value)
      if (error) {
        newErrors[key] = error
        hasErrors = true
      }
    }

    setErrors(newErrors)

    if (!hasErrors) {
      const nuevaTarea: Tarea = {
        id: crypto.randomUUID(),
        tarea: formData.tarea,
        proyecto: formData.proyecto,
        fechaInicio: formData.fechaInicio,
        fechaTermino: formData.fechaTermino,
        estado: formData.estado,
        repositorios: formData.repositorios.join('/'),
      }

      onTaskAdded(nuevaTarea)
      onClose()
    }
  }

  const inputClass = "w-full bg-surface border border-border rounded-2xl px-4 py-3 text-sm text-text placeholder-text-dim focus:outline-none focus:border-primary/60 focus:shadow-[0_0_0_3px_rgba(124,92,252,0.1)] transition-all"

  return (
    <form onSubmit={handleSubmit} className="p-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text">Nueva Tarea</h2>
        <p className="text-sm text-text-dim mt-2">Registra una nueva tarea en el sistema.</p>
      </div>

      <div className="space-y-5">
        <div className="flex flex-col gap-2">
          <label htmlFor="tarea" className="text-sm font-medium text-text-secondary">Tarea</label>
          <textarea
            id="tarea"
            name="tarea"
            value={formData.tarea}
            onChange={handleChange}
            placeholder="Descripción de la tarea..."
            rows={3}
            className={`${inputClass} resize-y`}
          />
          {errors.tarea && <span className="text-xs text-danger">{errors.tarea}</span>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="proyecto" className="text-sm font-medium text-text-secondary">Proyecto</label>
            <select id="proyecto" name="proyecto" value={formData.proyecto} onChange={handleChange} className={inputClass}>
              <option value="">Seleccione</option>
              {proyectos.map((p) => (
                <option key={p.id} value={p.nombre}>{p.nombre}</option>
              ))}
            </select>
            {errors.proyecto && <span className="text-xs text-danger">{errors.proyecto}</span>}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="estado" className="text-sm font-medium text-text-secondary">Estado</label>
            <select id="estado" name="estado" value={formData.estado} onChange={handleChange} className={inputClass}>
              <option value="">Seleccione</option>
              {estados.map((estado) => (
                <option key={estado.id} value={estado.nombre}>{estado.nombre}</option>
              ))}
            </select>
            {errors.estado && <span className="text-xs text-danger">{errors.estado}</span>}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="fechaInicio" className="text-sm font-medium text-text-secondary">Fecha Inicio</label>
            <input type="date" id="fechaInicio" name="fechaInicio" value={formData.fechaInicio} onChange={handleChange} className={inputClass} />
            {errors.fechaInicio && <span className="text-xs text-danger">{errors.fechaInicio}</span>}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="fechaTermino" className="text-sm font-medium text-text-secondary">Fecha Término</label>
            <input type="date" id="fechaTermino" name="fechaTermino" value={formData.fechaTermino} onChange={handleChange} min={formData.fechaInicio || undefined} className={inputClass} />
            {errors.fechaTermino && <span className="text-xs text-danger">{errors.fechaTermino}</span>}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-text-secondary">Repositorios</label>
          <div className="bg-surface border border-border rounded-2xl p-4 space-y-1 max-h-36 overflow-y-auto">
            {repositorios.length === 0 && (
              <span className="text-xs text-text-dim">Cargando...</span>
            )}
            {repositorios.map((r) => (
              <label key={r.id} className="flex items-center gap-3 text-sm text-text-secondary cursor-pointer hover:bg-surface-hover rounded-xl px-3 py-2.5 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.repositorios.includes(r.nombre)}
                  onChange={() => handleRepoToggle(r.nombre)}
                  className="rounded-md border-border text-primary focus:ring-primary/30 bg-bg"
                />
                {r.nombre}
              </label>
            ))}
          </div>
          {formData.repositorios.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.repositorios.map((repo) => (
                <span key={repo} className="inline-flex items-center gap-1.5 bg-primary/10 text-primary-light text-xs px-3 py-1.5 rounded-full font-medium border border-primary/20">
                  {repo}
                  <button type="button" onClick={() => handleRepoToggle(repo)} className="hover:text-danger cursor-pointer text-base leading-none">×</button>
                </span>
              ))}
            </div>
          )}
          {errors.repositorios && <span className="text-xs text-danger">{errors.repositorios}</span>}
        </div>
      </div>

      <div className="pt-4 flex gap-3">
        <button
          type="submit"
          className="bg-primary text-white px-7 py-3 rounded-full text-sm font-semibold hover:bg-primary-dark transition-all cursor-pointer"
        >
          Guardar Tarea
        </button>
        <button
          type="button"
          onClick={onClose}
          className="border border-border text-text-secondary px-7 py-3 rounded-full text-sm font-medium hover:bg-surface-hover transition-all cursor-pointer"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
