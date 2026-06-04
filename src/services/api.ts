/**
 * Enzo API Client — communicates with the FastAPI backend.
 * JWT is kept in memory for requests and mirrored in sessionStorage
 * (see authSession) so reload keeps the signed-in session in this tab.
 */
import { clearSession } from '../lib/authSession';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

let _token: string | null = null;
let _refreshing: Promise<string | null> | null = null;

export function setAuthToken(token: string | null) {
  _token = token;
}

export function getAuthToken(): string | null {
  return _token;
}

export function getMicrosoftSsoStartUrl(): string {
  return `${API_BASE}/auth/sso/microsoft/start?app=frontend`;
}

async function refreshAccessToken(): Promise<string | null> {
  if (_refreshing) return _refreshing;
  _refreshing = (async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) return null;
      const data = await res.json();
      _token = data.access_token;
      return _token;
    } catch {
      return null;
    } finally {
      _refreshing = null;
    }
  })();
  return _refreshing;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  retried = false,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (_token) {
    headers['Authorization'] = `Bearer ${_token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: options.credentials,
  });

  if (res.status === 401 && !retried && !path.includes('/auth/')) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return request<T>(path, options, true);
    }
    _token = null;
    clearSession();
    if (!window.location.pathname.startsWith('/login')) {
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }

  if (res.status === 401) {
    _token = null;
    clearSession();
    if (!window.location.pathname.startsWith('/login')) {
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(err.detail || 'Request failed');
  }

  return res.json();
}

// Auth
export async function login(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Login failed' }));
    throw new Error(err.detail || 'Login failed');
  }
  return res.json() as Promise<{ access_token: string; expires_in?: number; user: UserProfile }>;
}

export async function refreshSession() {
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Session expired');
  const data = await res.json();
  _token = data.access_token;
  return data as { access_token: string; user: UserProfile };
}

export async function logoutApi() {
  await fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
  _token = null;
}

export async function getMe() {
  return request<UserProfile>('/auth/me');
}

export async function changePassword(currentPassword: string, newPassword: string) {
  return request<{ message: string }>('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

// Org
export async function getManager() {
  return request<OrgPersonSummary | null>('/org/manager');
}

export async function getReportees() {
  return request<OrgReporteesResponse>('/org/reportees');
}

export async function getOrgTree() {
  return request<OrgTreeResponse>('/org/tree');
}

// Programs
export async function getPrograms() {
  return request<ProgramListResponse>('/programs');
}

export async function getProgram(id: string) {
  return request<ProgramDetail>(`/programs/${encodeURIComponent(id)}`);
}

export async function getAiVibeCheckStatus() {
  return request<VibeCheckStatusResponse>('/programs/ai-vibe-check-2026/status');
}

export async function submitAiVibeCheck(answers: Record<string, string | string[]>) {
  return request<VibeCheckSubmitResponse>('/programs/ai-vibe-check-2026/submit', {
    method: 'POST',
    body: JSON.stringify({ answers }),
  });
}

// Profile
export async function getProfile() {
  return request<UserProfile>('/profile');
}

// Tasks
export async function getTasks(params?: { status?: string; priority?: string }) {
  const qs = new URLSearchParams();
  if (params?.status) qs.set('status', params.status);
  if (params?.priority) qs.set('priority', params.priority);
  const query = qs.toString();
  return request<TaskListResponse>(`/tasks${query ? `?${query}` : ''}`);
}

export async function getPendingTasks() {
  return request<TaskListResponse>('/tasks/pending');
}

export async function getCriticalTasks() {
  return request<TaskListResponse>('/tasks/critical');
}

export async function getUpcomingTasks(days = 7) {
  return request<TaskListResponse>(`/tasks/upcoming?days=${days}`);
}

// Chat — streaming
export async function sendChatMessage(
  message: string,
  conversationId: string | null,
  onChunk: (chunk: string) => void,
  onDone: (fullReply: string, convId: string) => void,
) {
  const res = await fetch(`${API_BASE}/chat/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ..._token ? { 'Authorization': `Bearer ${_token}` } : {},
    },
    body: JSON.stringify({ message, conversation_id: conversationId }),
  });

  if (!res.ok) {
    throw new Error('Chat request failed');
  }

  const convId = res.headers.get('X-Conversation-Id') || '';
  const reader = res.body?.getReader();
  const decoder = new TextDecoder();
  let fullReply = '';
  let buffer = '';

  const handleData = (data: string): boolean => {
    if (data === '[DONE]') {
      onDone(fullReply, convId);
      return true;
    }
    let text = data;
    try {
      // Tokens are JSON-encoded server-side so newlines/markdown survive.
      text = JSON.parse(data);
    } catch {
      text = data;
    }
    fullReply += text;
    onChunk(text);
    return false;
  };

  if (reader) {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      // Keep the last (possibly partial) line in the buffer.
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          if (handleData(line.slice(6))) return;
        }
      }
    }

    // Flush any trailing complete event left in the buffer.
    if (buffer.startsWith('data: ')) {
      if (handleData(buffer.slice(6))) return;
    }
  }

  onDone(fullReply, convId);
}

export async function getChatHistory() {
  return request<ConversationSummary[]>('/chat/history');
}

export async function getConversation(id: string) {
  return request<Conversation>(`/chat/history/${encodeURIComponent(id)}`);
}

export async function deleteConversation(id: string) {
  return request<{ message: string }>(`/chat/history/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export async function clearAllHistory() {
  return request<{ message: string }>('/chat/history', { method: 'DELETE' });
}

// Dashboard
export interface PublicAIConfig {
  primaryModel: string;
  primaryLabel: string;
  fallbackModel: string;
  fallbackLabel: string;
  streamingEnabled: boolean;
  groqConfigured: boolean;
  openaiConfigured: boolean;
  updatedAt?: string | null;
}

export async function getPlatformAI() {
  return request<PublicAIConfig>('/platform/ai');
}

export async function getDashboardSummary() {
  return request<DashboardSummary>('/dashboard/summary');
}

// Settings
export async function getSettings() {
  return request<UserSettingsType>('/settings');
}

export async function updateSettings(settings: UserSettingsType) {
  return request<UserSettingsType>('/settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
}

// Types
export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  department: string;
  designation: string;
  manager: string;
  location: string;
  isAdmin?: boolean;
  role?: string;
  userId?: string | null;
  managerId?: string | null;
  managerEmail?: string | null;
  mustChangePassword?: boolean;
  createdAt?: string;
}

export interface OrgPersonSummary {
  id: string;
  userId: string | null;
  email: string;
  firstName: string;
  lastName: string;
  designation: string;
  department: string;
  managerId: string | null;
}

export interface OrgReporteesResponse {
  reportees: OrgPersonSummary[];
  total: number;
}

export interface OrgTreeNode {
  id: string;
  userId: string | null;
  label: string;
  email?: string;
  designation: string;
  department: string;
  managerId: string | null;
  children: OrgTreeNode[];
}

export interface OrgTreeResponse {
  roots: OrgTreeNode[];
  scope: string;
  nodeCount: number;
  focalUserId?: string | null;
}

export interface ProgramSummary {
  id: string;
  title: string;
  status: string;
  dueAt?: string | null;
  completedAt?: string | null;
  isAnonymous: boolean;
  answersVisible: boolean;
}

export interface ProgramDetail extends ProgramSummary {
  description?: string | null;
  participationStatus: string;
}

export interface ProgramListResponse {
  programs: ProgramSummary[];
  total: number;
}

export interface VibeCheckStatusResponse {
  programId: string;
  completed: boolean;
  submittedAt?: string | null;
}

export interface VibeCheckSubmitResponse {
  message: string;
  programId: string;
  submittedAt: string;
}

export interface TaskItem {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskListResponse {
  tasks: TaskItem[];
  total: number;
}

export interface ConversationSummary {
  id: string;
  title: string;
  lastMessage: string;
  updatedAt: string;
  messageCount: number;
}

export interface ChatMessageType {
  messageId?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  feedback?: { rating: 'up' | 'down'; comment?: string; at?: string };
}

export async function submitChatFeedback(data: {
  conversation_id: string;
  message_id: string;
  rating: 'up' | 'down';
  comment?: string;
}) {
  return request<{ message: string }>('/chat/feedback', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessageType[];
  createdAt: string;
  updatedAt: string;
}

export interface DashboardInsight {
  type: 'warning' | 'info' | 'suggestion' | 'success';
  title: string;
  message: string;
  icon: string;
}

export interface DashboardSummary {
  user: {
    firstName: string;
    lastName: string;
    department: string;
    designation: string;
  };
  metrics: {
    totalTasks: number;
    pendingTasks: number;
    inProgressTasks: number;
    completedTasks: number;
    criticalTasks: number;
    upcomingDeadlines: number;
    recentConversations: number;
  };
  insights: DashboardInsight[];
}

export interface UserSettingsType {
  theme: string;
  language: string;
  notifications_enabled: boolean;
  ai_suggestions_enabled: boolean;
  compact_mode: boolean;
}
