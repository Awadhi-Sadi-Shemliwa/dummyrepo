import { useState } from 'react'
import {
    Search,
    Plus,
    Filter,
    MoreVertical,
    Phone,
    Mail,
    MapPin
} from 'lucide-react'

interface Patient {
    id: number
    name: string
    age: number
    gender: string
    phone: string
    email: string
    location: string
    condition: string
    lastVisit: string
    status: 'Active' | 'Inactive' | 'New'
    sessions: number
}

function Patients() {
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState<string>('all')

    const patients: Patient[] = [
        { id: 1, name: 'John Mwamba', age: 45, gender: 'Male', phone: '+255 712 345 678', email: 'john@email.com', location: 'Dar es Salaam', condition: 'Lower Back Pain', lastVisit: '2024-02-06', status: 'Active', sessions: 12 },
        { id: 2, name: 'Fatima Hassan', age: 32, gender: 'Female', phone: '+255 756 789 012', email: 'fatima@email.com', location: 'Arusha', condition: 'Knee Rehabilitation', lastVisit: '2024-02-05', status: 'Active', sessions: 8 },
        { id: 3, name: 'Peter Kimaro', age: 28, gender: 'Male', phone: '+255 789 012 345', email: 'peter@email.com', location: 'Mwanza', condition: 'Sports Injury', lastVisit: '2024-02-04', status: 'New', sessions: 2 },
        { id: 4, name: 'Grace Makundi', age: 55, gender: 'Female', phone: '+255 712 987 654', email: 'grace@email.com', location: 'Dodoma', condition: 'Post-Surgery Recovery', lastVisit: '2024-01-28', status: 'Inactive', sessions: 24 },
        { id: 5, name: 'David Lyimo', age: 38, gender: 'Male', phone: '+255 745 321 098', email: 'david@email.com', location: 'Dar es Salaam', condition: 'Shoulder Pain', lastVisit: '2024-02-06', status: 'Active', sessions: 6 },
        { id: 6, name: 'Sarah Mushi', age: 42, gender: 'Female', phone: '+255 768 432 109', email: 'sarah@email.com', location: 'Kilimanjaro', condition: 'Chronic Pain Management', lastVisit: '2024-02-03', status: 'Active', sessions: 15 },
    ]

    const filteredPatients = patients.filter(patient => {
        const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.condition.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesFilter = filterStatus === 'all' || patient.status.toLowerCase() === filterStatus
        return matchesSearch && matchesFilter
    })

    const statusCounts = {
        all: patients.length,
        active: patients.filter(p => p.status === 'Active').length,
        inactive: patients.filter(p => p.status === 'Inactive').length,
        new: patients.filter(p => p.status === 'New').length,
    }

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1>Patients</h1>
                        <p>Manage and view all patient records</p>
                    </div>
                    <button className="btn btn-primary">
                        <Plus size={18} />
                        Add Patient
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="card" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <div style={{ display: 'flex', gap: 'var(--spacing-lg)', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div className="search-input" style={{ flex: 1, minWidth: '250px' }}>
                        <Search />
                        <input
                            type="text"
                            className="input"
                            placeholder="Search patients by name or condition..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                        {(['all', 'active', 'inactive', 'new'] as const).map((status) => (
                            <button
                                key={status}
                                className={`btn ${filterStatus === status ? 'btn-primary' : 'btn-ghost'}`}
                                onClick={() => setFilterStatus(status)}
                                style={{ textTransform: 'capitalize' }}
                            >
                                {status} ({statusCounts[status]})
                            </button>
                        ))}
                    </div>
                    <button className="btn btn-ghost">
                        <Filter size={18} />
                        More Filters
                    </button>
                </div>
            </div>

            {/* Patients Table */}
            <div className="card">
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Patient</th>
                                <th>Contact</th>
                                <th>Condition</th>
                                <th>Sessions</th>
                                <th>Last Visit</th>
                                <th>Status</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPatients.map((patient) => (
                                <tr key={patient.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                                            <div className="avatar">{patient.name.split(' ').map(n => n[0]).join('')}</div>
                                            <div>
                                                <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{patient.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                    {patient.age} years • {patient.gender}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.875rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', color: 'var(--text-secondary)' }}>
                                                <Phone size={14} /> {patient.phone}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                <MapPin size={14} /> {patient.location}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{ color: 'var(--text-secondary)' }}>{patient.condition}</span>
                                    </td>
                                    <td>
                                        <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{patient.sessions}</span>
                                    </td>
                                    <td>
                                        <span style={{ color: 'var(--text-muted)' }}>{patient.lastVisit}</span>
                                    </td>
                                    <td>
                                        <span className={`badge ${patient.status === 'Active' ? 'success' :
                                                patient.status === 'New' ? 'info' : 'warning'
                                            }`}>
                                            {patient.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="btn btn-ghost">
                                            <MoreVertical size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default Patients
