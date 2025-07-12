# ReWear - Community Clothing Exchange Platform

A web-based platform that enables users to exchange unused clothing through direct swaps or a point-based redemption system. The goal is to promote sustainable fashion and reduce textile waste by encouraging users to reuse wearable garments instead of discarding them.

## 🚀 Features

### ✅ Completed Features

#### User Authentication
- Email/password signup and login
- JWT-based authentication with secure cookies
- User profile management
- Logout functionality
- Persistent authentication state

#### Landing Page
- Platform introduction with hero section
- Calls-to-action: "Start Swapping", "Browse Items", "List an Item"
- Featured items carousel
- How it works section

#### User Dashboard
- Profile details and points balance display
- Uploaded items overview with approval status
- Ongoing and completed swaps list
- Received swap requests with accept/reject functionality
- Tabbed interface for better organization

#### Item Management
- Add new items with multiple image uploads
- Item categorization and tagging
- Condition and size specifications
- Cloudinary integration for image storage
- Item approval system for admins

#### Item Browsing & Search
- Browse all approved items with pagination
- Search functionality by title, description, and tags
- Category filtering
- Grid and list view modes
- Responsive design for all devices

#### Item Detail Page
- Full item information display
- Image gallery with navigation
- Uploader information and points balance
- Swap request functionality (direct swap or points redemption)
- Item availability status

#### Swap System
- Direct item-to-item swaps
- Points-based redemption system
- Swap request management
- Accept/reject swap requests
- Points balance tracking
- Swap history and status tracking

#### Admin Panel
- Comprehensive admin dashboard with statistics
- Item moderation (approve/reject/remove)
- User management with admin role assignment
- Points management for users
- Recent activity monitoring
- Pagination for large datasets

#### Technical Features
- Professional code standards and architecture
- Secure cookie-based authentication
- Responsive UI with modern design
- Error handling and user feedback
- Loading states and skeleton components
- Form validation and data integrity

## 🛠️ Technology Stack

### Backend
- **Framework**: Flask (Python)
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT with secure cookies
- **File Storage**: Cloudinary for image uploads
- **CORS**: Configured for frontend integration

### Frontend
- **Framework**: React 19 with Vite
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: Zustand with persistence
- **Routing**: React Router DOM
- **HTTP Client**: Axios with interceptors
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **Notifications**: Sonner toast notifications

## 📦 Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 18+
- PostgreSQL database
- Cloudinary account

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd re-wear/backend
   ```

2. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**:
   Create a `.env` file in the backend directory:
   ```env
   DATABASE_URL=postgresql+psycopg2://username:password@localhost:5432/re-wear
   SECRET_KEY=your-secret-key
   JWT_SECRET_KEY=your-jwt-secret
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

4. **Initialize database**:
   ```bash
   python run.py
   ```

5. **Start the backend server**:
   ```bash
   python run.py
   ```
   The backend will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd re-wear/frontend
   ```

2. **Install Node.js dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`

## 🔧 Configuration

### Database Setup
1. Create a PostgreSQL database named `re-wear`
2. Update the `DATABASE_URL` in your environment variables
3. The application will automatically create tables on first run

### Cloudinary Setup
1. Create a Cloudinary account
2. Get your cloud name, API key, and API secret
3. Update the environment variables with your Cloudinary credentials

### Admin User Creation
To create an admin user, you can either:
1. Manually set `is_admin = True` in the database for a user
2. Use the admin panel to promote a user to admin (if you have an existing admin)

## 🎯 Usage

### For Regular Users
1. **Sign up** with email and password
2. **Browse items** on the home page
3. **List items** by uploading photos and details
4. **Request swaps** either directly or using points
5. **Manage swaps** in your dashboard

### For Admins
1. **Access admin panel** via the "Admin" button in the navbar
2. **Moderate items** by approving or rejecting listings
3. **Manage users** by viewing profiles and adjusting admin status
4. **Add points** to users as needed
5. **Monitor platform statistics** on the dashboard

## 🔒 Security Features

- JWT tokens stored in secure HTTP-only cookies
- Password hashing with PBKDF2
- CORS configuration for secure cross-origin requests
- Input validation and sanitization
- Admin role-based access control
- SQL injection prevention with ORM

## 🎨 UI/UX Features

- Modern, responsive design
- Dark/light theme support
- Loading states and skeleton components
- Toast notifications for user feedback
- Accessible components with proper ARIA labels
- Mobile-first responsive design
- Smooth animations and transitions

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- All modern browsers

## 🚀 Deployment

### Backend Deployment
- Can be deployed to Heroku, Railway, or any Python hosting platform
- Set environment variables for production
- Use production-grade database (PostgreSQL recommended)

### Frontend Deployment
- Can be deployed to Vercel, Netlify, or any static hosting platform
- Update API base URL for production backend
- Build with `npm run build`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support or questions, please open an issue in the repository.

---

**ReWear** - Making fashion sustainable, one swap at a time! 🌱👕

