import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Footer: React.FC = () => {
  const { user } = useAuth();

  // Only show footer if user is logged in
  if (!user) return null;

  return (
    <footer className="bg-gray-800 py-6 mt-12">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <div className="text-center text-gray-500 text-sm">
          QuizMédecin - Application pédagogique pour internes en médecine interne
          <div className="mt-2">
            <Link to="/about" className="mr-3 hover:text-primary-400">À propos</Link>
            <Link to="/faq" className="mr-3 hover:text-primary-400">FAQ</Link>
            <Link to="/contact" className="hover:text-primary-400">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;