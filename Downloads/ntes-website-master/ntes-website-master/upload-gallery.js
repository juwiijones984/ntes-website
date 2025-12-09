const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');
const galleryData = require('./src/assets/gallery.json');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDq9FiMQ8l_g0or-trvAFIn9hFFDqL6loY",
  authDomain: "ntes-website-eb464.firebaseapp.com",
  projectId: "ntes-website-eb464",
  storageBucket: "ntes-website-eb464.firebasestorage.app",
  messagingSenderId: "309250133366",
  appId: "1:309250133366:web:247e076f6ec60714ec3e57",
  measurementId: "G-LQJQWN9C8E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function uploadGalleryData() {
  try {
    console.log('Uploading gallery data to Firebase...');

    for (const item of galleryData) {
      await addDoc(collection(db, 'gallery'), {
        name: item.title,
        category: item.category,
        url: item.image,
        description: item.description
      });
      console.log(`Uploaded: ${item.title}`);
    }

    console.log('All gallery items uploaded successfully!');
  } catch (error) {
    console.error('Error uploading gallery data:', error);
  }
}

uploadGalleryData();
