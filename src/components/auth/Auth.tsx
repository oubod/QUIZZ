import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { StethoscopeIcon } from 'lucide-react';

enum AuthView {
  LOGIN,
  REGISTER,
  AVATAR
}

const Auth: React.FC = () => {
  const [view, setView] = useState<AuthView>(AuthView.LOGIN);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [specialty, setSpecialty] = useState('Cardiologie');
  const [avatarBg, setAvatarBg] = useState('from-primary-500 to-secondary-500');
  const [avatarInitial, setAvatarInitial] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { error } = await login(email, password);
      if (error) {
        setError(error.message);
        return;
      }
      navigate('/');
    } catch (err) {
      setError('Une erreur est survenue lors de la connexion');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (view === AuthView.REGISTER) {
      // Move to avatar creator
      if (!name || !email || !password || !specialty) {
        setError('Veuillez remplir tous les champs');
        return;
      }
      
      // Set initial from name
      if (name && !avatarInitial) {
        setAvatarInitial(name.charAt(0).toUpperCase());
      }
      
      setView(AuthView.AVATAR);
      return;
    }
    
    if (view === AuthView.AVATAR) {
      // Complete registration
      setLoading(true);
      setError('');
      
      try {
        const { error } = await register(
          name,
          email, 
          password, 
          specialty, 
          { bgColor: avatarBg, initial: avatarInitial || name.charAt(0).toUpperCase() }
        );
        
        if (error) {
          setError(error.message);
          return;
        }
        
        navigate('/');
      } catch (err) {
        setError('Une erreur est survenue lors de l\'inscription');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      {view === AuthView.LOGIN && (
        <>
          <div className="text-center mb-10">
            <div className="flex justify-center mb-4">
              <StethoscopeIcon className="h-12 w-12 text-primary-500" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent mb-2">
              QuizMédecin
            </h1>
            <p className="text-gray-400">Connectez-vous pour accéder à votre compte</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="bg-gray-800 rounded-xl p-8 mb-6">
              {error && (
                <div className="mb-6 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-200">
                  {error}
                </div>
              )}
              
              <div className="mb-6">
                <label className="block text-gray-400 mb-2">Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-400 mb-2">Mot de passe</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-500 disabled:bg-primary-800 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition"
              >
                {loading ? 'Chargement...' : 'Se connecter'}
              </button>
            </div>
          </form>

          <div className="text-center text-gray-400">
            Pas encore de compte? <button onClick={() => setView(AuthView.REGISTER)} className="text-primary-400 hover:underline">S'inscrire</button>
          </div>
        </>
      )}

      {view === AuthView.REGISTER && (
        <>
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent mb-2">
              Créer un compte
            </h1>
            <p className="text-gray-400">Rejoignez la communauté médicale</p>
          </div>

          <form onSubmit={handleRegisterSubmit}>
            <div className="bg-gray-800 rounded-xl p-8 mb-6">
              {error && (
                <div className="mb-6 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-200">
                  {error}
                </div>
              )}
              
              <div className="mb-6">
                <label className="block text-gray-400 mb-2">Nom complet</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-400 mb-2">Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-400 mb-2">Mot de passe</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-400 mb-2">Spécialité</label>
                <select 
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="Cardiologie">Cardiologie</option>
                  <option value="Néphrologie">Néphrologie</option>
                  <option value="Infectiologie">Infectiologie</option>
                  <option value="Pneumologie">Pneumologie</option>
                  <option value="Gastro-entérologie">Gastro-entérologie</option>
                  <option value="Neurologie">Neurologie</option>
                  <option value="Endocrinologie">Endocrinologie</option>
                  <option value="Rhumatologie">Rhumatologie</option>
                  <option value="Hématologie">Hématologie</option>
                  <option value="Médecine Interne">Médecine Interne</option>
                </select>
              </div>
              <button 
                type="submit"
                className="w-full bg-primary-600 hover:bg-primary-500 text-white font-semibold py-3 px-4 rounded-lg transition"
              >
                Créer votre avatar
              </button>
            </div>
          </form>

          <div className="text-center text-gray-400">
            Déjà un compte? <button onClick={() => setView(AuthView.LOGIN)} className="text-primary-400 hover:underline">Se connecter</button>
          </div>
        </>
      )}

      {view === AuthView.AVATAR && (
        <>
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent mb-2">
              Créez votre avatar
            </h1>
            <p className="text-gray-400">Personnalisez votre représentation</p>
          </div>

          <form onSubmit={handleRegisterSubmit}>
            <div className="bg-gray-800 rounded-xl p-8 mb-6">
              {error && (
                <div className="mb-6 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-200">
                  {error}
                </div>
              )}
              
              <div className="flex justify-center mb-8">
                <div className={`w-32 h-32 bg-gradient-to-br ${avatarBg} rounded-full flex items-center justify-center text-4xl font-bold`}>
                  {avatarInitial || (name ? name.charAt(0).toUpperCase() : 'A')}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-gray-400 mb-2">Couleur de fond</label>
                  <select 
                    value={avatarBg}
                    onChange={(e) => setAvatarBg(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="from-primary-500 to-secondary-500">Dégradé bleu/vert</option>
                    <option value="from-purple-500 to-pink-500">Dégradé violet/rose</option>
                    <option value="from-red-500 to-yellow-500">Dégradé rouge/jaune</option>
                    <option value="from-indigo-500 to-blue-500">Dégradé indigo/bleu</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 mb-2">Initiale</label>
                  <input 
                    type="text"
                    value={avatarInitial}
                    onChange={(e) => setAvatarInitial(e.target.value.toUpperCase().charAt(0))}
                    maxLength={1}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-center uppercase focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-500 disabled:bg-primary-800 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition"
              >
                {loading ? 'Chargement...' : 'Terminer l\'inscription'}
              </button>
            </div>
          </form>

          <div className="text-center text-gray-400">
            <button onClick={() => setView(AuthView.REGISTER)} className="text-primary-400 hover:underline">Retour</button>
          </div>
        </>
      )}
    </div>
  );
};

export default Auth;