import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import HomePage from './pages/HomePage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ChaptersPage from './pages/ChaptersPage'
import ChapterDetailPage from './pages/ChapterDetailPage'
import ExercisesPage from './pages/ExercisesPage'
import ExerciseDetailPage from './pages/ExerciseDetailPage'
import GoalSettingPage from './pages/GoalSettingPage'
import PromptsPage from './pages/PromptsPage'
import ResourcesPage from './pages/ResourcesPage'
import ProfilePage from './pages/ProfilePage'
import SeedDataPage from './pages/SeedDataPage'
import ProtectedRoute from './components/auth/ProtectedRoute'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/chapters" element={
          <ProtectedRoute>
            <ChaptersPage />
          </ProtectedRoute>
        } />
        <Route path="/chapters/:chapterNumber" element={
          <ProtectedRoute>
            <ChapterDetailPage />
          </ProtectedRoute>
        } />
        <Route path="/exercises" element={
          <ProtectedRoute>
            <ExercisesPage />
          </ProtectedRoute>
        } />
        <Route path="/exercises/:exerciseId" element={
          <ProtectedRoute>
            <ExerciseDetailPage />
          </ProtectedRoute>
        } />
        <Route path="/goals" element={
          <ProtectedRoute>
            <GoalSettingPage />
          </ProtectedRoute>
        } />
        <Route path="/prompts" element={
          <ProtectedRoute>
            <PromptsPage />
          </ProtectedRoute>
        } />
        <Route path="/resources" element={
          <ProtectedRoute>
            <ResourcesPage />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/seed" element={
          <ProtectedRoute>
            <SeedDataPage />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="top-right" />
    </>
  )
}

export default App