import { useState } from 'react'
import {
    Plus,
    ChevronLeft,
    ChevronRight,
    Clock,
    User,
    Calendar as CalendarIcon
} from 'lucide-react'

interface Appointment {
    id: number
    patient: string
    type: string
    date: string
    time: string
    duration: string
    status: 'Confirmed' | 'Pending' | 'Cancelled' | 'Completed'
    notes?: string
}

function Appointments() {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState<number | null>(6)

    const appointments: Appointment[] = [
        { id: 1, patient: 'John Mwamba', type: 'Treatment Session', date: '2024-02-06', time: '09:00 AM', duration: '45 min', status: 'Completed' },
        { id: 2, patient: 'Fatima Hassan', type: 'Follow-up', date: '2024-02-06', time: '10:00 AM', duration: '30 min', status: 'Confirmed' },
        { id: 3, patient: 'Peter Kimaro', type: 'Initial Assessment', date: '2024-02-06', time: '11:30 AM', duration: '60 min', status: 'Confirmed' },
        { id: 4, patient: 'Grace Makundi', type: 'Treatment Session', date: '2024-02-06', time: '02:00 PM', duration: '45 min', status: 'Pending' },
        { id: 5, patient: 'David Lyimo', type: 'Follow-up', date: '2024-02-06', time: '03:30 PM', duration: '30 min', status: 'Confirmed' },
        { id: 6, patient: 'Sarah Mushi', type: 'Treatment Session', date: '2024-02-06', time: '04:30 PM', duration: '45 min', status: 'Cancelled' },
    ]

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
    }

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    }

    const renderCalendarDays = () => {
        const daysInMonth = getDaysInMonth(currentDate)
        const firstDay = getFirstDayOfMonth(currentDate)
        const days = []

        // Empty cells for days before the first day of month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>)
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const hasAppointments = [2, 6, 8, 12, 15, 18, 22, 25, 28].includes(day)
            days.push(
                <div
                    key={day}
                    className={`calendar-day ${selectedDate === day ? 'selected' : ''} ${hasAppointments ? 'has-appointments' : ''}`}
                    onClick={() => setSelectedDate(day)}
                >
                    {day}
                    {hasAppointments && <span className="dot"></span>}
                </div>
            )
        }

        return days
    }

    const navigateMonth = (direction: 'prev' | 'next') => {
        setCurrentDate(prev => {
            const newDate = new Date(prev)
            if (direction === 'prev') {
                newDate.setMonth(newDate.getMonth() - 1)
            } else {
                newDate.setMonth(newDate.getMonth() + 1)
            }
            return newDate
        })
    }

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1>Appointments</h1>
                        <p>Schedule and manage patient appointments</p>
                    </div>
                    <button className="btn btn-primary">
                        <Plus size={18} />
                        New Appointment
                    </button>
                </div>
            </div>

            <div className="grid-2">
                {/* Calendar */}
                <div className="card">
                    <div className="card-header">
                        <button className="btn btn-ghost" onClick={() => navigateMonth('prev')}>
                            <ChevronLeft size={20} />
                        </button>
                        <h3 className="card-title">{months[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
                        <button className="btn btn-ghost" onClick={() => navigateMonth('next')}>
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    <div className="calendar-grid">
                        {daysOfWeek.map(day => (
                            <div key={day} className="calendar-header">{day}</div>
                        ))}
                        {renderCalendarDays()}
                    </div>

                    <style>{`
            .calendar-grid {
              display: grid;
              grid-template-columns: repeat(7, 1fr);
              gap: 4px;
            }
            .calendar-header {
              text-align: center;
              font-size: 0.75rem;
              font-weight: 600;
              color: var(--text-muted);
              padding: var(--spacing-sm);
            }
            .calendar-day {
              aspect-ratio: 1;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: var(--radius-md);
              cursor: pointer;
              transition: all var(--transition-fast);
              font-size: 0.875rem;
              position: relative;
            }
            .calendar-day:hover:not(.empty) {
              background: rgba(99, 102, 241, 0.2);
            }
            .calendar-day.selected {
              background: var(--primary);
              color: white;
              font-weight: 600;
            }
            .calendar-day.empty {
              cursor: default;
            }
            .calendar-day .dot {
              position: absolute;
              bottom: 4px;
              width: 4px;
              height: 4px;
              background: var(--secondary);
              border-radius: 50%;
            }
            .calendar-day.selected .dot {
              background: white;
            }
          `}</style>
                </div>

                {/* Appointments List */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">
                            <CalendarIcon size={18} style={{ marginRight: '8px' }} />
                            {selectedDate ? `February ${selectedDate}, 2024` : 'Select a date'}
                        </h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                        {appointments.map((apt) => (
                            <div
                                key={apt.id}
                                className="list-item"
                                style={{
                                    padding: 'var(--spacing-md)',
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRadius: 'var(--radius-md)',
                                    borderLeft: `3px solid ${apt.status === 'Confirmed' ? 'var(--success)' :
                                            apt.status === 'Pending' ? 'var(--warning)' :
                                                apt.status === 'Cancelled' ? 'var(--error)' : 'var(--primary)'
                                        }`
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--spacing-sm)',
                                    color: 'var(--text-muted)',
                                    minWidth: '80px'
                                }}>
                                    <Clock size={14} />
                                    <span style={{ fontSize: '0.875rem' }}>{apt.time}</span>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                        <User size={14} style={{ color: 'var(--text-muted)' }} />
                                        <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{apt.patient}</span>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                        {apt.type} • {apt.duration}
                                    </div>
                                </div>
                                <span className={`badge ${apt.status === 'Confirmed' ? 'success' :
                                        apt.status === 'Pending' ? 'warning' :
                                            apt.status === 'Cancelled' ? 'error' : 'primary'
                                    }`}>
                                    {apt.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Appointments
