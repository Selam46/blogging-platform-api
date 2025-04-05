import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './assets/css/style.css';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import PostDetailPage from './pages/PostDetailPage';
import PostFormPage from './pages/PostFormPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CategoriesPage from './pages/CategoriesPage';
import CategoryPage from './pages/CategoryPage';
import AuthorPage from './pages/AuthorPage';
import SearchPage from './pages/SearchPage';
import MyPostsPage from './pages/MyPostsPage';
import DraftsPage from './pages/DraftsPage';
import AuthDebugPage from './pages/AuthDebugPage';

import apiTestUtils from './services/apiTest';

import AuthInit from './components/AuthInit';

function App() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      window.apiTest = apiTestUtils;
      console.info(
        'API diagnostic tools available in console. Try:\n' +
        '  window.apiTest.runApiDiagnostic()\n' +
        '  window.apiTest.testApiConnection("http://localhost:8000/api/categories/")\n' +
        '  window.apiTest.testPagination("http://localhost:8000/api/posts/")\n' +
        '  window.apiTest.testPostCreation()'
      );
    }
  }, []);
  
  return (
    <Router>
      <AuthProvider>
        <AuthInit />
        <div className="app">
          <Navbar />
          <main className="py-4">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/posts/:slug" element={<PostDetailPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/categories/:slug" element={<CategoryPage />} />
              <Route path="/authors/:id" element={<AuthorPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/debug" element={<AuthDebugPage />} />
              
              {/* Protected routes */}
              <Route 
                path="/posts/new" 
                element={
                  <ProtectedRoute>
                    <PostFormPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/posts/:slug/edit" 
                element={
                  <ProtectedRoute>
                    <PostFormPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/my-posts" 
                element={
                  <ProtectedRoute>
                    <MyPostsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/drafts" 
                element={
                  <ProtectedRoute>
                    <DraftsPage />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
          <footer className="py-3 mt-5 bg-dark text-white text-center">
            <div className="container">
              <p className="mb-0">Blogging Platform &copy; {new Date().getFullYear()}</p>
            </div>
          </footer>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App; 