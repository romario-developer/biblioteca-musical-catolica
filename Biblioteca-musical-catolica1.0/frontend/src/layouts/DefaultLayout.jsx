import React from 'react'
import Header from "../components/Header"
import { Outlet } from "react-router-dom"

function DefaultLayout() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="max-w-6xl mx-auto p-4 mt-6">
        <Outlet />
      </main>
    </div>
  )
}

export default DefaultLayout
