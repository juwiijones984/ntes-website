import { useState, useEffect } from 'react';
import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { storage, db } from '../../firebase';
import { Upload, Trash2, Folder, Image as ImageIcon, Plus } from 'lucide-react';

interface GalleryImage {
  id: string;
  name: string;
  url: string;
  category: string;
  path: string;
}

interface GalleryCategory {
  id: string;
  name: string;
  count: number;
}

export function GalleryManager() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [uploading, setUploading] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);

  useEffect(() => {
    loadGallery();
  }, []);

  const loadGallery = async () => {
    try {
      // Load images from Firestore
      const imagesRef = collection(db, 'gallery');
      const imagesSnapshot = await getDocs(imagesRef);
      const imagesData: GalleryImage[] = [];

      imagesSnapshot.forEach((doc) => {
        imagesData.push({ id: doc.id, ...doc.data() } as GalleryImage);
      });

      setImages(imagesData);

      // Group by categories
      const categoryMap = new Map<string, number>();
      imagesData.forEach((img) => {
        categoryMap.set(img.category, (categoryMap.get(img.category) || 0) + 1);
      });

      const categoriesData: GalleryCategory[] = Array.from(categoryMap.entries()).map(([name, count]) => ({
        id: name,
        name: name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' '),
        count
      }));

      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading gallery:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      for (const file of Array.from(files)) {
        // Create storage reference
        const storageRef = ref(storage, `gallery/${selectedCategory}/${file.name}`);

        // Upload file
        await uploadBytes(storageRef, file);

        // Get download URL
        const url = await getDownloadURL(storageRef);

        // Save to Firestore
        await addDoc(collection(db, 'gallery'), {
          name: file.name,
          url,
          category: selectedCategory,
          path: `gallery/${selectedCategory}/${file.name}`,
          createdAt: new Date()
        });
      }

      await loadGallery();
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (image: GalleryImage) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      // Delete from Storage
      const storageRef = ref(storage, image.path);
      await deleteObject(storageRef);

      // Delete from Firestore
      await deleteDoc(doc(db, 'gallery', image.id));

      await loadGallery();
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const createNewCategory = async () => {
    if (!newCategoryName.trim()) return;

    const categoryId = newCategoryName.toLowerCase().replace(/\s+/g, '-');

    // Create a placeholder document to establish the category
    await addDoc(collection(db, 'gallery'), {
      name: 'placeholder',
      url: '',
      category: categoryId,
      path: '',
      createdAt: new Date()
    });

    setNewCategoryName('');
    setShowNewCategory(false);
    await loadGallery();
  };

  const filteredImages = selectedCategory === 'all'
    ? images
    : images.filter(img => img.category === selectedCategory);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gallery Management</h1>
        <div className="flex space-x-4">
          {!showNewCategory ? (
            <button
              onClick={() => setShowNewCategory(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Category
            </button>
          ) : (
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                onKeyPress={(e) => e.key === 'Enter' && createNewCategory()}
              />
              <button
                onClick={createNewCategory}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
              >
                Create
              </button>
              <button
                onClick={() => setShowNewCategory(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            selectedCategory === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All ({images.length})
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              selectedCategory === category.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {category.name} ({category.count})
          </button>
        ))}
      </div>

      {/* Upload Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Upload Images</h2>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  Upload images to {selectedCategory === 'all' ? 'selected category' : selectedCategory}
                </span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading || selectedCategory === 'all'}
                  className="sr-only"
                />
              </label>
            </div>
            {uploading && (
              <div className="mt-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Uploading...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Images Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredImages.map((image) => (
          <div key={image.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="aspect-w-1 aspect-h-1">
              <img
                src={image.url}
                alt={image.name}
                className="w-full h-48 object-cover"
              />
            </div>
            <div className="p-4">
              <p className="text-sm font-medium text-gray-900 truncate">{image.name}</p>
              <p className="text-xs text-gray-500">{image.category}</p>
              <button
                onClick={() => handleDeleteImage(image)}
                className="mt-2 inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredImages.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No images</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by uploading some images to this category.
          </p>
        </div>
      )}
    </div>
  );
}