import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import StoriesPage from './pages/StoriesPage';
import StoryGenerationPage from './pages/StoryGenerationPage';
import StoryDetailPage from './pages/StoryDetailPage';
import StoryEditPage from './pages/StoryEditPage';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';


function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/stories" element={<StoriesPage />} />
          <Route path="/stories/:id" element={<StoryDetailPage />} />
          <Route path="/stories/:id/edit" element={<StoryEditPage />} />
          <Route path="/generate-story" element={<StoryGenerationPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App; 