// ============================================
// USER & AUTHENTICATION TYPES
// ============================================

export type UserRole = 'physiotherapist' | 'patient' | 'superadmin'

export interface User {
    id: string
    email: string
    firstName: string
    lastName: string
    phone: string
    role: UserRole
    avatar?: string
    isActive: boolean
    createdAt: string
    updatedAt: string
}

export interface Physiotherapist extends User {
    role: 'physiotherapist'
    licenseNumber: string
    specializations: string[]
    clinic?: string
    address: string
    city: string
    patients: string[] // patient IDs
    workingHours: {
        start: string
        end: string
        days: number[] // 0-6 for Sunday-Saturday
    }
}

export interface Patient extends User {
    role: 'patient'
    dateOfBirth: string
    gender: 'Male' | 'Female' | 'Other'
    address: string
    city: string
    emergencyContact: {
        name: string
        phone: string
        relationship: string
    }
    assignedPhysiotherapist?: string // physiotherapist ID
    currentCondition?: string
    medicalHistory: string[]
    status: 'Active' | 'Inactive' | 'New'
}

export interface SuperAdmin extends User {
    role: 'superadmin'
    permissions: string[]
}

// ============================================
// EXERCISE & VIDEO TYPES
// ============================================

export type BodyPart =
    | 'neck' | 'shoulder' | 'upper_back' | 'lower_back'
    | 'hip' | 'knee' | 'ankle' | 'wrist' | 'elbow' | 'full_body'

export type Condition =
    | 'pain_relief' | 'post_surgery' | 'sports_injury'
    | 'arthritis' | 'stroke_rehab' | 'general_mobility'

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced'

export interface ExerciseVideo {
    id: string
    title: string
    titleSwahili: string
    description: string
    descriptionSwahili: string
    videoUrl: string
    thumbnailUrl: string
    duration: number // in seconds
    bodyPart: BodyPart
    condition: Condition
    difficulty: DifficultyLevel
    instructions: string[]
    instructionsSwahili: string[]
    uploadedBy: string // physiotherapist ID
    isOfflineAvailable: boolean
    fileSize: number // in bytes
    createdAt: string
}

export interface Exercise {
    id: string
    videoId: string
    video?: ExerciseVideo
    sets: number
    reps: number
    holdTime?: number // in seconds
    restTime?: number // in seconds
    notes?: string
    notesSwahili?: string
}

// ============================================
// TREATMENT & PRESCRIPTION TYPES
// ============================================

export interface TreatmentPlan {
    id: string
    patientId: string
    physiotherapistId: string
    diagnosis: string
    diagnosisSwahili?: string
    startDate: string
    endDate?: string
    status: 'Active' | 'Completed' | 'On Hold' | 'Cancelled'
    goals: string[]
    exercises: Exercise[]
    notes: string
    createdAt: string
    updatedAt: string
}

export interface Session {
    id: string
    treatmentPlanId: string
    patientId: string
    physiotherapistId: string
    date: string
    duration: number // in minutes
    type: 'Initial Assessment' | 'Follow-up' | 'Treatment Session' | 'Discharge'
    observations: string
    painLevel?: number // 1-10
    progressNotes: string
    exercisesCompleted: string[] // exercise IDs
    nextSessionRecommendation?: string
    createdAt: string
}

// ============================================
// PROGRESS & FEEDBACK TYPES
// ============================================

export interface DailyProgress {
    id: string
    patientId: string
    treatmentPlanId: string
    date: string
    exercisesCompleted: {
        exerciseId: string
        completed: boolean
        setsCompleted: number
        repsCompleted: number
        painLevel: number // 1-10
        difficultyLevel: number // 1-5
        notes?: string
    }[]
    overallPainLevel: number // 1-10
    overallMood: 'great' | 'good' | 'okay' | 'struggling'
    notes?: string
    syncedAt?: string // for offline sync tracking
}

export interface PatientFeedback {
    id: string
    patientId: string
    exerciseId: string
    rating: number // 1-5
    painLevel: number // 1-10
    difficultyLevel: number // 1-5
    comment?: string
    createdAt: string
}

// ============================================
// APPOINTMENT TYPES
// ============================================

export interface Appointment {
    id: string
    patientId: string
    patientName: string
    physiotherapistId: string
    type: 'Initial Assessment' | 'Follow-up' | 'Treatment Session' | 'Consultation'
    date: string
    time: string
    duration: number // in minutes
    status: 'Scheduled' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled' | 'No Show'
    notes?: string
    reminders: {
        type: 'sms' | 'push' | 'email'
        sentAt?: string
    }[]
    createdAt: string
    updatedAt: string
}

// ============================================
// MESSAGING TYPES
// ============================================

export interface Message {
    id: string
    senderId: string
    receiverId: string
    content: string
    type: 'text' | 'reminder' | 'exercise_update'
    isRead: boolean
    createdAt: string
}

export interface Reminder {
    id: string
    patientId: string
    type: 'exercise' | 'appointment' | 'medication'
    title: string
    titleSwahili?: string
    message: string
    messageSwahili?: string
    scheduledFor: string
    sent: boolean
    sentAt?: string
}

// ============================================
// OFFLINE SYNC TYPES
// ============================================

export interface SyncStatus {
    lastSyncedAt: string
    pendingChanges: number
    isSyncing: boolean
    syncError?: string
}

export interface OfflineData<T> {
    data: T
    localId: string
    serverId?: string
    action: 'create' | 'update' | 'delete'
    timestamp: string
    synced: boolean
}

// ============================================
// DASHBOARD & ANALYTICS TYPES
// ============================================

export interface PhysiotherapistDashboard {
    totalPatients: number
    activePatients: number
    appointmentsToday: number
    appointmentsThisWeek: number
    exerciseComplianceRate: number // percentage
    averageRecoveryTime: number // days
    pendingReminders: number
    offlineDataPending: number
}

export interface PatientDashboard {
    currentTreatmentPlan?: TreatmentPlan
    todaysExercises: Exercise[]
    completedToday: number
    totalToday: number
    streakDays: number
    nextAppointment?: Appointment
    recentProgress: DailyProgress[]
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
    success: boolean
    data?: T
    error?: string
    message?: string
}

export interface PaginatedResponse<T> {
    data: T[]
    total: number
    page: number
    limit: number
    totalPages: number
}

// ============================================
// FORM TYPES
// ============================================

export interface LoginFormData {
    email: string
    password: string
    role: UserRole
}

export interface PatientFormData {
    firstName: string
    lastName: string
    email: string
    phone: string
    dateOfBirth: string
    gender: 'Male' | 'Female' | 'Other'
    address: string
    city: string
    currentCondition: string
    emergencyContactName: string
    emergencyContactPhone: string
    emergencyContactRelationship: string
}

export interface TreatmentFormData {
    patientId: string
    diagnosis: string
    diagnosisSwahili?: string
    startDate: string
    goals: string[]
    exercises: Exercise[]
    notes: string
}

// ============================================
// SETTINGS TYPES
// ============================================

export interface AppSettings {
    theme: 'light' | 'dark' | 'system'
    language: 'en' | 'sw' // English or Swahili
    timezone: string
    notifications: {
        email: boolean
        sms: boolean
        push: boolean
        appointmentReminders: boolean
        exerciseReminders: boolean
    }
    offlineMode: {
        autoSync: boolean
        wifiOnly: boolean
        maxStorageMB: number
    }
}
