import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react'
import { GOOGLE_SCRIPT_URL } from '../config'

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
    fetch(`${GOOGLE_SCRIPT_URL}?action=estados`, { redirect: 'follow' })
      .then((res) => res.json())
      .then(setEstados)
      .catch(console.error)

    fetch(`${GOOGLE_SCRIPT_URL}?action=proyectos`, { redirect: 'follow' })
      .then((res) => res.json())
      .then(setProyectos)
      .catch(console.error)

    fetch(`${GOOGLE_SCRIPT_URL}?action=repositorios`, { redirect: 'follow' })
      .then((res) => res.json())
      .then(setRepositorios)
      .catch(console.error)
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

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">Nueva Tarea</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1 md:col-span-2">
          <label htmlFor="tarea" className="text-sm font-medium text-gray-700">
            Tarea
          </label>
          <textarea
            id="tarea"
            name="tarea"
            value={formData.tarea}
            onChange={handleChange}
            placeholder="Descripción de la tarea"
            rows={3}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
          />
          {errors.tarea && <span className="text-xs text-red-600">{errors.tarea}</span>}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="proyecto" className="text-sm font-medium text-gray-700">
            Proyecto
          </label>
          <select
            id="proyecto"
            name="proyecto"
            value={formData.proyecto}
            onChange={handleChange}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="">Seleccione un proyecto</option>
            {proyectos.map((p) => (
              <option key={p.id} value={p.nombre}>
                {p.nombre}
              </option>
            ))}
          </select>
          {errors.proyecto && <span className="text-xs text-red-600">{errors.proyecto}</span>}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="estado" className="text-sm font-medium text-gray-700">
            Estado
          </label>
          <select
            id="estado"
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="">Seleccione un estado</option>
            {estados.map((estado) => (
              <option key={estado.id} value={estado.nombre}>
                {estado.nombre}
              </option>
            ))}
          </select>
          {errors.estado && <span className="text-xs text-red-600">{errors.estado}</span>}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="fechaInicio" className="text-sm font-medium text-gray-700">
            Fecha de Inicio
          </label>
          <input
            type="date"
            id="fechaInicio"
            name="fechaInicio"
            value={formData.fechaInicio}
            onChange={handleChange}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.fechaInicio && <span className="text-xs text-red-600">{errors.fechaInicio}</span>}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="fechaTermino" className="text-sm font-medium text-gray-700">
            Fecha de Término
          </label>
          <input
            type="date"
            id="fechaTermino"
            name="fechaTermino"
            value={formData.fechaTermino}
            onChange={handleChange}
            min={formData.fechaInicio || undefined}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.fechaTermino && <span className="text-xs text-red-600">{errors.fechaTermino}</span>}
        </div>

        <div className="flex flex-col gap-1 md:col-span-2">
          <label className="text-sm font-medium text-gray-700">
            Repositorios
          </label>
          <div className="border border-gray-300 rounded-md p-3 space-y-2 max-h-32 overflow-y-auto">
            {repositorios.length === 0 && (
              <span className="text-xs text-gray-400">Cargando repositorios...</span>
            )}
            {repositorios.map((r) => (
              <label key={r.id} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.repositorios.includes(r.nombre)}
                  onChange={() => handleRepoToggle(r.nombre)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                {r.nombre}
              </label>
            ))}
          </div>
          {formData.repositorios.length > 0 && (
            <span className="text-xs text-gray-500">
              Seleccionados: {formData.repositorios.join(' / ')}
            </span>
          )}
          {errors.repositorios && <span className="text-xs text-red-600">{errors.repositorios}</span>}
        </div>
      </div>

      <div className="pt-2 flex gap-3">
        <button
          type="submit"
          className="bg-blue-600 text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer"
        >
          Guardar Tarea
        </button>
        <button
          type="button"
          onClick={onClose}
          className="border border-gray-300 text-gray-700 px-5 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
