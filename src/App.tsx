import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/hooks/useAuth'
import { ThemeProvider } from '@/hooks/useTheme'
import { ToastProvider } from '@/hooks/useToast'
import { Layout } from '@/components/layout/Layout'
import { ProtectedRoute } from '@/components/admin/ProtectedRoute'
import { HomePage } from '@/pages/HomePage'
import { SchedulePage } from '@/pages/SchedulePage'
import { HomeworkPage } from '@/pages/HomeworkPage'
import { MaterialsPage } from '@/pages/MaterialsPage'
import { CalendarPage } from '@/pages/CalendarPage'
import { AnnouncementsPage } from '@/pages/AnnouncementsPage'
import { LoginPage } from '@/pages/LoginPage'
import { AdminPage } from '@/pages/admin/AdminPage'

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/schedule" element={<SchedulePage />} />
                <Route path="/homework" element={<HomeworkPage />} />
                <Route path="/materials" element={<MaterialsPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/announcements" element={<AnnouncementsPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminPage />
                    </ProtectedRoute>
                  }
                />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}
