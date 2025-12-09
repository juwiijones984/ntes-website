import { Routes, Route } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
import { AdminLogin } from './AdminLogin';
import { GalleryManager } from './GalleryManager';
import { ContentManager } from './ContentManager';
import { useAuth } from '../../hooks/useAuth';
import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { CheckCircle, XCircle, AlertTriangle, Database, Upload, FileText } from 'lucide-react';

function AdminStatus() {
  const [stats, setStats] = useState({
    galleryImages: 0,
    contentSections: 0,
    firebaseConnected: false,
    lastUpdated: null as Date | null
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Check gallery images
      const galleryRef = collection(db, 'gallery');
      const gallerySnapshot = await getDocs(galleryRef);

      // Check content sections
      const contentRef = collection(db, 'content');
      const contentSnapshot = await getDocs(contentRef);

      setStats({
        galleryImages: gallerySnapshot.size,
        contentSections: contentSnapshot.size,
        firebaseConnected: true,
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      setStats(prev => ({ ...prev, firebaseConnected: false }));
    }
  };

  return (
    <div className="space-y-8">
      {/* Status Overview */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-blue-100">Manage your website content and gallery</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl ${
              stats.firebaseConnected ? 'bg-green-500/20 text-green-100' : 'bg-red-500/20 text-red-100'
            }`}>
              {stats.firebaseConnected ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              <span className="text-sm font-medium">
                {stats.firebaseConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-blue-100">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Upload className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Gallery Images</h3>
              <p className="text-2xl font-bold text-blue-600">{stats.galleryImages}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-xl border border-blue-100">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Content Sections</h3>
              <p className="text-2xl font-bold text-green-600">{stats.contentSections}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-xl border border-blue-100">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Database Status</h3>
              <p className={`text-lg font-bold ${stats.firebaseConnected ? 'text-green-600' : 'text-red-600'}`}>
                {stats.firebaseConnected ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-8 shadow-xl border border-blue-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => window.location.href = '/admin/gallery'}
            className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl hover:from-blue-100 hover:to-purple-100 transition-all border border-blue-200"
          >
            <Upload className="w-8 h-8 text-blue-600 mr-4" />
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">Manage Gallery</h3>
              <p className="text-sm text-gray-600">Upload and organize images</p>
            </div>
          </button>

          <button
            onClick={() => window.location.href = '/admin/content'}
            className="flex items-center p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl hover:from-green-100 hover:to-teal-100 transition-all border border-green-200"
          >
            <FileText className="w-8 h-8 text-green-600 mr-4" />
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">Edit Content</h3>
              <p className="text-sm text-gray-600">Update website text and sections</p>
            </div>
          </button>
        </div>
      </div>

      {/* Setup Instructions */}
      {!stats.firebaseConnected && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8">
          <div className="flex items-start">
            <AlertTriangle className="w-6 h-6 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">Firebase Setup Required</h3>
              <p className="text-yellow-700 mb-4">
                Your admin panel needs Firebase to be properly configured. Follow these steps:
              </p>
              <ol className="list-decimal list-inside text-yellow-700 space-y-2">
                <li>Go to <a href="https://console.firebase.google.com" className="underline" target="_blank" rel="noopener noreferrer">Firebase Console</a></li>
                <li>Create a new project or use existing one</li>
                <li>Enable Authentication (Email/Password)</li>
                <li>Enable Firestore Database and Storage</li>
                <li>Update the config in <code>src/firebase.ts</code></li>
                <li>Set up security rules (see FIREBASE_SETUP.md)</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Admin Panel</h2>
          <p className="text-gray-600">Please wait while we verify your credentials...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AdminLogin />;
  }

  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<AdminStatus />} />
        <Route path="/gallery" element={<GalleryManager />} />
        <Route path="/content" element={<ContentManager />} />
      </Routes>
    </AdminLayout>
  );
}