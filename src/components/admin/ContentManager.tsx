import { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../firebase';
import { Save, Edit3, Upload, Image as ImageIcon, X } from 'lucide-react';

interface ContentSection {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'hero' | 'about' | 'services';
}

export function ContentManager() {
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const contentRef = collection(db, 'content');
      const snapshot = await getDocs(contentRef);
      const contentData: ContentSection[] = [];

      snapshot.forEach((doc) => {
        contentData.push({ id: doc.id, ...doc.data() } as ContentSection);
      });

      // If no content exists, create default sections
      if (contentData.length === 0) {
        const defaultSections: Omit<ContentSection, 'id'>[] = [
          {
            title: 'Hero Title',
            content: 'Welcome to NTES Business Solutions',
            type: 'hero'
          },
          {
            title: 'About Section',
            content: 'We provide comprehensive electrical and technology solutions...',
            type: 'about'
          },
          {
            title: 'Services',
            content: 'Our services include electrical installations, ICT solutions...',
            type: 'services'
          }
        ];

        for (const section of defaultSections) {
          const docRef = await addDoc(collection(db, 'content'), section);
          contentData.push({ id: docRef.id, ...section });
        }
      }

      setSections(contentData);

      // Load logo
      try {
        const logoRef = collection(db, 'settings');
        const logoSnapshot = await getDocs(logoRef);
        if (!logoSnapshot.empty) {
          const logoDoc = logoSnapshot.docs[0];
          setLogoUrl(logoDoc.data().logoUrl || '');
        }
      } catch (logoError) {
        console.error('Error loading logo:', logoError);
      }
    } catch (error) {
      console.error('Error loading content:', error);
    }
  };

  const startEditing = (section: ContentSection) => {
    setEditing(section.id);
    setEditContent(section.content);
  };

  const saveContent = async (sectionId: string) => {
    try {
      await updateDoc(doc(db, 'content', sectionId), {
        content: editContent
      });

      setSections(sections.map(s =>
        s.id === sectionId ? { ...s, content: editContent } : s
      ));

      setEditing(null);
    } catch (error) {
      console.error('Error saving content:', error);
    }
  };

  const addNewSection = async () => {
    const newSection = {
      title: 'New Section',
      content: 'Enter your content here...',
      type: 'text' as const
    };

    try {
      const docRef = await addDoc(collection(db, 'content'), newSection);
      setSections([...sections, { id: docRef.id, ...newSection }]);
    } catch (error) {
      console.error('Error adding section:', error);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);

    try {
      // Delete existing logo if it exists
      if (logoUrl) {
        const oldLogoRef = ref(storage, 'settings/logo');
        try {
          await deleteObject(oldLogoRef);
        } catch (error) {
          console.log('No existing logo to delete');
        }
      }

      // Upload new logo
      const logoRef = ref(storage, 'settings/logo');
      await uploadBytes(logoRef, file);

      // Get download URL
      const url = await getDownloadURL(logoRef);

      // Save to Firestore
      const settingsRef = collection(db, 'settings');
      const settingsSnapshot = await getDocs(settingsRef);

      if (settingsSnapshot.empty) {
        await addDoc(settingsRef, { logoUrl: url });
      } else {
        const settingsDoc = settingsSnapshot.docs[0];
        await updateDoc(doc(db, 'settings', settingsDoc.id), { logoUrl: url });
      }

      setLogoUrl(url);
    } catch (error) {
      console.error('Error uploading logo:', error);
    } finally {
      setUploadingLogo(false);
    }
  };

  const removeLogo = async () => {
    if (!logoUrl) return;

    try {
      const logoRef = ref(storage, 'settings/logo');
      await deleteObject(logoRef);

      // Remove from Firestore
      const settingsRef = collection(db, 'settings');
      const settingsSnapshot = await getDocs(settingsRef);

      if (!settingsSnapshot.empty) {
        const settingsDoc = settingsSnapshot.docs[0];
        await updateDoc(doc(db, 'settings', settingsDoc.id), { logoUrl: '' });
      }

      setLogoUrl('');
    } catch (error) {
      console.error('Error removing logo:', error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Logo Management */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-2xl">
        <h2 className="text-2xl font-bold mb-6">Logo Management</h2>
        <div className="flex items-center space-x-6">
          <div className="flex-shrink-0">
            {logoUrl ? (
              <div className="relative">
                <img
                  src={logoUrl}
                  alt="Current logo"
                  className="w-24 h-24 object-contain bg-white rounded-xl p-2"
                />
                <button
                  onClick={removeLogo}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                  title="Remove logo"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="w-24 h-24 bg-white/20 rounded-xl flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-white/60" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">
              {logoUrl ? 'Update Logo' : 'Upload Logo'}
            </h3>
            <p className="text-blue-100 mb-4">
              Upload your company logo to display on the website. Recommended size: 200x200px, PNG or JPG format.
            </p>
            <div className="flex items-center space-x-4">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={uploadingLogo}
                  className="hidden"
                />
                <div className="inline-flex items-center px-6 py-3 bg-white text-blue-900 rounded-xl font-medium hover:bg-blue-50 transition-all hover:scale-105 shadow-lg">
                  <Upload className="w-5 h-5 mr-2" />
                  {uploadingLogo ? 'Uploading...' : logoUrl ? 'Change Logo' : 'Upload Logo'}
                </div>
              </label>
              {uploadingLogo && (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Management */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
        <button
          onClick={addNewSection}
          className="inline-flex items-center px-6 py-3 text-sm font-medium rounded-xl text-white bg-blue-900 hover:bg-blue-800 transition-all hover:scale-105 shadow-lg"
        >
          <Edit3 className="w-5 h-5 mr-2" />
          Add Section
        </button>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">{section.title}</h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {section.type}
              </span>
            </div>

            {editing === section.id ? (
              <div className="space-y-4">
                <label htmlFor={`content-${section.id}`} className="block text-sm font-medium text-gray-700">
                  Content
                </label>
                <textarea
                  id={`content-${section.id}`}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={4}
                  placeholder="Enter your content here..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={() => saveContent(section.id)}
                    className="inline-flex items-center px-6 py-3 text-sm font-medium rounded-xl text-white bg-blue-900 hover:bg-blue-800 transition-all hover:scale-105 shadow-lg"
                  >
                    <Save className="w-5 h-5 mr-2" />
                    Save
                  </button>
                  <button
                    onClick={() => setEditing(null)}
                    className="inline-flex items-center px-6 py-3 text-sm font-medium rounded-xl text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-700">{section.content}</p>
                <button
                  onClick={() => startEditing(section)}
                  className="inline-flex items-center px-6 py-3 text-sm font-medium rounded-xl text-white bg-blue-900 hover:bg-blue-800 transition-all hover:scale-105 shadow-lg"
                >
                  <Edit3 className="w-5 h-5 mr-2" />
                  Edit
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {sections.length === 0 && (
        <div className="text-center py-12">
          <Edit3 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No content sections</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding your first content section.
          </p>
          <button
            onClick={addNewSection}
            className="mt-4 inline-flex items-center px-6 py-3 text-sm font-medium rounded-xl text-white bg-blue-900 hover:bg-blue-800 transition-all hover:scale-105 shadow-lg"
          >
            <Edit3 className="w-5 h-5 mr-2" />
            Add Section
          </button>
        </div>
      )}
    </div>
  );
}