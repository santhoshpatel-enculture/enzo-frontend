import {
  BrowserRouter,
  HashRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useParams,
} from 'react-router-dom';
import { isTauriApp } from './lib/platform';
import { useAuthStore } from './store/authStore';
import AuthBootstrap from './components/AuthBootstrap';
import PageWrapper from './components/PageWrapper';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import Home from './pages/Home';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import ChangePassword from './pages/ChangePassword';
import Actions from './pages/Actions';
import Team from './pages/Team';
import OrgChart from './pages/OrgChart';
import Programs from './pages/Programs';
import ProgramDetail from './pages/ProgramDetail';
import Notifications from './pages/Notifications';
import AiVibeCheckSurvey from './pages/AiVibeCheckSurvey';
import { getPostLoginPath } from './lib/authRedirect';

interface ProtectedRouteProps {
  children: React.JSX.Element;
  allowPasswordChange?: boolean;
}

function RootRedirect() {
  const user = useAuthStore((s) => s.user);
  return <Navigate to={getPostLoginPath(user)} replace />;
}

function RedirectLegacySurveyDetail() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/programs/${encodeURIComponent(id ?? '')}`} replace />;
}

function ProtectedRoute({ children, allowPasswordChange = false }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.mustChangePassword && !allowPasswordChange && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }

  return children;
}

const AppRouter = isTauriApp() ? HashRouter : BrowserRouter;

export default function App() {
  return (
    <AuthBootstrap>
      <AppRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          <Route
            path="/change-password"
            element={
              <ProtectedRoute allowPasswordChange>
                <PageWrapper>
                  <ChangePassword />
                </PageWrapper>
              </ProtectedRoute>
            }
          />

          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <PageWrapper>
                  <Home />
                </PageWrapper>
              </ProtectedRoute>
            }
          />

          <Route
            path="/actions"
            element={
              <ProtectedRoute>
                <PageWrapper>
                  <Actions />
                </PageWrapper>
              </ProtectedRoute>
            }
          />

          <Route
            path="/team"
            element={
              <ProtectedRoute>
                <PageWrapper>
                  <Team />
                </PageWrapper>
              </ProtectedRoute>
            }
          />

          <Route
            path="/org-chart"
            element={
              <ProtectedRoute>
                <PageWrapper>
                  <OrgChart />
                </PageWrapper>
              </ProtectedRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <PageWrapper>
                  <Notifications />
                </PageWrapper>
              </ProtectedRoute>
            }
          />

          <Route
            path="/programs"
            element={
              <ProtectedRoute>
                <PageWrapper>
                  <Programs />
                </PageWrapper>
              </ProtectedRoute>
            }
          />

          <Route
            path="/programs/ai-vibe-check-2026"
            element={
              <ProtectedRoute>
                <PageWrapper>
                  <AiVibeCheckSurvey />
                </PageWrapper>
              </ProtectedRoute>
            }
          />

          <Route
            path="/programs/:id"
            element={
              <ProtectedRoute>
                <PageWrapper>
                  <ProgramDetail />
                </PageWrapper>
              </ProtectedRoute>
            }
          />

          <Route path="/surveys" element={<Navigate to="/programs" replace />} />
          <Route
            path="/surveys/ai-vibe-check-2026"
            element={<Navigate to="/programs/ai-vibe-check-2026" replace />}
          />
          <Route path="/surveys/:id" element={<RedirectLegacySurveyDetail />} />

          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <PageWrapper fullBleed>
                  <Chat />
                </PageWrapper>
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <PageWrapper>
                  <Profile />
                </PageWrapper>
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <PageWrapper>
                  <Settings />
                </PageWrapper>
              </ProtectedRoute>
            }
          />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <RootRedirect />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </AppRouter>
    </AuthBootstrap>
  );
}
