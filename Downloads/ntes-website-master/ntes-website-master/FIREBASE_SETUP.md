# Firebase Setup Guide for NTES Website

## 🚀 Quick Setup (Recommended)

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project" or "Add project"
3. Name it "ntes-website" (or your preferred name)
4. Enable Google Analytics (optional but recommended)

### 2. Enable Required Services

#### Authentication
1. Go to **Authentication** in the left sidebar
2. Click **Get started**
3. Go to **Sign-in method** tab
4. Enable **Email/Password** provider
5. Click **Save**

#### Firestore Database
1. Go to **Firestore Database** in the left sidebar
2. Click **Create database**
3. Choose **Start in test mode** (you can change rules later)
4. Select a location (choose one close to your users)
5. Click **Done**

#### Storage
1. Go to **Storage** in the left sidebar
2. Click **Get started**
3. Choose **Start in test mode** (you can change rules later)
4. Select the same location as Firestore
5. Click **Done**

### 3. Update Firebase Config
1. Go to **Project settings** (gear icon)
2. Scroll down to "Your apps" section
3. Click the **Web app icon** (`</>`) to add a web app
4. Register your app with name "NTES Website"
5. Copy the config object and replace the one in `src/firebase.ts`

### 4. Set Up Security Rules

#### Firestore Rules
Go to **Firestore Database** > **Rules** and replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to authenticated users
    match /{document=**} {
      allow read, write: if request.auth != null;
    }

    // Allow read access to gallery for everyone (public gallery)
    match /gallery/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Allow read access to content for everyone
    match /content/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Allow read/write access to contacts for authenticated users
    match /contacts/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

#### Storage Rules
Go to **Storage** > **Rules** and replace with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow read access to gallery images for everyone
    match /gallery/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Allow read/write access to logos for authenticated users
    match /logos/{allPaths=**} {
      allow read, write: if request.auth != null;
    }

    // Allow read/write access to other assets for authenticated users
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 5. Create Admin Account
1. Go to your website at `http://localhost:3001`
2. Long press the logo (2 seconds) to access admin
3. Click "Try Demo Account" or create your own admin account
4. Use email: `admin@ntes.com` and password: `admin123`

## 🔧 Troubleshooting

### Upload Not Working
- **Check Console**: Open browser dev tools (F12) and check console for errors
- **Firebase Config**: Ensure `src/firebase.ts` has correct config
- **Security Rules**: Make sure Storage and Firestore rules allow writes
- **Authentication**: Ensure you're logged in as admin

### Common Errors
- `auth/project-not-found`: Check Firebase config
- `permission-denied`: Update security rules
- `storage/unauthorized`: Check Storage rules
- `quota-exceeded`: Upgrade Firebase plan

### Test Upload
1. Go to admin panel (`/admin`)
2. Select a category (not "All")
3. Try uploading a small image (<1MB)
4. Check browser console for errors

## 📋 Firebase Services Used

- **Authentication**: Admin login system
- **Firestore**: Store gallery metadata, content, contacts
- **Storage**: Store images and files
- **Analytics**: Track website usage (optional)

## 🔒 Security Best Practices

1. **Change Security Rules**: Replace test mode rules with production rules
2. **Environment Variables**: Move Firebase config to environment variables
3. **User Roles**: Implement different permission levels
4. **Rate Limiting**: Add upload limits and validation
5. **Backup**: Regular database backups

## 📞 Support

If you encounter issues:
1. Check this guide first
2. Review Firebase console for errors
3. Check browser developer tools
4. Ensure all services are enabled

---

**Your NTES website is now ready for content management!** 🎉