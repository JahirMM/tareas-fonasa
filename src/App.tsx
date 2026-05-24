import { useState, useEffect } from 'react'
import './App.css'
import { TaskForm, type Tarea } from './components/TaskForm'
import { TasksList } from './components/TasksList'
import { Modal } from './components/Modal'
import { GOOGLE_SCRIPT_URL } from './config'

function App() {
  const [tareas, setTareas] = useState<Tarea[]>([])
  const [proyectos, setProyectos] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    fetch(GOOGLE_SCRIPT_URL, { redirect: 'follow' })
      .then((res) => res.json())
      .then((data) => {
        setTareas(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error al cargar tareas:', err)
        setLoading(false)
      })

    fetch(`${GOOGLE_SCRIPT_URL}?action=proyectos`, { redirect: 'follow' })
      .then((res) => res.json())
      .then((data) => setProyectos(data.map((p: { nombre: string }) => p.nombre)))
      .catch(console.error)
  }, [])

  const handleTaskAdded = async (nuevaTarea: Tarea) => {
    setTareas((prev) => [...prev, nuevaTarea])

    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(nuevaTarea),
    })
  }

  const totalTareas = tareas.length
  // const enCurso = tareas.filter((t) => t.estado === 'En curso').length
  // const finalizadas = tareas.filter((t) => t.estado === 'Finalizado').length

  return (
    <div className="min-h-screen bg-bg">
      {/* Hero / Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-primary/8 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 pt-8 pb-12">
          {/* Nav */}
          <nav className="flex items-center justify-end mb-16">
            <button
              onClick={() => setModalOpen(true)}
              className="bg-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-primary-dark transition-all cursor-pointer"
            >
              + Nueva Tarea
            </button>
          </nav>

          {/* Hero text */}
          <div className="mb-12">
            <h1 className="text-5xl md:text-7xl font-bold text-text leading-tight tracking-tight">
              Tareas.<br />
              <span className="text-primary-light">Fonasa</span>
            </h1>
            <p className="text-text-secondary mt-6 text-lg max-w-md">
              Tareas por dia en fonasa de Jahir
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-lg">
            <div>
              <p className="text-4xl font-bold text-text">{totalTareas}</p>
              <p className="text-text-dim text-sm mt-1">Total tareas</p>
            </div>
            {/* <div>
              <p className="text-4xl font-bold text-warning">{enCurso}</p>
              <p className="text-text-dim text-sm mt-1">En curso</p>
            </div> */}
            {/* <div>
              <p className="text-4xl font-bold text-accent">{finalizadas}</p>
              <p className="text-text-dim text-sm mt-1">Finalizadas</p>
            </div> */}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 pb-16">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-text-dim text-sm">Cargando tareas...</p>
            </div>
          </div>
        ) : (
          <TasksList tareas={tareas} proyectos={proyectos} />
        )}
      </main>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <TaskForm onTaskAdded={handleTaskAdded} onClose={() => setModalOpen(false)} />
      </Modal>
    </div>
  )
}

export default App
