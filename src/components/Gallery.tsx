import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, Palette, FileText } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { GallerySkeleton } from './ui/skeleton';

interface GalleryItem {
  id: number;
  title: string;
  category: string;
  image: string;
  description: string;
}

const humanize = (s: string) => s.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

export function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGallery();
  }, []);

  const loadGallery = async () => {
    try {
      const galleryRef = collection(db, 'gallery');
      const snapshot = await getDocs(galleryRef);
      const items: GalleryItem[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          id: parseInt(doc.id) || items.length + 1,
          title: data.name?.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ') || 'Untitled',
          category: data.category || 'uncategorized',
          image: data.url || '',
          description: `Project photo from ${humanize(data.category || 'uncategorized')}`
        });
      });

      // Add sample images if no images exist
      if (items.length === 0) {
        const sampleItems: GalleryItem[] = [
          {
            id: 1,
            title: 'Electrical Installation',
            category: 'house-wiring',
            image: 'https://images.unsplash.com/photo-1621905252472-943afaa20e20?w=400&h=300&fit=crop',
            description: 'Professional house wiring installation services'
          },
          {
            id: 2,
            title: 'Graphic Design',
            category: 'graphic-designing',
            image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop',
            description: 'Creative graphic design and branding solutions'
          },
          {
            id: 3,
            title: 'ICT Solutions',
            category: 'ict-projects',
            image: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=300&fit=crop',
            description: 'Advanced information and communication technology implementations'
          },
          {
            id: 4,
            title: 'Business Solutions',
            category: 'business-solutions',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
            description: 'Comprehensive business consulting and solutions'
          }
        ];
        items.push(...sampleItems);
      }

      setGalleryItems(items);

      // Create categories
      const categoryMap = new Map<string, number>();
      items.forEach((item) => {
        categoryMap.set(item.category, (categoryMap.get(item.category) || 0) + 1);
      });

      const dynamicCategories = Array.from(categoryMap.entries()).map(([slug, count]) => ({
        id: slug,
        name: humanize(slug),
        icon: FileText,
        gradient: 'from-gray-600 to-gray-800',
        count
      }));

      setCategories([
        { id: 'all', name: 'All Work', icon: FileText, gradient: 'from-gray-600 to-gray-800' },
        ...dynamicCategories
      ]);

    } catch (error) {
      console.error('Error loading gallery:', error);
      // Fallback to empty state
      setCategories([{ id: 'all', name: 'All Work', icon: FileText, gradient: 'from-gray-600 to-gray-800' }]);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = selectedCategory === 'all'
    ? galleryItems
    : galleryItems.filter(item => item.category === selectedCategory);

  if (loading) {
    return (
      <section id="gallery" className="py-32 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="inline-block mb-4">
              <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-200 rounded-full px-6 py-2">
                <Palette className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-blue-900">Our Portfolio</span>
              </div>
            </div>
            <h2 className="text-5xl md:text-6xl mb-6 bg-gradient-to-r from-blue-900 via-blue-700 to-purple-900 bg-clip-text text-transparent">
              Work Gallery
            </h2>
            <div className="w-32 h-1.5 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full shadow-lg shadow-blue-500/50"></div>
            <p className="text-lg text-gray-600 mt-6 max-w-2xl mx-auto">
              Explore our portfolio of completed projects including graphic design, electrical installations, tech solutions, and business documentation.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-wrap justify-center gap-4 mb-12"
          >
            <div className="px-4 py-2 bg-gray-200 text-gray-500 rounded-md">
              Loading categories...
            </div>
          </motion.div>

          <GallerySkeleton />
        </div>
      </section>
    );
  }

  return (
    <section id="gallery" className="py-32 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-block mb-4">
            <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-200 rounded-full px-6 py-2">
              <Palette className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-blue-900">Our Portfolio</span>
            </div>
          </div>
          <h2 className="text-5xl md:text-6xl mb-6 bg-gradient-to-r from-blue-900 via-blue-700 to-purple-900 bg-clip-text text-transparent">
            Work Gallery
          </h2>
          <div className="w-32 h-1.5 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full shadow-lg shadow-blue-500/50"></div>
          <p className="text-lg text-gray-600 mt-6 max-w-2xl mx-auto">
            Explore our portfolio of completed projects including graphic design, electrical installations, tech solutions, and business documentation.
          </p>
        </motion.div>

        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`group relative px-6 py-3 rounded-xl transition-all ${
                  selectedCategory === category.id
                    ? 'scale-105'
                    : 'hover:scale-105'
                }`}
              >
                {selectedCategory === category.id && (
                  <div className={`absolute inset-0 bg-gradient-to-r ${category.gradient} rounded-xl blur-lg opacity-40`}></div>
                )}
                <div
                  className={`relative flex items-center space-x-2 ${
                    selectedCategory === category.id
                      ? `bg-gradient-to-r ${category.gradient} text-white shadow-xl`
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
                  } px-6 py-3 rounded-xl transition-all`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{category.name}</span>
                </div>
              </button>
            );
          })}
        </motion.div>

        {/* Gallery Grid */}
        <AnimatePresence mode="wait">
          {filteredItems.length > 0 ? (
            <motion.div
              key={selectedCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group relative cursor-pointer"
                  onClick={() => setSelectedImage(item)}
                >
                  {/* 3D shadow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity"></div>

                  <div className="relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 overflow-hidden border border-gray-100">
                    {/* Image container with overlay */}
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          console.error('Image failed to load:', item.image);
                          // Hide the broken image
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center border-2 border-white/40">
                            <ZoomIn className="w-8 h-8 text-white" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-xl mb-2 text-gray-900">{item.title}</h3>
                      <p className="text-gray-600 text-sm">{item.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Palette className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                {selectedCategory === 'all' ? 'No Images Yet' : `No Images in ${categories.find(c => c.id === selectedCategory)?.name}`}
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {selectedCategory === 'all'
                  ? 'Images will appear here once uploaded through the admin panel. Access the admin dashboard to start adding your portfolio images.'
                  : `No images have been uploaded to the ${categories.find(c => c.id === selectedCategory)?.name.toLowerCase()} category yet.`
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => window.open('/admin', '_blank')}
                  className="inline-flex items-center px-6 py-3 bg-blue-900 text-white rounded-xl font-medium hover:bg-blue-800 transition-all hover:scale-105 shadow-lg"
                >
                  <Palette className="w-5 h-5 mr-2" />
                  Go to Admin Panel
                </button>
                {selectedCategory !== 'all' && (
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
                  >
                    View All Categories
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal/Lightbox */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedImage(null)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", damping: 25 }}
                className="relative max-w-5xl w-full"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close button */}
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-12 right-0 w-10 h-10 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>

                {/* Image container */}
                <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
                  <img
                    src={selectedImage.image}
                    alt={selectedImage.title}
                    className="w-full h-auto max-h-[70vh] object-contain"
                  />
                  <div className="p-8">
                    <h3 className="text-3xl mb-3 bg-gradient-to-r from-blue-900 to-purple-900 bg-clip-text text-transparent">
                      {selectedImage.title}
                    </h3>
                    <p className="text-gray-700 text-lg">{selectedImage.description}</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}