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
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Gallery Management</h1>
            <p className="text-blue-100">Manage your portfolio images and categories</p>
          </div>
          <div className="flex space-x-4">
            {!showNewCategory ? (
              <button
                onClick={() => setShowNewCategory(true)}
                className="inline-flex items-center px-6 py-3 text-sm font-medium rounded-xl text-white bg-blue-900 hover:bg-blue-800 transition-all hover:scale-105 shadow-lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                New Category
              </button>
            ) : (
              <div className="flex space-x-3">
                <input
                  type="text"
                  placeholder="Category name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200 text-sm backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                  onKeyPress={(e) => e.key === 'Enter' && createNewCategory()}
                />
                <button
                  onClick={createNewCategory}
                  className="px-6 py-3 bg-blue-900 text-white rounded-xl text-sm font-medium hover:bg-blue-800 transition-all hover:scale-105 shadow-lg"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowNewCategory(false)}
                  className="px-6 py-3 bg-gray-600 text-white rounded-xl text-sm font-medium hover:bg-gray-500 transition-all"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-6 py-3 rounded-xl text-sm font-medium transition-all shadow-lg ${
            selectedCategory === 'all'
              ? 'bg-blue-900 text-white transform scale-105'
              : 'bg-blue-100 text-blue-900 hover:bg-blue-200 border border-blue-300'
          }`}
        >
          All ({images.length})
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-6 py-3 rounded-xl text-sm font-medium transition-all shadow-lg ${
              selectedCategory === category.id
                ? 'bg-blue-900 text-white transform scale-105'
                : 'bg-blue-100 text-blue-900 hover:bg-blue-200 border border-blue-300'
            }`}
          >
            {category.name} ({category.count})
          </button>
        ))}
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
          <h2 className="text-xl font-bold text-white">Upload Images</h2>
          <p className="text-blue-100 mt-1">Add new images to your gallery</p>
        </div>
        <div className="p-8">
          <div className="border-2 border-dashed border-blue-200 rounded-2xl p-8 bg-gradient-to-br from-blue-50/50 to-purple-50/50">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Upload className="h-8 w-8 text-white" />
              </div>
              <div className="space-y-2">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="block text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                    Upload images to {selectedCategory === 'all' ? 'selected category' : selectedCategory.replace(/-/g, ' ')}
                  </span>
                  <span className="block text-sm text-gray-500 mt-1">
                    Click to browse or drag and drop files here
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
                <div className="mt-6">
                  <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                  <p className="mt-3 text-sm font-medium text-blue-600">Uploading images...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Images Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredImages.map((image) => (
          <div key={image.id} className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
            <div className="relative aspect-square overflow-hidden">
              <img
                src={image.url}
                alt={image.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <button
                onClick={() => handleDeleteImage(image)}
                className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 shadow-lg"
                title="Delete image"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5">
              <p className="text-sm font-semibold text-gray-900 truncate mb-1">{image.name}</p>
              <p className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-lg inline-block font-medium">
                {image.category.replace(/-/g, ' ')}
              </p>
            </div>
          </div>
        ))}
      </div>

      {filteredImages.length === 0 && (
        <div className="text-center py-16 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-100">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <ImageIcon className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No images found</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            {selectedCategory === 'all'
              ? "Your gallery is empty. Start by creating a category and uploading some images."
              : `No images in the "${selectedCategory.replace(/-/g, ' ')}" category yet. Upload some images to get started.`
            }
          </p>
        </div>
      )}
    </div>
  );
}