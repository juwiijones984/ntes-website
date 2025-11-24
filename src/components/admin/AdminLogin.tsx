import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';

export function AdminLogin() {
  const [email, setEmail] = useState('admin@ntes.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [firebaseConfigured, setFirebaseConfigured] = useState(true);
  const [showSignup, setShowSignup] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    // Check if Firebase is properly configured
    if (!auth.app) {
      setFirebaseConfigured(false);
      setError('Firebase not configured. Please set up Firebase project first.');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (showSignup) {
      // Handle signup
      try {
        await createUserWithEmailAndPassword(auth, email, password);
        setError('Admin account created successfully! You can now log in.');
        setShowSignup(false);
      } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
          setError('Admin account already exists. Please log in instead.');
          setShowSignup(false);
        } else {
          setError(error.message || 'Failed to create admin account');
        }
      }
    } else {
      // Handle login
      const result = await login(email, password);

      if (!result.success) {
        // If login fails due to configuration issues, suggest signup
        if (result.error?.includes('configuration') || result.error?.includes('project')) {
          setError('Firebase not configured. Would you like to create the first admin account?');
          setShowSignup(true);
        } else {
          setError(result.error || 'Login failed');
        }
      }
    }

    setLoading(false);
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');

    // Try to create demo account if it doesn't exist
    try {
      await createUserWithEmailAndPassword(auth, 'admin@ntes.com', 'admin123');
      // Then login
      const result = await login('admin@ntes.com', 'admin123');
      if (!result.success) {
        setError('Demo login failed');
      }
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        // Account exists, just login
        const result = await login('admin@ntes.com', 'admin123');
        if (!result.success) {
          setError('Demo login failed');
        }
      } else {
        setError('Demo login not available. Please set up Firebase first.');
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            NTES Admin Panel
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {showSignup ? 'Create your first admin account' : 'Sign in to manage your website content'}
          </p>
          {!firebaseConfigured && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                ⚠️ Firebase not configured. Please set up your Firebase project first.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading || !firebaseConfigured}
                className="w-full flex justify-center py-3 px-6 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all hover:scale-105"
              >
                {loading ? (showSignup ? 'Creating account...' : 'Signing in...') : (showSignup ? 'Create Admin Account' : 'Sign in')}
              </button>

              {!showSignup && firebaseConfigured && (
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-6 border border-blue-300 rounded-xl shadow-lg text-sm font-medium text-blue-900 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all hover:scale-105"
                >
                  {loading ? 'Setting up demo...' : 'Try Demo Account'}
                </button>
              )}

              {firebaseConfigured && (
                <button
                  type="button"
                  onClick={() => setShowSignup(!showSignup)}
                  className="w-full text-center text-sm text-blue-600 hover:text-blue-500"
                >
                  {showSignup ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
                </button>
              )}
            </div>
          </form>

          {!firebaseConfigured && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Firebase Setup Required</h3>
              <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1">
                <li>Go to <a href="https://console.firebase.google.com" className="underline" target="_blank" rel="noopener noreferrer">Firebase Console</a></li>
                <li>Create a new project</li>
                <li>Enable Authentication (Email/Password)</li>
                <li>Enable Firestore Database</li>
                <li>Enable Storage</li>
                <li>Update the config in <code>src/firebase.ts</code></li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}