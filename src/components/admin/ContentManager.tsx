import { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Save, Edit3 } from 'lucide-react';

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
        <button
          onClick={addNewSection}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
        >
          <Edit3 className="w-4 h-4 mr-2" />
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
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </button>
                  <button
                    onClick={() => setEditing(null)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
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
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
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
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Add Section
          </button>
        </div>
      )}
    </div>
  );
}