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

interface UploadProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
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
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    loadGallery();
  }, []);

  // Test Firebase connection
  const testFirebaseConnection = async () => {
    try {
      // Test Firestore connection
      const testDoc = await addDoc(collection(db, 'test'), {
        test: true,
        timestamp: new Date()
      });
      await deleteDoc(doc(db, 'test', testDoc.id));
      console.log('✅ Firebase Firestore connection successful');

      // Test Storage connection
      const testRef = ref(storage, 'test.txt');
      console.log('✅ Firebase Storage connection successful');

      return true;
    } catch (error) {
      console.error('❌ Firebase connection failed:', error);
      return false;
    }
  };

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

  // Compress image if it's too large
  const compressImage = (file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file); // Fallback to original
          }
        }, 'image/jpeg', quality);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(Array.from(files));
    }
  };

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;

    // Validate file sizes (max 50MB per file)
    const maxFileSize = 50 * 1024 * 1024; // 50MB
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    for (const file of files) {
      if (file.size > maxFileSize) {
        invalidFiles.push(`${file.name} (${(file.size / (1024 * 1024)).toFixed(1)}MB)`);
      } else {
        validFiles.push(file);
      }
    }

    if (invalidFiles.length > 0) {
      alert(`Some files are too large (max 50MB):\n${invalidFiles.join('\n')}`);
    }

    if (validFiles.length === 0) return;

    // Initialize upload progress
    const initialProgress: UploadProgress[] = validFiles.map(file => ({
      file,
      progress: 0,
      status: 'pending'
    }));

    setUploadProgress(initialProgress);
    setUploading(true);

    try {
      // Process files in parallel (max 3 concurrent uploads)
      const uploadPromises = validFiles.map(async (file, index) => {
        try {
          // Update status to uploading
          setUploadProgress(prev => prev.map((p, i) =>
            i === index ? { ...p, status: 'uploading' as const } : p
          ));

          // Compress large images
          let processedFile = file;
          if (file.size > 2 * 1024 * 1024 && file.type.startsWith('image/')) { // > 2MB
            processedFile = await compressImage(file);
          }

          // Create unique filename to avoid conflicts
          const timestamp = Date.now();
          const randomId = Math.random().toString(36).substring(2, 15);
          const fileName = `${timestamp}_${randomId}_${file.name}`;
          const storageRef = ref(storage, `gallery/${selectedCategory}/${fileName}`);

          // Upload with progress tracking (simulated)
          const uploadTask = uploadBytes(storageRef, processedFile);

          // Simulate progress updates
          const progressInterval = setInterval(() => {
            setUploadProgress(prev => prev.map((p, i) =>
              i === index && p.status === 'uploading'
                ? { ...p, progress: Math.min(p.progress + Math.random() * 30, 90) }
                : p
            ));
          }, 200);

          await uploadTask;
          clearInterval(progressInterval);

          // Get download URL
          const url = await getDownloadURL(storageRef);

          // Save to Firestore
          await addDoc(collection(db, 'gallery'), {
            name: file.name,
            url,
            category: selectedCategory,
            path: `gallery/${selectedCategory}/${fileName}`,
            createdAt: new Date(),
            size: processedFile.size,
            originalSize: file.size
          });

          // Mark as completed
          setUploadProgress(prev => prev.map((p, i) =>
            i === index ? { ...p, progress: 100, status: 'completed' as const } : p
          ));

        } catch (error: any) {
          console.error(`Error uploading ${file.name}:`, error);
          const errorMessage = error?.message || error?.code || 'Upload failed';
          setUploadProgress(prev => prev.map((p, i) =>
            i === index ? { ...p, status: 'error' as const, error: errorMessage } : p
          ));
        }
      });

      // Wait for all uploads to complete
      await Promise.allSettled(uploadPromises);

      // Reload gallery after a short delay
      setTimeout(() => {
        loadGallery();
        setUploadProgress([]);
      }, 1000);

    } catch (error) {
      console.error('Error in upload process:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    await handleFiles(Array.from(files));
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
            <button
              onClick={testFirebaseConnection}
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl text-blue-900 bg-blue-100 hover:bg-blue-200 transition-all hover:scale-105 shadow-lg"
              title="Test Firebase connection"
            >
              🔗 Test Connection
            </button>
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
          <div
            className={`border-2 border-dashed rounded-2xl p-8 bg-gradient-to-br from-blue-50/50 to-purple-50/50 transition-all ${
              dragOver ? 'border-blue-400 bg-blue-50/70 scale-105' : 'border-blue-200'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
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
                    {dragOver ? 'Drop files here' : 'Click to browse or drag and drop files here'}
                  </span>
                  <span className="block text-xs text-gray-400 mt-2">
                    Max file size: 50MB per image • Images over 2MB will be compressed automatically
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
              {uploading && uploadProgress.length > 0 && (
                <div className="mt-6 space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">Upload Progress</h4>
                  {uploadProgress.map((item, index) => (
                    <div key={index} className="bg-white/50 rounded-xl p-4 border border-white/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900 truncate max-w-xs">
                          {item.file.name}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          item.status === 'completed' ? 'bg-green-100 text-green-800' :
                          item.status === 'error' ? 'bg-red-100 text-red-800' :
                          item.status === 'uploading' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {item.status === 'completed' ? '✓ Done' :
                           item.status === 'error' ? '✗ Failed' :
                           item.status === 'uploading' ? 'Uploading...' : 'Pending'}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            item.status === 'completed' ? 'bg-green-500' :
                            item.status === 'error' ? 'bg-red-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${item.progress}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{(item.file.size / (1024 * 1024)).toFixed(1)} MB</span>
                        <span>{item.progress.toFixed(0)}%</span>
                      </div>
                      {item.error && (
                        <p className="text-xs text-red-600 mt-1">{item.error}</p>
                      )}
                    </div>
                  ))}
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