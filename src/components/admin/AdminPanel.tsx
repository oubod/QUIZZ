import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Admin Panel Sub-components
import Dashboard from './Dashboard';
import QuestionManager from './QuestionManager';
import AIGenerator from './AIGenerator';
import CategoryManager from './CategoryManager';
import UserManager from './UserManager';

const AdminPanel: React.FC = () => {
  const { isAdmin } = useAuth();
  const location = useLocation();
  
  // Redirect if not admin
  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Accès non autorisé</h2>
        <p className="text-gray-400 mb-6">Vous n'avez pas les droits administrateur nécessaires pour accéder à cette page.</p>
        <Link to="/" className="px-4 py-2 bg-primary-600 hover:bg-primary-500 rounded-lg transition">
          Retour à l'accueil
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Panneau d'administration</h1>
        <p className="text-gray-400">Gérez les questions, utilisateurs et paramètres de l'application</p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 bg-gray-800 rounded-xl p-4">
          <nav className="space-y-1">
            <Link 
              to="/admin" 
              className={`block px-4 py-2 rounded-lg ${location.pathname === '/admin' ? 'bg-primary-900 text-primary-300' : 'hover:bg-gray-700'} transition`}
            >
              Tableau de bord
            </Link>
            <Link 
              to="/admin/questions" 
              className={`block px-4 py-2 rounded-lg ${location.pathname.includes('/admin/questions') ? 'bg-primary-900 text-primary-300' : 'hover:bg-gray-700'} transition`}
            >
              Gestionnaire de questions
            </Link>
            <Link 
              to="/admin/ai-generator" 
              className={`block px-4 py-2 rounded-lg ${location.pathname.includes('/admin/ai-generator') ? 'bg-primary-900 text-primary-300' : 'hover:bg-gray-700'} transition`}
            >
              Générateur IA
            </Link>
            <Link 
              to="/admin/categories" 
              className={`block px-4 py-2 rounded-lg ${location.pathname.includes('/admin/categories') ? 'bg-primary-900 text-primary-300' : 'hover:bg-gray-700'} transition`}
            >
              Catégories
            </Link>
            <Link 
              to="/admin/users" 
              className={`block px-4 py-2 rounded-lg ${location.pathname.includes('/admin/users') ? 'bg-primary-900 text-primary-300' : 'hover:bg-gray-700'} transition`}
            >
              Utilisateurs
            </Link>
          </nav>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 bg-gray-800 rounded-xl p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/questions" element={<QuestionManager />} />
            <Route path="/ai-generator" element={<AIGenerator />} />
            <Route path="/categories" element={<CategoryManager />} />
            <Route path="/users" element={<UserManager />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;