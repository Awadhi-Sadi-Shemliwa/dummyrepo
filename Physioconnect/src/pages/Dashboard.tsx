import {
    Users,
    Calendar,
    Activity,
    TrendingUp,
    Clock,
    ArrowUpRight,
    ArrowDownRight,
    CheckCircle,
    AlertCircle,
    Dumbbell
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function Dashboard() {
    const { user, isPhysiotherapist, isPatient } = useAuth()

    // Physiotherapist stats
    const physioStats = [
        {
            label: 'Active Patients',
            labelSw: 'Wagonjwa Hai',
            value: '47',
            change: '+5',
            positive: true,
            icon: Users,
            iconClass: 'primary'
        },
        {
            label: 'Appointments Today',
            labelSw: 'Miadi Leo',
            value: '8',
            change: '+2',
            positive: true,
            icon: Calendar,
            iconClass: 'secondary'
        },
        {
            label: 'Exercise Compliance',
            labelSw: 'Ufuatiliaji wa Mazoezi',
            value: '78%',
            change: '+4.2%',
            positive: true,
            icon: Activity,
            iconClass: 'accent'
        },
        {
            label: 'Avg Recovery Time',
            labelSw: 'Muda wa Kupona',
            value: '21 days',
            change: '-3 days',
            positive: true,
            icon: TrendingUp,
            iconClass: 'info'
        },
    ]

    // Patient stats
    const patientStats = [
        {
            label: 'Exercises Today',
            labelSw: 'Mazoezi Leo',
            value: '4',
            total: '6',
            icon: Dumbbell,
            iconClass: 'primary'
        },
        {
            label: 'Day Streak',
            labelSw: 'Siku Mfululizo',
            value: '14',
            icon: Activity,
            iconClass: 'secondary'
        },
        {
            label: 'Treatment Progress',
            labelSw: 'Maendeleo ya Matibabu',
            value: '65%',
            icon: TrendingUp,
            iconClass: 'accent'
        },
        {
            label: 'Next Appointment',
            labelSw: 'Miadi Ijayo',
            value: 'Tomorrow',
            valueSw: 'Kesho',
            subValue: '10:00 AM',
            icon: Calendar,
            iconClass: 'info'
        },
    ]

    const recentPatients = [
        { id: 1, name: 'John Mwamba', condition: 'Lower Back Pain', compliance: 85, time: '10:30 AM', status: 'In Progress' },
        { id: 2, name: 'Fatima Hassan', condition: 'Knee Rehabilitation', compliance: 92, time: '11:00 AM', status: 'Waiting' },
        { id: 3, name: 'Peter Kimaro', condition: 'Sports Injury', compliance: 76, time: '11:30 AM', status: 'Scheduled' },
        { id: 4, name: 'Grace Makundi', condition: 'Post-Surgery', compliance: 88, time: '12:00 PM', status: 'Scheduled' },
    ]

    const patientExercises = [
        { id: 1, name: 'Lower Back Stretch', nameSw: 'Kunyoosha Mgongo', sets: 3, reps: 10, completed: true },
        { id: 2, name: 'Knee Strengthening', nameSw: 'Kuimarisha Goti', sets: 3, reps: 15, completed: true },
        { id: 3, name: 'Hip Flexor Stretch', nameSw: 'Kunyoosha Nyonga', sets: 2, reps: 12, completed: false },
        { id: 4, name: 'Core Stability', nameSw: 'Utulivu wa Mwili', sets: 3, reps: 10, completed: false },
    ]

    const upcomingAppointments = [
        { id: 1, patient: 'Sarah Mushi', type: 'Follow-up', time: '2:00 PM', duration: '45 min' },
        { id: 2, patient: 'David Lyimo', type: 'Initial Assessment', time: '3:00 PM', duration: '60 min' },
        { id: 3, patient: 'Anna Shirima', type: 'Treatment Session', time: '4:00 PM', duration: '30 min' },
    ]

    // Render physiotherapist dashboard
    if (isPhysiotherapist()) {
        return (
            <div className="animate-fade-in">
                <div className="page-header">
                    <h1>Karibu, {user?.firstName}!</h1>
                    <p>Here's what's happening with your practice today.</p>
                </div>

                {/* Stats Grid */}
                <div className="stats-grid">
                    {physioStats.map((stat, index) => (
                        <div
                            key={stat.label}
                            className="card stat-card"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className={`card-icon ${stat.iconClass}`}>
                                <stat.icon size={24} />
                            </div>
                            <div>
                                <div className="stat-value">{stat.value}</div>
                                <div className="stat-label">{stat.label}</div>
                                <span className={`stat-change ${stat.positive ? 'positive' : 'negative'}`}>
                                    {stat.positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                    {stat.change}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid-2" style={{ marginBottom: 'var(--spacing-xl)' }}>
                    {/* Recent Patients with Compliance */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Patient Progress</h3>
                            <button className="btn btn-ghost">View All</button>
                        </div>
                        <div>
                            {recentPatients.map((patient) => (
                                <div key={patient.id} className="list-item">
                                    <div className="avatar">{patient.name.split(' ').map(n => n[0]).join('')}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{patient.name}</div>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{patient.condition}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div className="compliance-bar">
                                            <div
                                                className="compliance-fill"
                                                style={{
                                                    width: `${patient.compliance}%`,
                                                    background: patient.compliance >= 80 ? 'var(--success)' :
                                                        patient.compliance >= 60 ? 'var(--warning)' : 'var(--error)'
                                                }}
                                            ></div>
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            {patient.compliance}% compliance
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Upcoming Appointments */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Today's Schedule</h3>
                            <button className="btn btn-ghost">View All</button>
                        </div>
                        <div>
                            {upcomingAppointments.map((apt) => (
                                <div key={apt.id} className="list-item">
                                    <div className="card-icon secondary" style={{ width: '40px', height: '40px' }}>
                                        <Clock size={18} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{apt.patient}</div>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{apt.type}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{apt.time}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{apt.duration}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Quick Actions</h3>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
                        <button className="btn btn-primary">
                            <Users size={18} />
                            Add Patient
                        </button>
                        <button className="btn btn-secondary">
                            <Calendar size={18} />
                            Schedule Appointment
                        </button>
                        <button className="btn btn-secondary">
                            <Dumbbell size={18} />
                            Prescribe Exercises
                        </button>
                    </div>
                </div>

                <style>{`
          .compliance-bar {
            width: 80px;
            height: 6px;
            background: var(--bg-tertiary);
            border-radius: 3px;
            overflow: hidden;
            margin-bottom: 4px;
          }
          .compliance-fill {
            height: 100%;
            border-radius: 3px;
            transition: width var(--transition-normal);
          }
        `}</style>
            </div>
        )
    }

    // Render patient dashboard
    if (isPatient()) {
        const completedCount = patientExercises.filter(e => e.completed).length
        const totalExercises = patientExercises.length

        return (
            <div className="animate-fade-in">
                <div className="page-header">
                    <h1>Habari, {user?.firstName}!</h1>
                    <p>Keep up the great work on your recovery journey.</p>
                </div>

                {/* Patient Stats */}
                <div className="stats-grid">
                    {patientStats.map((stat, index) => (
                        <div
                            key={stat.label}
                            className="card stat-card"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className={`card-icon ${stat.iconClass}`}>
                                <stat.icon size={24} />
                            </div>
                            <div>
                                <div className="stat-value">
                                    {stat.value}
                                    {stat.total && <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/{stat.total}</span>}
                                </div>
                                <div className="stat-label">{stat.label}</div>
                                {stat.subValue && (
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stat.subValue}</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Today's Exercises */}
                <div className="card" style={{ marginBottom: 'var(--spacing-xl)' }}>
                    <div className="card-header">
                        <h3 className="card-title">Today's Exercises / Mazoezi ya Leo</h3>
                        <span className="badge primary">{completedCount}/{totalExercises} Complete</span>
                    </div>
                    <div className="exercise-list">
                        {patientExercises.map((exercise) => (
                            <div
                                key={exercise.id}
                                className={`exercise-item ${exercise.completed ? 'completed' : ''}`}
                            >
                                <div className="exercise-check">
                                    {exercise.completed ? (
                                        <CheckCircle size={24} color="var(--success)" />
                                    ) : (
                                        <div className="exercise-checkbox"></div>
                                    )}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 500, color: exercise.completed ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                                        {exercise.name}
                                    </div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                        {exercise.sets} sets × {exercise.reps} reps
                                    </div>
                                </div>
                                {!exercise.completed && (
                                    <button className="btn btn-primary">
                                        Start
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recovery Timeline */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Recovery Progress / Maendeleo ya Kupona</h3>
                    </div>
                    <div className="progress-timeline">
                        <div className="timeline-bar">
                            <div className="timeline-fill" style={{ width: '65%' }}></div>
                        </div>
                        <div className="timeline-markers">
                            <div className="marker completed">
                                <CheckCircle size={16} />
                                <span>Week 1</span>
                            </div>
                            <div className="marker completed">
                                <CheckCircle size={16} />
                                <span>Week 2</span>
                            </div>
                            <div className="marker current">
                                <div className="marker-dot"></div>
                                <span>Week 3</span>
                            </div>
                            <div className="marker">
                                <div className="marker-dot"></div>
                                <span>Week 4</span>
                            </div>
                            <div className="marker">
                                <div className="marker-dot"></div>
                                <span>Complete</span>
                            </div>
                        </div>
                    </div>
                </div>

                <style>{`
          .exercise-list {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-md);
          }
          .exercise-item {
            display: flex;
            align-items: center;
            gap: var(--spacing-md);
            padding: var(--spacing-md);
            background: rgba(255, 255, 255, 0.03);
            border-radius: var(--radius-lg);
            transition: all var(--transition-fast);
          }
          .exercise-item:hover:not(.completed) {
            background: rgba(99, 102, 241, 0.1);
          }
          .exercise-item.completed {
            opacity: 0.7;
          }
          .exercise-checkbox {
            width: 24px;
            height: 24px;
            border: 2px solid var(--text-muted);
            border-radius: 50%;
          }
          .progress-timeline {
            padding: var(--spacing-lg) 0;
          }
          .timeline-bar {
            height: 8px;
            background: var(--bg-tertiary);
            border-radius: 4px;
            margin-bottom: var(--spacing-lg);
            overflow: hidden;
          }
          .timeline-fill {
            height: 100%;
            background: linear-gradient(90deg, var(--primary), var(--secondary));
            border-radius: 4px;
          }
          .timeline-markers {
            display: flex;
            justify-content: space-between;
          }
          .marker {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--spacing-xs);
            color: var(--text-muted);
            font-size: 0.75rem;
          }
          .marker.completed {
            color: var(--success);
          }
          .marker.current {
            color: var(--primary-light);
          }
          .marker-dot {
            width: 16px;
            height: 16px;
            border: 2px solid currentColor;
            border-radius: 50%;
          }
          .marker.current .marker-dot {
            background: var(--primary);
            border-color: var(--primary);
          }
        `}</style>
            </div>
        )
    }

    // Default admin dashboard
    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h1>Admin Dashboard</h1>
                <p>Platform management and analytics</p>
            </div>

            <div className="stats-grid">
                {physioStats.map((stat, index) => (
                    <div
                        key={stat.label}
                        className="card stat-card"
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        <div className={`card-icon ${stat.iconClass}`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <div className="stat-value">{stat.value}</div>
                            <div className="stat-label">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Dashboard
