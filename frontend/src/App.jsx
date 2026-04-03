// src/App.jsx
import React from "react";

function App() {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-blue-800 text-white p-4">
        <h1 className="text-lg font-bold mb-4">Smart Campus</h1>
        <button className="block px-4 py-2 mb-2 hover:bg-blue-700">Dashboard</button>
        <button className="block px-4 py-2 mb-2 hover:bg-blue-700">Bookings</button>
        <button className="block px-4 py-2 mb-2 hover:bg-blue-700">Tickets</button>
        <button className="block px-4 py-2 mb-2 hover:bg-blue-700">Notifications</button>
      </div>

      {/* Main content */}
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold">Welcome to Smart Campus</h1>
        <p>Main content goes here.</p>
      </div>
    </div>
  );
}

export default App;