import { useState, useEffect } from 'react'
import './App.css'
import { TaskForm, type Tarea } from './components/TaskForm'
import { TasksList } from './components/TasksList'
import { Header } from './components/Header'
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

  return (
    <div className="min-h-screen bg-gray-100">
      <Header onCreateTask={() => setModalOpen(true)} />

      <main className="max-w-6xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-500 text-sm">Cargando tareas...</p>
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
