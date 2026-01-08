import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-6">
        <div className="flex justify-center space-x-8">
          <a href="https://vite.dev" target="_blank" className="hover:scale-110 transition-transform">
            <img src={viteLogo} className="h-20 w-auto" alt="Vite logo" />
          </a>
          <a href="https://react.dev" target="_blank" className="hover:scale-110 transition-transform">
            <img src={reactLogo} className="h-20 w-auto animate-spin-slow" alt="React logo" />
          </a>
        </div>

        <h1 className="text-4xl font-bold text-gray-800 tracking-tight">
          IzyBoost <span className="text-blue-600">Web</span>
        </h1>

        <p className="text-gray-600">
          React + Tailwind CSS est prêt !
        </p>

        <div className="space-y-4">
          <button
            onClick={() => setCount((count) => count + 1)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-md active:scale-95"
          >
            Compteur : <span className="font-mono">{count}</span>
          </button>

          <p className="text-sm text-gray-500">
            Modifiez <code className="bg-gray-200 px-1 rounded text-blue-700">src/App.jsx</code> pour commencer le développement.
          </p>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Powered by Vite & Tailwind CSS
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
