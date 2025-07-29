import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Biblioteca from './pages/Biblioteca'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/biblioteca" element={<Biblioteca />} />
    </Routes>
  )
}

export default App
