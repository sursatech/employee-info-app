import React from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center">
          <img src={logo} className="h-24 w-24 mx-auto animate-spin" alt="logo" />
          <h1 className="text-4xl font-bold text-gray-800 mt-6 mb-4">
            Employee Info App
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Welcome to your employee information management system
          </p>
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
            <p className="text-gray-700 mb-4">
              Edit <code className="bg-gray-100 px-2 py-1 rounded text-sm">src/App.tsx</code> and save to reload.
            </p>
            <a
              className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200"
              href="https://reactjs.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn React
            </a>
          </div>
        </header>
      </div>
    </div>
  );
}

export default App;
