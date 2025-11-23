import { Routes, Route } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
import { AdminLogin } from './AdminLogin';
import { GalleryManager } from './GalleryManager';
import { ContentManager } from './ContentManager';
import { useAuth } from '../../hooks/useAuth';

export function AdminDashboard() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <AdminLogin />;
  }

  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<GalleryManager />} />
        <Route path="/gallery" element={<GalleryManager />} />
        <Route path="/content" element={<ContentManager />} />
      </Routes>
    </AdminLayout>
  );
}