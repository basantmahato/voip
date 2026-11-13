import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

const Login = () => {
  const [displayName, setDisplayName] = useState('');
  const { joinAsGuest, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await joinAsGuest(displayName);
      navigate('/');
    } catch (err) {
      // The store exposes the error in the form.
    }
  };

  return (
    <div className="flex min-h-screen min-h-[100dvh] items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-md rounded-2xl bg-gray-800 p-6 shadow-xl sm:p-8">
        <h2 className="mb-2 text-center text-3xl font-bold text-white">Ready to chat?</h2>
        <p className="mb-6 text-center text-sm text-gray-400">
          Choose a name to start chatting and calling.
        </p>
        
        {error && (
          <div className="mb-4 rounded bg-red-500/20 p-3 text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-gray-400">Your name</label>
            <input
              type="text"
              maxLength={32}
              autoComplete="nickname"
              autoFocus
              className="h-12 w-full rounded-lg border border-gray-600 bg-gray-700 px-3 text-base text-white outline-none focus:border-blue-500"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="h-12 w-full rounded-lg bg-blue-600 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Joining...' : 'Start chatting'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
