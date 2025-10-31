# OpenDrive - Full-Stack Cloud Storage Platform

![OpenDrive Preview](https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&h=300&fit=crop&auto=format)

A full-featured cloud storage platform built with Django REST Framework and React.js, providing Google Drive-like functionality with local file storage. Upload, organize, share, and manage your files with an intuitive web interface.

## ✨ Features

- 🔐 **User Authentication** - Secure JWT-based authentication with registration and login
- 📁 **File Management** - Upload, download, rename, and delete files
- 🗂️ **Folder Organization** - Create nested folder structures and organize files
- 🔍 **Smart Search** - Real-time search across all your files
- 📊 **Storage Tracking** - Monitor your storage usage with visual indicators
- 🔗 **File Sharing** - Generate shareable links for easy file access
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- 🎨 **Modern UI** - Clean, intuitive interface with grid and list views
- ⚡ **Drag & Drop** - Easy file uploads with drag-and-drop support
- 🗑️ **Trash Management** - Soft delete with trash folder and restore functionality

## Clone this Project

Want to create your own version of this project with all the content and structure? Clone this Cosmic bucket and code repository to get started instantly:

[![Clone this Project](https://img.shields.io/badge/Clone%20this%20Project-29abe2?style=for-the-badge&logo=cosmic&logoColor=white)](https://app.cosmicjs.com/projects/new?clone_bucket=6904615c271316ad9f4ce7f7&clone_repository=6904658a271316ad9f4ce833)

## Prompts

This application was built using the following prompts to generate the content structure and code:

### Content Model Prompt

> No content model prompt provided - app built from existing content structure

### Code Generation Prompt

> Prompt: OpenDrive (Django + React.js + Local File Storage)
> 
> Build a full-stack web application called OpenDrive — a Google Drive–style cloud storage system using Django (Python) for the backend and React.js (JavaScript) for the frontend.
> 
> The app should let users sign up, log in, and upload, view, organize, and download files with a clean, modern UI — using only local file storage, no AWS or cloud setup required.
> 
> ⚙️ Tech Stack
> 
> Backend: Django + Django REST Framework (DRF)
> 
> Frontend: React.js (JavaScript only, no TypeScript) + Tailwind CSS or plain CSS
> 
> Database: SQLite (default Django DB)
> 
> File Storage: Local storage using Django's MEDIA_ROOT and MEDIA_URL
> 
> Authentication: JWT or Django Session Authentication
> 
> 🧩 Core Features
> 
> User signup, login, and logout
> 
> Upload and download files (store locally in /media/)
> 
> Organize files in folders/subfolders
> 
> Rename and delete files
> 
> Search files by name
> 
> Show storage usage info (e.g., "25 MB used")
> 
> Responsive dashboard layout
> 
> Optional: File sharing link (just a simple public file URL)

The app has been tailored to work with a local Django backend and includes all the features requested above.

## 🛠️ Technologies Used

**Backend:**
- Django 5.0
- Django REST Framework 3.14
- djangorestframework-simplejwt 5.3 (JWT Authentication)
- Pillow 10.2 (Image processing)
- django-cors-headers 4.3 (CORS support)
- Python 3.10+

**Frontend:**
- React 18.2
- React Router DOM 6.21 (Client-side routing)
- Axios 1.6 (API requests)
- Tailwind CSS 3.4 (Styling)
- Lucide React (Icons)

**Database:**
- SQLite (Django default)

**File Storage:**
- Local file system (Django MEDIA_ROOT)

## 📋 Prerequisites

- Python 3.10 or higher
- Node.js 16 or higher
- npm or yarn package manager
- pip (Python package manager)
- virtualenv (recommended)

## 🚀 Getting Started

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Create and activate virtual environment:**
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

3. **Install Python dependencies:**
```bash
pip install -r requirements.txt
```

4. **Set up environment variables:**
```bash
# Create .env file in backend directory
cp .env.example .env

# Edit .env with your settings (SECRET_KEY will be auto-generated if not provided)
```

5. **Run database migrations:**
```bash
python manage.py makemigrations
python manage.py migrate
```

6. **Create media directory:**
```bash
mkdir media
```

7. **Create superuser (optional):**
```bash
python manage.py createsuperuser
```

8. **Start Django development server:**
```bash
python manage.py runserver
```

The backend API will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install npm dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
# Create .env file in frontend directory
cp .env.example .env

# Edit .env if you need to change the API URL (defaults to http://localhost:8000)
```

4. **Start React development server:**
```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## 🔌 API Endpoints

### Authentication
- `POST /api/register/` - Register new user
- `POST /api/login/` - Login and get JWT tokens
- `POST /api/token/refresh/` - Refresh JWT access token
- `GET /api/user/` - Get current user info

### Files
- `GET /api/files/` - List all files for current user
- `POST /api/files/` - Upload new file
- `GET /api/files/{id}/` - Get file details
- `PUT /api/files/{id}/` - Update file (rename, move)
- `DELETE /api/files/{id}/` - Delete file (move to trash)
- `GET /api/files/{id}/download/` - Download file
- `POST /api/files/{id}/share/` - Generate share link

### Folders
- `GET /api/folders/` - List all folders
- `POST /api/folders/` - Create new folder
- `GET /api/folders/{id}/` - Get folder details
- `PUT /api/folders/{id}/` - Update folder (rename, move)
- `DELETE /api/folders/{id}/` - Delete folder

### Storage
- `GET /api/storage/` - Get storage usage statistics

### Search
- `GET /api/search/?q={query}` - Search files by name

## 📁 Project Structure

```
OpenDrive/
├── backend/
│   ├── opendrive/          # Main Django project
│   │   ├── settings.py     # Django settings
│   │   ├── urls.py         # Main URL configuration
│   │   └── wsgi.py
│   ├── api/                # API app
│   │   ├── models.py       # Database models
│   │   ├── serializers.py  # DRF serializers
│   │   ├── views.py        # API views
│   │   ├── urls.py         # API URL patterns
│   │   └── permissions.py  # Custom permissions
│   ├── media/              # Uploaded files storage
│   ├── manage.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service layer
│   │   ├── utils/          # Utility functions
│   │   ├── App.js          # Main App component
│   │   └── index.js        # Entry point
│   ├── package.json
│   └── .env.example
└── README.md
```

## 🎯 Usage

1. **Register a new account** at `/register`
2. **Login** with your credentials
3. **Upload files** using the upload button or drag-and-drop
4. **Create folders** to organize your files
5. **Search** for files using the search bar
6. **Share files** by generating shareable links
7. **Monitor storage** usage in the sidebar
8. **Manage trash** by viewing and restoring deleted items

## 🔒 Security Features

- JWT-based authentication with access and refresh tokens
- Password hashing using Django's built-in authentication
- CORS configuration for secure cross-origin requests
- File permissions ensure users can only access their own files
- Secure file uploads with validation
- SQL injection protection through Django ORM
- CSRF protection for state-changing operations

## 🎨 Customization

### Backend Configuration
Edit `backend/opendrive/settings.py` to customize:
- Database settings
- File upload limits
- CORS allowed origins
- JWT token lifetime
- Media storage location

### Frontend Styling
Edit `frontend/src/index.css` to customize:
- Color scheme
- Typography
- Component styles
- Responsive breakpoints

## 📊 Storage Management

The application tracks storage usage per user and displays:
- Total storage used (in MB/GB)
- Number of files
- Number of folders
- Visual storage indicator

Default storage limit: 1GB per user (configurable in settings)

## 🐛 Troubleshooting

**Backend Issues:**
- Ensure all migrations are run: `python manage.py migrate`
- Check if media directory exists and has write permissions
- Verify environment variables are set correctly
- Check Django logs for detailed error messages

**Frontend Issues:**
- Clear browser cache and restart development server
- Verify API URL in `.env` matches backend URL
- Check browser console for JavaScript errors
- Ensure all npm dependencies are installed

**CORS Errors:**
- Verify `CORS_ALLOWED_ORIGINS` in Django settings includes frontend URL
- Check that `django-cors-headers` is properly installed and configured

## 🚀 Deployment Options

### Backend Deployment
1. Set `DEBUG=False` in production
2. Configure allowed hosts in settings
3. Use PostgreSQL instead of SQLite for production
4. Set up proper file storage (local or cloud)
5. Configure web server (Gunicorn + Nginx)
6. Set secure `SECRET_KEY` environment variable

### Frontend Deployment
1. Build production bundle: `npm run build`
2. Deploy build folder to static hosting (Netlify, Vercel, etc.)
3. Update API URL environment variable to production backend URL
4. Configure proper CORS settings on backend

### Environment Variables

**Backend (.env):**
```
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
DATABASE_URL=your-database-url (optional)
```

**Frontend (.env):**
```
REACT_APP_API_URL=https://your-backend-api.com
```

## 📝 License

This project is open source and available for educational and personal use.

## 🤝 Contributing

Contributions are welcome! This is a demonstration project showing full-stack development with Django and React.

## 💡 Future Enhancements

- File version history
- Collaborative editing
- Advanced file sharing with permissions
- File previews for images and documents
- Bulk operations (multi-select, move, delete)
- Activity log and notifications
- Mobile app (React Native)
- Cloud storage integration options

<!-- README_END -->