import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export const LoginView: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white p-4">
      <form onSubmit={handleLogin} className="w-full max-w-md bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700 space-y-4">
        <h2 className="text-2xl font-bold text-center text-emerald-400">SustentaFood</h2>
        <p className="text-sm text-gray-400 text-center">Inicie sessão para aceder ao dashboard</p>
        
        {errorMsg && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded text-sm">
            {errorMsg}
          </div>
        )}

        <div>
          <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">E-mail</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            required 
            className="w-full bg-gray-900 border border-gray-700 rounded p-2.5 text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Palavra-passe</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            required 
            className="w-full bg-gray-900 border border-gray-700 rounded p-2.5 text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 rounded transition duration-200"
        >
          {loading ? 'A entrar...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
};
