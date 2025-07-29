import React from 'react'
import { Link } from "react-router-dom"

function Header() {
  return (
    <header className="bg-blue-800 text-white py-4 px-6 shadow-md">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">Biblioteca Musical Católica</h1>
        <nav className="space-x-4">
          <Link to="/" className="hover:underline">Início</Link>
          <Link to="/login" className="hover:underline">Login</Link>
          <Link to="/biblioteca" className="hover:underline">Biblioteca</Link>

        </nav>
      </div>
    </header>
  )
}

export default Header
