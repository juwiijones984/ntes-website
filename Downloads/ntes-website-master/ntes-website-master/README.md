
# NTES Business Website

A modern, responsive business website showcasing NTES (Nexus Tech & Electrical Solutions) services including electrical installations, graphic design, ICT projects, and business solutions. Built with React, TypeScript, and Tailwind CSS.

## 🌟 Features

- **Responsive Design**: Fully responsive across all devices
- **Dynamic Gallery**: Automatically scans and displays images from organized folders
- **Modern UI**: Clean, professional design with smooth animations
- **Accessibility**: WCAG compliant with proper ARIA labels
- **Fast Performance**: Optimized with Vite for lightning-fast loading
- **SEO Ready**: Meta tags and semantic HTML structure

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Build Tool**: Vite
- **Icons**: Lucide React
- **UI Components**: Radix UI (shadcn/ui)
- **Deployment**: Render (Static Site)

## 📁 Project Structure

```
src/
├── assets/                 # Static assets organized by service
│   ├── auto-elec/         # Auto Electric services
│   ├── business-solutions/# Business documentation
│   ├── graphic-designing/ # Design portfolio
│   ├── hardware-upgrade-repair/ # Hardware services
│   ├── house-wiring/      # Electrical installations
│   ├── ict-projects/      # Tech projects
│   ├── pumps/            # Pump installations/repairs
│   └── smart-agric/      # Agriculture solutions
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── About.tsx         # About section
│   ├── Certifications.tsx# Certifications
│   ├── Contact.tsx       # Contact form
│   ├── Gallery.tsx       # Dynamic image gallery
│   ├── Hero.tsx          # Hero section
│   ├── Navigation.tsx    # Navigation bar
│   ├── Pricing.tsx       # Pricing plans
│   ├── Services.tsx      # Services overview
│   └── TechServices.tsx  # Technical services
└── styles/               # Global styles
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/juwiijones984/ntes-website.git
cd ntes-website
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Open [http://localhost:3001](http://localhost:3001) in your browser

## 👨‍💼 Admin System

The website includes a comprehensive admin panel for content management:

### Admin Features

- **Secure Authentication**: Firebase Authentication for admin access
- **Gallery Management**: Upload, organize, and delete images by category
- **Content Editing**: Edit all website text content in real-time
- **Dynamic Sections**: Add new content sections with a single click
- **File Upload**: Direct upload to Firebase Storage from device
- **Category Management**: Create and manage image categories

### Accessing Admin Panel

1. Navigate to `/admin` on your website
2. Log in with admin credentials
3. Access gallery management and content editing tools

### Firebase Setup Required

Before using the admin features, set up Firebase:

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication and Firestore Database
3. Enable Storage for file uploads
4. Update the configuration in `src/firebase.ts`
5. Create an admin user in Firebase Authentication

## 📸 Gallery System

The gallery dynamically loads images from Firebase Storage and displays them by category:

### Admin Gallery Management

- **Upload Images**: Drag & drop or select multiple files
- **Create Categories**: Add new service categories on the fly
- **Organize Content**: Move images between categories
- **Delete Images**: Remove unwanted content safely

### Current Gallery Categories

- **Auto Electric**: Car rewiring and electrical repairs
- **Business Solutions**: Company profiles and documentation
- **Graphic Designing**: Logos, posters, and design work
- **Hardware Upgrade & Repair**: Computer and device repairs
- **House Wiring**: Residential electrical installations
- **ICT Projects**: Technology implementations and IoT solutions
- **Pumps**: Pump installation and maintenance
- **Smart Agriculture**: Agricultural technology solutions
- **Exclusive Haircuts**: Salon services and branding

## 🏗️ Build & Deployment

### Local Build

```bash
npm run build
npm run preview  # Preview production build locally
```

### Production Build Features

- **Code Splitting**: Optimized chunk splitting for better performance
- **Minification**: ESBuild minification for smaller bundle size
- **Asset Optimization**: Automatic image optimization and compression
- **Tree Shaking**: Removes unused code automatically

### Deploy to Render (Static Site)

1. **Connect Repository**:
   - Go to [render.com](https://render.com)
   - Connect your GitHub repository
   - Select "Static Site" as service type

2. **Build Settings**:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `build`
   - **Node Version**: `18` or higher

3. **Environment Variables** (if using Firebase):
   - Add your Firebase config variables as environment variables

4. **Deploy**:
   - Push to main branch to trigger automatic deployment
   - Or manually deploy from Render dashboard

**Live Site**: [https://ntes-website.onrender.com](https://ntes-website.onrender.com)

### Alternative Deployment Options

#### Vercel
```bash
npm i -g vercel
vercel --prod
```

#### Netlify
```bash
npm i -g netlify-cli
netlify deploy --prod --dir=build
```

#### GitHub Pages
```bash
npm i -g gh-pages
npm run build
gh-pages -d build
```

## 🎨 Customization

### Adding New Services

1. Create a new folder in `src/assets/`
2. Add images to the folder
3. The gallery will automatically detect and display them

### Styling

- Colors and themes can be modified in `tailwind.config.js`
- Component styles are in individual component files
- Global styles in `src/index.css`

### Content Updates

- Update service descriptions in component files
- Modify contact information in `Contact.tsx`
- Change pricing in `Pricing.tsx`

## 🤝 Services Offered

### Electrical Services
- House wiring installations
- Auto electric repairs
- Pump installations and maintenance

### Technology Solutions
- ICT project implementation
- Hardware upgrades and repairs
- IoT laboratory setups

### Design Services
- Graphic design and branding
- Business documentation
- Digital marketing materials

### Business Solutions
- Company profile development
- Business consulting
- Smart agriculture implementations

## 📱 Responsive Design

The website is fully responsive and optimized for:
- Desktop computers (1200px+)
- Tablets (768px - 1199px)
- Mobile phones (320px - 767px)

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Code Quality

- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Accessibility (a11y) compliance

## 📄 License

This project is proprietary software for NTES Business Solutions.

## 📞 Contact

**NTES (Nexus Tech & Electrical Solutions)**
- Website: [ntes-website.onrender.com](https://ntes-website.onrender.com)
- Repository: [github.com/juwiijones984/ntes-website](https://github.com/juwiijones984/ntes-website)

---

*Built with ❤️ for modern business solutions*