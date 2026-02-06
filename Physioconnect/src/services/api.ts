import type {
    User,
    Patient,
    Physiotherapist,
    Appointment,
    ApiResponse,
    PaginatedResponse,
    PhysiotherapistDashboard,
    PatientDashboard,
    ExerciseVideo,
    TreatmentPlan,
    DailyProgress,
    Session,
    Message,
    Reminder,
    LoginFormData
} from '../types'

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// Generic fetch wrapper with error handling
async function fetchApi<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    try {
        const token = localStorage.getItem('auth_token')

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                ...options.headers,
            },
            ...options,
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            return {
                success: false,
                error: errorData.message || `HTTP error! status: ${response.status}`,
            }
        }

        const data = await response.json()
        return { success: true, data }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
        }
    }
}

// ============================================
// AUTHENTICATION API
// ============================================

export const authApi = {
    login: (data: LoginFormData) =>
        fetchApi<{ token: string; user: User }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    logout: () =>
        fetchApi<void>('/auth/logout', { method: 'POST' }),

    refreshToken: () =>
        fetchApi<{ token: string }>('/auth/refresh', { method: 'POST' }),

    getProfile: () =>
        fetchApi<User>('/auth/profile'),

    updateProfile: (data: Partial<User>) =>
        fetchApi<User>('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
}

// ============================================
// PATIENT API
// ============================================

export const patientApi = {
    getAll: (page = 1, limit = 10) =>
        fetchApi<PaginatedResponse<Patient>>(`/patients?page=${page}&limit=${limit}`),

    getById: (id: string) =>
        fetchApi<Patient>(`/patients/${id}`),

    create: (data: Partial<Patient>) =>
        fetchApi<Patient>('/patients', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    update: (id: string, data: Partial<Patient>) =>
        fetchApi<Patient>(`/patients/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    delete: (id: string) =>
        fetchApi<void>(`/patients/${id}`, { method: 'DELETE' }),

    search: (query: string) =>
        fetchApi<Patient[]>(`/patients/search?q=${encodeURIComponent(query)}`),

    getProgress: (id: string) =>
        fetchApi<DailyProgress[]>(`/patients/${id}/progress`),

    getTreatmentPlans: (id: string) =>
        fetchApi<TreatmentPlan[]>(`/patients/${id}/treatment-plans`),
}

// ============================================
// PHYSIOTHERAPIST API
// ============================================

export const physiotherapistApi = {
    getAll: (page = 1, limit = 10) =>
        fetchApi<PaginatedResponse<Physiotherapist>>(`/physiotherapists?page=${page}&limit=${limit}`),

    getById: (id: string) =>
        fetchApi<Physiotherapist>(`/physiotherapists/${id}`),

    getPatients: (id: string) =>
        fetchApi<Patient[]>(`/physiotherapists/${id}/patients`),

    getDashboard: (id: string) =>
        fetchApi<PhysiotherapistDashboard>(`/physiotherapists/${id}/dashboard`),
}

// ============================================
// APPOINTMENT API
// ============================================

export const appointmentApi = {
    getAll: (page = 1, limit = 10) =>
        fetchApi<PaginatedResponse<Appointment>>(`/appointments?page=${page}&limit=${limit}`),

    getById: (id: string) =>
        fetchApi<Appointment>(`/appointments/${id}`),

    getByDate: (date: string) =>
        fetchApi<Appointment[]>(`/appointments/date/${date}`),

    getByPatient: (patientId: string) =>
        fetchApi<Appointment[]>(`/appointments/patient/${patientId}`),

    getByPhysiotherapist: (physiotherapistId: string, date?: string) =>
        fetchApi<Appointment[]>(
            `/appointments/physiotherapist/${physiotherapistId}${date ? `?date=${date}` : ''}`
        ),

    create: (data: Partial<Appointment>) =>
        fetchApi<Appointment>('/appointments', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    update: (id: string, data: Partial<Appointment>) =>
        fetchApi<Appointment>(`/appointments/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    cancel: (id: string, reason?: string) =>
        fetchApi<Appointment>(`/appointments/${id}/cancel`, {
            method: 'POST',
            body: JSON.stringify({ reason }),
        }),

    complete: (id: string, notes?: string) =>
        fetchApi<Appointment>(`/appointments/${id}/complete`, {
            method: 'POST',
            body: JSON.stringify({ notes }),
        }),

    sendReminder: (id: string, type: 'sms' | 'push' | 'email') =>
        fetchApi<void>(`/appointments/${id}/remind`, {
            method: 'POST',
            body: JSON.stringify({ type }),
        }),
}

// ============================================
// EXERCISE & VIDEO API
// ============================================

export const exerciseApi = {
    getAllVideos: (filters?: {
        bodyPart?: string
        condition?: string
        difficulty?: string
        search?: string
    }) => {
        const params = new URLSearchParams()
        if (filters?.bodyPart) params.append('bodyPart', filters.bodyPart)
        if (filters?.condition) params.append('condition', filters.condition)
        if (filters?.difficulty) params.append('difficulty', filters.difficulty)
        if (filters?.search) params.append('search', filters.search)
        return fetchApi<ExerciseVideo[]>(`/exercises/videos?${params.toString()}`)
    },

    getVideoById: (id: string) =>
        fetchApi<ExerciseVideo>(`/exercises/videos/${id}`),

    uploadVideo: (formData: FormData) =>
        fetch(`${API_BASE_URL}/exercises/videos`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            },
            body: formData,
        }).then(res => res.json()) as Promise<ApiResponse<ExerciseVideo>>,

    deleteVideo: (id: string) =>
        fetchApi<void>(`/exercises/videos/${id}`, { method: 'DELETE' }),

    markOfflineAvailable: (id: string, available: boolean) =>
        fetchApi<ExerciseVideo>(`/exercises/videos/${id}/offline`, {
            method: 'PUT',
            body: JSON.stringify({ available }),
        }),
}

// ============================================
// TREATMENT PLAN API
// ============================================

export const treatmentApi = {
    getAll: (patientId?: string) =>
        fetchApi<TreatmentPlan[]>(
            patientId ? `/treatments?patientId=${patientId}` : '/treatments'
        ),

    getById: (id: string) =>
        fetchApi<TreatmentPlan>(`/treatments/${id}`),

    create: (data: Partial<TreatmentPlan>) =>
        fetchApi<TreatmentPlan>('/treatments', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    update: (id: string, data: Partial<TreatmentPlan>) =>
        fetchApi<TreatmentPlan>(`/treatments/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    addExercise: (id: string, exerciseData: unknown) =>
        fetchApi<TreatmentPlan>(`/treatments/${id}/exercises`, {
            method: 'POST',
            body: JSON.stringify(exerciseData),
        }),

    removeExercise: (id: string, exerciseId: string) =>
        fetchApi<TreatmentPlan>(`/treatments/${id}/exercises/${exerciseId}`, {
            method: 'DELETE',
        }),
}

// ============================================
// SESSION API
// ============================================

export const sessionApi = {
    getByTreatment: (treatmentId: string) =>
        fetchApi<Session[]>(`/sessions?treatmentId=${treatmentId}`),

    getById: (id: string) =>
        fetchApi<Session>(`/sessions/${id}`),

    create: (data: Partial<Session>) =>
        fetchApi<Session>('/sessions', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    update: (id: string, data: Partial<Session>) =>
        fetchApi<Session>(`/sessions/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
}

// ============================================
// PROGRESS API
// ============================================

export const progressApi = {
    getByPatient: (patientId: string, startDate?: string, endDate?: string) => {
        const params = new URLSearchParams()
        if (startDate) params.append('startDate', startDate)
        if (endDate) params.append('endDate', endDate)
        return fetchApi<DailyProgress[]>(`/progress/patient/${patientId}?${params.toString()}`)
    },

    submitDaily: (data: Partial<DailyProgress>) =>
        fetchApi<DailyProgress>('/progress', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    update: (id: string, data: Partial<DailyProgress>) =>
        fetchApi<DailyProgress>(`/progress/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
}

// ============================================
// MESSAGING API
// ============================================

export const messageApi = {
    getConversation: (userId1: string, userId2: string) =>
        fetchApi<Message[]>(`/messages/${userId1}/${userId2}`),

    send: (data: { receiverId: string; content: string; type: Message['type'] }) =>
        fetchApi<Message>('/messages', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    markAsRead: (id: string) =>
        fetchApi<Message>(`/messages/${id}/read`, { method: 'PUT' }),
}

// ============================================
// REMINDER API
// ============================================

export const reminderApi = {
    getByPatient: (patientId: string) =>
        fetchApi<Reminder[]>(`/reminders/patient/${patientId}`),

    create: (data: Partial<Reminder>) =>
        fetchApi<Reminder>('/reminders', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    update: (id: string, data: Partial<Reminder>) =>
        fetchApi<Reminder>(`/reminders/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    delete: (id: string) =>
        fetchApi<void>(`/reminders/${id}`, { method: 'DELETE' }),
}

// ============================================
// DASHBOARD API
// ============================================

export const dashboardApi = {
    getPhysiotherapistDashboard: () =>
        fetchApi<PhysiotherapistDashboard>('/dashboard/physiotherapist'),

    getPatientDashboard: () =>
        fetchApi<PatientDashboard>('/dashboard/patient'),

    getRecentPatients: (limit = 5) =>
        fetchApi<Patient[]>(`/dashboard/recent-patients?limit=${limit}`),

    getUpcomingAppointments: (limit = 5) =>
        fetchApi<Appointment[]>(`/dashboard/upcoming-appointments?limit=${limit}`),

    getComplianceStats: (period: 'week' | 'month' | 'year') =>
        fetchApi<{ date: string; rate: number }[]>(`/dashboard/compliance?period=${period}`),
}

// ============================================
// OFFLINE SYNC UTILITIES
// ============================================

export function isOffline(): boolean {
    return typeof navigator !== 'undefined' && !navigator.onLine
}

export function getStoredToken(): string | null {
    return localStorage.getItem('auth_token')
}

export function setStoredToken(token: string): void {
    localStorage.setItem('auth_token', token)
}

export function clearStoredToken(): void {
    localStorage.removeItem('auth_token')
}

// Export all APIs
export default {
    auth: authApi,
    patients: patientApi,
    physiotherapists: physiotherapistApi,
    appointments: appointmentApi,
    exercises: exerciseApi,
    treatments: treatmentApi,
    sessions: sessionApi,
    progress: progressApi,
    messages: messageApi,
    reminders: reminderApi,
    dashboard: dashboardApi,
}
