import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import StoriesPage from './pages/StoriesPage';
import StoryGenerationPage from './pages/StoryGenerationPage';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import './style.css'

function App() {
  return (
    <>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/stories" element={<StoriesPage />} />
            <Route path="/generate-story" element={<StoryGenerationPage />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App; 