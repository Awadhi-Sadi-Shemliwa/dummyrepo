import { useState } from 'react'
import {
    Play,
    Search,
    Filter,
    Download,
    Plus,
    Clock,
    Star,
    ChevronDown,
    X
} from 'lucide-react'
import type { ExerciseVideo, BodyPart, Condition, DifficultyLevel } from '../types'
import { useAuth } from '../context/AuthContext'

// Demo exercise videos
const demoVideos: ExerciseVideo[] = [
    {
        id: 'ex-001',
        title: 'Lower Back Stretch',
        titleSwahili: 'Kunyoosha Mgongo wa Chini',
        description: 'Gentle stretching exercise for lower back pain relief',
        descriptionSwahili: 'Mazoezi ya kunyoosha kwa upole kwa kupunguza maumivu ya mgongo wa chini',
        videoUrl: '/videos/lower-back-stretch.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
        duration: 180,
        bodyPart: 'lower_back',
        condition: 'pain_relief',
        difficulty: 'beginner',
        instructions: ['Lie on your back', 'Bring knees to chest', 'Hold for 30 seconds', 'Repeat 3 times'],
        instructionsSwahili: ['Lala chali', 'Leta magoti kifuani', 'Shika sekunde 30', 'Rudia mara 3'],
        uploadedBy: 'physio-001',
        isOfflineAvailable: true,
        fileSize: 15000000,
        createdAt: '2024-01-15T00:00:00Z'
    },
    {
        id: 'ex-002',
        title: 'Knee Strengthening',
        titleSwahili: 'Kuimarisha Goti',
        description: 'Build strength in the muscles around your knee',
        descriptionSwahili: 'Jenga nguvu katika misuli karibu na goti lako',
        videoUrl: '/videos/knee-strength.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
        duration: 420,
        bodyPart: 'knee',
        condition: 'post_surgery',
        difficulty: 'intermediate',
        instructions: ['Sit on chair', 'Extend leg slowly', 'Hold for 5 seconds', 'Lower slowly', 'Repeat 10 times'],
        instructionsSwahili: ['Kaa kwenye kiti', 'Nyoosha mguu polepole', 'Shika sekunde 5', 'Shusha polepole', 'Rudia mara 10'],
        uploadedBy: 'physio-001',
        isOfflineAvailable: false,
        fileSize: 25000000,
        createdAt: '2024-01-20T00:00:00Z'
    },
    {
        id: 'ex-003',
        title: 'Shoulder Mobility',
        titleSwahili: 'Uhamaji wa Bega',
        description: 'Improve range of motion in your shoulder',
        descriptionSwahili: 'Boresha upeo wa mwendo katika bega lako',
        videoUrl: '/videos/shoulder-mobility.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400',
        duration: 300,
        bodyPart: 'shoulder',
        condition: 'general_mobility',
        difficulty: 'beginner',
        instructions: ['Stand straight', 'Raise arm to side', 'Make circles', 'Reverse direction', '20 circles each way'],
        instructionsSwahili: ['Simama wima', 'Inua mkono upande', 'Fanya duara', 'Geuza mwelekeo', 'Duara 20 kila upande'],
        uploadedBy: 'physio-001',
        isOfflineAvailable: true,
        fileSize: 18000000,
        createdAt: '2024-02-01T00:00:00Z'
    },
    {
        id: 'ex-004',
        title: 'Neck Pain Relief',
        titleSwahili: 'Kupunguza Maumivu ya Shingo',
        description: 'Exercises to reduce neck tension and pain',
        descriptionSwahili: 'Mazoezi ya kupunguza mvutano na maumivu ya shingo',
        videoUrl: '/videos/neck-relief.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=400',
        duration: 240,
        bodyPart: 'neck',
        condition: 'pain_relief',
        difficulty: 'beginner',
        instructions: ['Sit comfortably', 'Tilt head left', 'Hold 15 seconds', 'Tilt head right', 'Repeat 5 times'],
        instructionsSwahili: ['Kaa kwa raha', 'Inamisha kichwa kushoto', 'Shika sekunde 15', 'Inamisha kichwa kulia', 'Rudia mara 5'],
        uploadedBy: 'physio-001',
        isOfflineAvailable: true,
        fileSize: 12000000,
        createdAt: '2024-02-03T00:00:00Z'
    },
    {
        id: 'ex-005',
        title: 'Hip Flexor Stretch',
        titleSwahili: 'Kunyoosha Nyonga',
        description: 'Release tight hip flexors with this stretch',
        descriptionSwahili: 'Fungua wakunja wa nyonga kwa kunyoosha huku',
        videoUrl: '/videos/hip-flexor.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=400',
        duration: 360,
        bodyPart: 'hip',
        condition: 'general_mobility',
        difficulty: 'intermediate',
        instructions: ['Kneel on one knee', 'Push hips forward', 'Keep back straight', 'Hold 30 seconds', 'Switch legs'],
        instructionsSwahili: ['Piga magoti moja', 'Sukuma nyonga mbele', 'Weka mgongo wima', 'Shika sekunde 30', 'Badilisha miguu'],
        uploadedBy: 'physio-001',
        isOfflineAvailable: false,
        fileSize: 20000000,
        createdAt: '2024-02-05T00:00:00Z'
    },
    {
        id: 'ex-006',
        title: 'Ankle Rehabilitation',
        titleSwahili: 'Ukarabati wa Kifundo cha Mguu',
        description: 'Strengthen ankle after injury',
        descriptionSwahili: 'Imarisha kifundo cha mguu baada ya jeraha',
        videoUrl: '/videos/ankle-rehab.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1571019613576-2b22c76fd955?w=400',
        duration: 280,
        bodyPart: 'ankle',
        condition: 'sports_injury',
        difficulty: 'beginner',
        instructions: ['Sit with leg extended', 'Point toes forward', 'Flex toes back', 'Rotate ankle', '15 reps each direction'],
        instructionsSwahili: ['Kaa na mguu umenyooshwa', 'Elekeza vidole mbele', 'Kunjo vidole nyuma', 'Zungusha kifundo', 'Rudia 15 kila upande'],
        uploadedBy: 'physio-001',
        isOfflineAvailable: true,
        fileSize: 16000000,
        createdAt: '2024-02-06T00:00:00Z'
    }
]

const bodyPartOptions: { value: BodyPart | 'all'; label: string; labelSw: string }[] = [
    { value: 'all', label: 'All Body Parts', labelSw: 'Sehemu Zote' },
    { value: 'neck', label: 'Neck', labelSw: 'Shingo' },
    { value: 'shoulder', label: 'Shoulder', labelSw: 'Bega' },
    { value: 'upper_back', label: 'Upper Back', labelSw: 'Mgongo wa Juu' },
    { value: 'lower_back', label: 'Lower Back', labelSw: 'Mgongo wa Chini' },
    { value: 'hip', label: 'Hip', labelSw: 'Nyonga' },
    { value: 'knee', label: 'Knee', labelSw: 'Goti' },
    { value: 'ankle', label: 'Ankle', labelSw: 'Kifundo cha Mguu' },
]

const conditionOptions: { value: Condition | 'all'; label: string; labelSw: string }[] = [
    { value: 'all', label: 'All Conditions', labelSw: 'Hali Zote' },
    { value: 'pain_relief', label: 'Pain Relief', labelSw: 'Kupunguza Maumivu' },
    { value: 'post_surgery', label: 'Post Surgery', labelSw: 'Baada ya Upasuaji' },
    { value: 'sports_injury', label: 'Sports Injury', labelSw: 'Jeraha la Michezo' },
    { value: 'general_mobility', label: 'General Mobility', labelSw: 'Uhamaji wa Kawaida' },
]

const difficultyOptions: { value: DifficultyLevel | 'all'; label: string; labelSw: string }[] = [
    { value: 'all', label: 'All Levels', labelSw: 'Viwango Vyote' },
    { value: 'beginner', label: 'Beginner', labelSw: 'Mwanzo' },
    { value: 'intermediate', label: 'Intermediate', labelSw: 'Kati' },
    { value: 'advanced', label: 'Advanced', labelSw: 'Hali ya Juu' },
]

function Exercises() {
    const { isPhysiotherapist } = useAuth()
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedBodyPart, setSelectedBodyPart] = useState<BodyPart | 'all'>('all')
    const [selectedCondition, setSelectedCondition] = useState<Condition | 'all'>('all')
    const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | 'all'>('all')
    const [selectedVideo, setSelectedVideo] = useState<ExerciseVideo | null>(null)
    const [language, setLanguage] = useState<'en' | 'sw'>('en')

    const filteredVideos = demoVideos.filter(video => {
        const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            video.titleSwahili.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesBodyPart = selectedBodyPart === 'all' || video.bodyPart === selectedBodyPart
        const matchesCondition = selectedCondition === 'all' || video.condition === selectedCondition
        const matchesDifficulty = selectedDifficulty === 'all' || video.difficulty === selectedDifficulty
        return matchesSearch && matchesBodyPart && matchesCondition && matchesDifficulty
    })

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const formatFileSize = (bytes: number) => {
        return (bytes / 1000000).toFixed(1) + ' MB'
    }

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1>{language === 'en' ? 'Exercise Library' : 'Maktaba ya Mazoezi'}</h1>
                        <p>{language === 'en' ? 'Video-based exercise programs' : 'Programu za mazoezi za video'}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                        <button
                            className={`btn ${language === 'en' ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setLanguage('en')}
                        >
                            English
                        </button>
                        <button
                            className={`btn ${language === 'sw' ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setLanguage('sw')}
                        >
                            Kiswahili
                        </button>
                        {isPhysiotherapist() && (
                            <button className="btn btn-primary">
                                <Plus size={18} />
                                {language === 'en' ? 'Upload Video' : 'Pakia Video'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="card" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <div style={{ display: 'flex', gap: 'var(--spacing-lg)', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div className="search-input" style={{ flex: 1, minWidth: '200px' }}>
                        <Search />
                        <input
                            type="text"
                            className="input"
                            placeholder={language === 'en' ? 'Search exercises...' : 'Tafuta mazoezi...'}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="filter-group">
                        <Filter size={16} />
                        <select
                            className="input select-input"
                            value={selectedBodyPart}
                            onChange={(e) => setSelectedBodyPart(e.target.value as BodyPart | 'all')}
                        >
                            {bodyPartOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>
                                    {language === 'en' ? opt.label : opt.labelSw}
                                </option>
                            ))}
                        </select>
                    </div>

                    <select
                        className="input select-input"
                        value={selectedCondition}
                        onChange={(e) => setSelectedCondition(e.target.value as Condition | 'all')}
                    >
                        {conditionOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>
                                {language === 'en' ? opt.label : opt.labelSw}
                            </option>
                        ))}
                    </select>

                    <select
                        className="input select-input"
                        value={selectedDifficulty}
                        onChange={(e) => setSelectedDifficulty(e.target.value as DifficultyLevel | 'all')}
                    >
                        {difficultyOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>
                                {language === 'en' ? opt.label : opt.labelSw}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Video Grid */}
            <div className="video-grid">
                {filteredVideos.map((video) => (
                    <div
                        key={video.id}
                        className="video-card card"
                        onClick={() => setSelectedVideo(video)}
                    >
                        <div className="video-thumbnail">
                            <img src={video.thumbnailUrl} alt={video.title} />
                            <div className="video-overlay">
                                <Play size={40} />
                            </div>
                            <div className="video-duration">
                                <Clock size={12} />
                                {formatDuration(video.duration)}
                            </div>
                            {video.isOfflineAvailable && (
                                <div className="offline-badge">
                                    <Download size={12} />
                                </div>
                            )}
                        </div>
                        <div className="video-info">
                            <h4>{language === 'en' ? video.title : video.titleSwahili}</h4>
                            <p>{language === 'en' ? video.description : video.descriptionSwahili}</p>
                            <div className="video-meta">
                                <span className={`badge ${video.difficulty === 'beginner' ? 'success' :
                                        video.difficulty === 'intermediate' ? 'warning' : 'error'
                                    }`}>
                                    {difficultyOptions.find(d => d.value === video.difficulty)?.[language === 'en' ? 'label' : 'labelSw']}
                                </span>
                                <span className="badge info">
                                    {bodyPartOptions.find(b => b.value === video.bodyPart)?.[language === 'en' ? 'label' : 'labelSw']}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Video Modal */}
            {selectedVideo && (
                <div className="video-modal-overlay" onClick={() => setSelectedVideo(null)}>
                    <div className="video-modal card" onClick={(e) => e.stopPropagation()}>
                        <div className="video-modal-header">
                            <h3>{language === 'en' ? selectedVideo.title : selectedVideo.titleSwahili}</h3>
                            <button className="btn btn-ghost" onClick={() => setSelectedVideo(null)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="video-player">
                            <img
                                src={selectedVideo.thumbnailUrl}
                                alt={selectedVideo.title}
                                style={{ width: '100%', borderRadius: 'var(--radius-lg)' }}
                            />
                            <div className="video-play-overlay">
                                <Play size={60} />
                                <p>{language === 'en' ? 'Video playback coming soon' : 'Uchezaji wa video unakuja hivi karibuni'}</p>
                            </div>
                        </div>

                        <div className="video-modal-content">
                            <p className="video-description">
                                {language === 'en' ? selectedVideo.description : selectedVideo.descriptionSwahili}
                            </p>

                            <div className="video-details">
                                <div className="detail-item">
                                    <Clock size={16} />
                                    <span>{formatDuration(selectedVideo.duration)}</span>
                                </div>
                                <div className="detail-item">
                                    <Download size={16} />
                                    <span>{formatFileSize(selectedVideo.fileSize)}</span>
                                </div>
                            </div>

                            <h4>{language === 'en' ? 'Instructions' : 'Maelekezo'}</h4>
                            <ol className="instructions-list">
                                {(language === 'en' ? selectedVideo.instructions : selectedVideo.instructionsSwahili).map((step, index) => (
                                    <li key={index}>{step}</li>
                                ))}
                            </ol>

                            <div className="video-modal-actions">
                                {selectedVideo.isOfflineAvailable ? (
                                    <button className="btn btn-secondary">
                                        <Download size={18} />
                                        {language === 'en' ? 'Downloaded for Offline' : 'Imepakuliwa kwa Nje ya Mtandao'}
                                    </button>
                                ) : (
                                    <button className="btn btn-primary">
                                        <Download size={18} />
                                        {language === 'en' ? 'Download for Offline' : 'Pakua kwa Nje ya Mtandao'}
                                    </button>
                                )}
                                {isPhysiotherapist() && (
                                    <button className="btn btn-primary">
                                        <Plus size={18} />
                                        {language === 'en' ? 'Prescribe to Patient' : 'Agiza kwa Mgonjwa'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
        .video-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: var(--spacing-lg);
        }

        .video-card {
          cursor: pointer;
          padding: 0;
          overflow: hidden;
        }

        .video-card:hover {
          transform: translateY(-4px);
        }

        .video-thumbnail {
          position: relative;
          aspect-ratio: 16/9;
          overflow: hidden;
        }

        .video-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform var(--transition-normal);
        }

        .video-card:hover .video-thumbnail img {
          transform: scale(1.05);
        }

        .video-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity var(--transition-normal);
          color: white;
        }

        .video-card:hover .video-overlay {
          opacity: 1;
        }

        .video-duration {
          position: absolute;
          bottom: var(--spacing-sm);
          right: var(--spacing-sm);
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 4px 8px;
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .offline-badge {
          position: absolute;
          top: var(--spacing-sm);
          right: var(--spacing-sm);
          background: var(--secondary);
          color: white;
          padding: 6px;
          border-radius: var(--radius-sm);
        }

        .video-info {
          padding: var(--spacing-lg);
        }

        .video-info h4 {
          margin-bottom: var(--spacing-xs);
          font-size: 1rem;
        }

        .video-info p {
          font-size: 0.875rem;
          color: var(--text-muted);
          margin-bottom: var(--spacing-md);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .video-meta {
          display: flex;
          gap: var(--spacing-sm);
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          color: var(--text-muted);
        }

        .select-input {
          padding: var(--spacing-sm) var(--spacing-md);
          min-width: 150px;
          background: var(--bg-secondary);
          cursor: pointer;
        }

        .video-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: var(--spacing-xl);
        }

        .video-modal {
          max-width: 800px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .video-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-lg);
          border-bottom: 1px solid var(--glass-border);
        }

        .video-player {
          position: relative;
          aspect-ratio: 16/9;
          background: var(--bg-secondary);
        }

        .video-play-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.5);
          color: white;
        }

        .video-modal-content {
          padding: var(--spacing-xl);
        }

        .video-description {
          margin-bottom: var(--spacing-lg);
        }

        .video-details {
          display: flex;
          gap: var(--spacing-xl);
          margin-bottom: var(--spacing-xl);
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          color: var(--text-secondary);
        }

        .instructions-list {
          margin: var(--spacing-md) 0 var(--spacing-xl);
          padding-left: var(--spacing-xl);
        }

        .instructions-list li {
          margin-bottom: var(--spacing-sm);
          color: var(--text-secondary);
        }

        .video-modal-actions {
          display: flex;
          gap: var(--spacing-md);
          flex-wrap: wrap;
        }

        @media (max-width: 768px) {
          .video-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </div>
    )
}

export default Exercises
