import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Activity,
    ArrowRight,
    Play,
    CheckCircle,
    Users,
    Smartphone,
    Wifi,
    WifiOff,
    Shield,
    Globe,
    Star,
    ChevronDown,
    Menu,
    X
} from 'lucide-react'
import ShaderAnimation from '../components/ui/ShaderAnimation'

function LandingPage() {
    const navigate = useNavigate()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const features = [
        {
            icon: Smartphone,
            title: 'Mobile & Web Platform',
            titleSw: 'Jukwaa la Simu na Wavuti',
            description: 'Access your treatment plans from any device, anywhere in Tanzania.',
            color: 'primary'
        },
        {
            icon: WifiOff,
            title: 'Offline-First Design',
            titleSw: 'Fanya Kazi Bila Mtandao',
            description: 'Continue your exercises even without internet. Data syncs automatically when connected.',
            color: 'secondary'
        },
        {
            icon: Play,
            title: 'Video Exercise Library',
            titleSw: 'Maktaba ya Video',
            description: 'Professional exercise videos in Swahili & English with step-by-step instructions.',
            color: 'accent'
        },
        {
            icon: Users,
            title: 'Patient-Therapist Connection',
            titleSw: 'Muunganisho wa Mgonjwa-Daktari',
            description: 'Direct communication between patients and physiotherapists for better care.',
            color: 'info'
        },
        {
            icon: Shield,
            title: 'Secure Health Records',
            titleSw: 'Rekodi Salama za Afya',
            description: 'Your medical data is encrypted and only accessible by your care team.',
            color: 'primary'
        },
        {
            icon: Activity,
            title: 'Progress Tracking',
            titleSw: 'Ufuatiliaji wa Maendeleo',
            description: 'Monitor recovery with daily progress reports and pain level tracking.',
            color: 'secondary'
        }
    ]

    const testimonials = [
        {
            name: 'Dr. Amina Mwakasege',
            role: 'Senior Physiotherapist, Muhimbili Hospital',
            image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
            quote: 'PhysioConnect has transformed how I manage my patients. The compliance rate increased by 40% since we started using this platform.',
            rating: 5
        },
        {
            name: 'Joseph Kimaro',
            role: 'Patient, Arusha',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            quote: 'I can finally do my exercises correctly with the video guidance. My knee recovery has been much faster than expected!',
            rating: 5
        },
        {
            name: 'Dr. Grace Mushi',
            role: 'Sports Rehabilitation Specialist',
            image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=150&h=150&fit=crop&crop=face',
            quote: 'The offline feature is a game-changer for patients in rural areas. Healthcare technology that actually works for Tanzania.',
            rating: 5
        }
    ]

    const stats = [
        { value: '5,000+', label: 'Patients Served' },
        { value: '150+', label: 'Physiotherapists' },
        { value: '89%', label: 'Recovery Rate' },
        { value: '4.9★', label: 'User Rating' },
    ]

    return (
        <div className="landing-page">
            {/* Navigation */}
            <nav className={`landing-nav ${scrolled ? 'scrolled' : ''}`}>
                <div className="nav-container">
                    <div className="nav-logo" onClick={() => navigate('/')}>
                        <div className="logo-icon">
                            <Activity size={24} />
                        </div>
                        <span>PhysioConnect</span>
                    </div>

                    <div className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
                        <a href="#features">Features</a>
                        <a href="#testimonials">Testimonials</a>
                        <a href="#about">About</a>
                        <button className="btn btn-ghost" onClick={() => navigate('/login')}>
                            Sign In
                        </button>
                        <button className="btn btn-primary" onClick={() => navigate('/login')}>
                            Get Started
                        </button>
                    </div>

                    <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero-section">
                <ShaderAnimation />
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <div className="hero-badge">
                        <Globe size={14} />
                        <span>Tanzania's Leading Digital Physiotherapy Platform</span>
                    </div>

                    <h1 className="hero-title">
                        <span className="text-gradient">Transform</span> Your Recovery Journey
                    </h1>

                    <p className="hero-subtitle">
                        Connect with expert physiotherapists, access video-guided exercises,
                        and track your progress — all from your phone, even offline.
                    </p>

                    <div className="hero-cta">
                        <button className="btn btn-primary btn-lg" onClick={() => navigate('/login')}>
                            Start Your Recovery
                            <ArrowRight size={20} />
                        </button>
                        <button className="btn btn-outline btn-lg">
                            <Play size={20} />
                            Watch Demo
                        </button>
                    </div>

                    <div className="hero-stats">
                        {stats.map((stat) => (
                            <div key={stat.label} className="stat-item">
                                <div className="stat-value">{stat.value}</div>
                                <div className="stat-label">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="scroll-indicator">
                    <ChevronDown size={24} />
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="features-section">
                <div className="section-container">
                    <div className="section-header">
                        <span className="section-badge">Features</span>
                        <h2>Everything You Need for Better Recovery</h2>
                        <p>Built specifically for Tanzania's healthcare needs with offline-first capabilities</p>
                    </div>

                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <div
                                key={feature.title}
                                className="feature-card"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className={`feature-icon ${feature.color}`}>
                                    <feature.icon size={28} />
                                </div>
                                <h3>{feature.title}</h3>
                                <p className="feature-title-sw">{feature.titleSw}</p>
                                <p>{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="how-section">
                <div className="section-container">
                    <div className="section-header">
                        <span className="section-badge">How It Works</span>
                        <h2>Simple Steps to Better Health</h2>
                    </div>

                    <div className="steps-grid">
                        <div className="step-card">
                            <div className="step-number">1</div>
                            <h3>Sign Up</h3>
                            <p>Create your account and connect with your physiotherapist</p>
                        </div>
                        <div className="step-connector"></div>
                        <div className="step-card">
                            <div className="step-number">2</div>
                            <h3>Get Your Plan</h3>
                            <p>Receive personalized exercise programs with video guidance</p>
                        </div>
                        <div className="step-connector"></div>
                        <div className="step-card">
                            <div className="step-number">3</div>
                            <h3>Exercise Daily</h3>
                            <p>Follow along with videos, log pain levels, track progress</p>
                        </div>
                        <div className="step-connector"></div>
                        <div className="step-card">
                            <div className="step-number">4</div>
                            <h3>Recover Faster</h3>
                            <p>Stay on track with reminders and celebrate your milestones</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className="testimonials-section">
                <div className="section-container">
                    <div className="section-header">
                        <span className="section-badge">Testimonials</span>
                        <h2>Trusted by Patients & Professionals</h2>
                    </div>

                    <div className="testimonials-grid">
                        {testimonials.map((testimonial) => (
                            <div key={testimonial.name} className="testimonial-card">
                                <div className="testimonial-rating">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} size={16} fill="var(--accent)" color="var(--accent)" />
                                    ))}
                                </div>
                                <p className="testimonial-quote">"{testimonial.quote}"</p>
                                <div className="testimonial-author">
                                    <img src={testimonial.image} alt={testimonial.name} />
                                    <div>
                                        <div className="author-name">{testimonial.name}</div>
                                        <div className="author-role">{testimonial.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="cta-container">
                    <h2>Ready to Start Your Recovery?</h2>
                    <p>Join thousands of Tanzanians who are taking control of their physical health</p>
                    <div className="cta-buttons">
                        <button className="btn btn-primary btn-lg" onClick={() => navigate('/login')}>
                            Get Started Free
                            <ArrowRight size={20} />
                        </button>
                        <button className="btn btn-outline btn-lg">
                            Contact Sales
                        </button>
                    </div>
                    <div className="cta-features">
                        <span><CheckCircle size={16} /> Free for patients</span>
                        <span><CheckCircle size={16} /> No credit card required</span>
                        <span><CheckCircle size={16} /> Works offline</span>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-container">
                    <div className="footer-brand">
                        <div className="nav-logo">
                            <div className="logo-icon">
                                <Activity size={24} />
                            </div>
                            <span>PhysioConnect</span>
                        </div>
                        <p>Tanzania's trusted digital physiotherapy platform</p>
                        <p className="footer-tagline">Jukwaa la Kisasa la Physiotherapy Tanzania</p>
                    </div>

                    <div className="footer-links">
                        <div className="footer-col">
                            <h4>Product</h4>
                            <a href="#features">Features</a>
                            <a href="#pricing">Pricing</a>
                            <a href="#demo">Demo</a>
                        </div>
                        <div className="footer-col">
                            <h4>Company</h4>
                            <a href="#about">About Us</a>
                            <a href="#careers">Careers</a>
                            <a href="#contact">Contact</a>
                        </div>
                        <div className="footer-col">
                            <h4>Resources</h4>
                            <a href="#help">Help Center</a>
                            <a href="#blog">Blog</a>
                            <a href="#api">API Docs</a>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>© 2024 PhysioConnect Tanzania. All rights reserved.</p>
                    <div className="footer-legal">
                        <a href="#privacy">Privacy Policy</a>
                        <a href="#terms">Terms of Service</a>
                    </div>
                </div>
            </footer>

            <style>{`
        .landing-page {
          background: var(--bg-primary);
          min-height: 100vh;
        }

        /* Navigation */
        .landing-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          padding: var(--spacing-md) var(--spacing-xl);
          transition: all var(--transition-normal);
        }

        .landing-nav.scrolled {
          background: var(--glass-bg);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--glass-border);
        }

        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          cursor: pointer;
        }

        .nav-logo .logo-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .nav-logo span {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: var(--spacing-lg);
        }

        .nav-links a {
          color: var(--text-secondary);
          font-weight: 500;
          transition: color var(--transition-fast);
        }

        .nav-links a:hover {
          color: var(--text-primary);
        }

        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          color: var(--text-primary);
          cursor: pointer;
        }

        /* Hero Section */
        .hero-section {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 120px var(--spacing-xl);
          overflow: hidden;
        }

        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(15, 23, 42, 0.3),
            rgba(15, 23, 42, 0.7) 50%,
            rgba(15, 23, 42, 0.95)
          );
          z-index: 1;
        }

        .hero-content {
          position: relative;
          z-index: 2;
          text-align: center;
          max-width: 900px;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: var(--spacing-sm);
          background: rgba(99, 102, 241, 0.2);
          border: 1px solid rgba(99, 102, 241, 0.3);
          padding: var(--spacing-sm) var(--spacing-lg);
          border-radius: 9999px;
          font-size: 0.875rem;
          color: var(--primary-light);
          margin-bottom: var(--spacing-xl);
        }

        .hero-title {
          font-size: 4rem;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: var(--spacing-lg);
          color: var(--text-primary);
        }

        .hero-subtitle {
          font-size: 1.25rem;
          color: var(--text-secondary);
          max-width: 600px;
          margin: 0 auto var(--spacing-2xl);
          line-height: 1.7;
        }

        .hero-cta {
          display: flex;
          gap: var(--spacing-md);
          justify-content: center;
          margin-bottom: var(--spacing-2xl);
        }

        .btn-lg {
          padding: var(--spacing-lg) var(--spacing-2xl);
          font-size: 1.1rem;
        }

        .btn-outline {
          background: transparent;
          border: 2px solid var(--glass-border);
          color: var(--text-primary);
        }

        .btn-outline:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: var(--primary);
        }

        .hero-stats {
          display: flex;
          justify-content: center;
          gap: var(--spacing-2xl);
        }

        .hero-stats .stat-item {
          text-align: center;
        }

        .hero-stats .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .hero-stats .stat-label {
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        .scroll-indicator {
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 2;
          color: var(--text-muted);
          animation: bounce 2s infinite;
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateX(-50%) translateY(0); }
          40% { transform: translateX(-50%) translateY(-10px); }
          60% { transform: translateX(-50%) translateY(-5px); }
        }

        /* Sections */
        .section-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 100px var(--spacing-xl);
        }

        .section-header {
          text-align: center;
          margin-bottom: var(--spacing-2xl);
        }

        .section-badge {
          display: inline-block;
          background: rgba(99, 102, 241, 0.2);
          color: var(--primary-light);
          padding: var(--spacing-xs) var(--spacing-md);
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: var(--spacing-md);
        }

        .section-header h2 {
          font-size: 2.5rem;
          margin-bottom: var(--spacing-md);
        }

        .section-header p {
          color: var(--text-muted);
          font-size: 1.125rem;
        }

        /* Features */
        .features-section {
          background: linear-gradient(to bottom, var(--bg-primary), var(--bg-secondary));
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--spacing-xl);
        }

        .feature-card {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-xl);
          padding: var(--spacing-xl);
          transition: all var(--transition-normal);
          animation: fadeIn 0.5s ease forwards;
        }

        .feature-card:hover {
          transform: translateY(-8px);
          border-color: var(--primary);
          box-shadow: 0 20px 40px rgba(99, 102, 241, 0.2);
        }

        .feature-icon {
          width: 56px;
          height: 56px;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: var(--spacing-lg);
        }

        .feature-icon.primary { background: rgba(99, 102, 241, 0.2); color: var(--primary-light); }
        .feature-icon.secondary { background: rgba(16, 185, 129, 0.2); color: var(--secondary-light); }
        .feature-icon.accent { background: rgba(245, 158, 11, 0.2); color: var(--accent-light); }
        .feature-icon.info { background: rgba(59, 130, 246, 0.2); color: var(--info); }

        .feature-card h3 {
          font-size: 1.25rem;
          margin-bottom: var(--spacing-xs);
        }

        .feature-title-sw {
          font-size: 0.875rem;
          color: var(--text-muted);
          font-style: italic;
          margin-bottom: var(--spacing-md);
        }

        .feature-card p:last-child {
          color: var(--text-secondary);
        }

        /* How It Works */
        .how-section {
          background: var(--bg-secondary);
        }

        .steps-grid {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-lg);
        }

        .step-card {
          text-align: center;
          padding: var(--spacing-xl);
          flex: 1;
          max-width: 250px;
        }

        .step-number {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          margin: 0 auto var(--spacing-lg);
        }

        .step-connector {
          width: 60px;
          height: 2px;
          background: linear-gradient(90deg, var(--primary), var(--secondary));
          flex-shrink: 0;
        }

        /* Testimonials */
        .testimonials-section {
          background: var(--bg-primary);
        }

        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--spacing-xl);
        }

        .testimonial-card {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-xl);
          padding: var(--spacing-xl);
        }

        .testimonial-rating {
          display: flex;
          gap: 4px;
          margin-bottom: var(--spacing-md);
        }

        .testimonial-quote {
          font-size: 1.1rem;
          line-height: 1.7;
          color: var(--text-secondary);
          margin-bottom: var(--spacing-xl);
        }

        .testimonial-author {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
        }

        .testimonial-author img {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          object-fit: cover;
        }

        .author-name {
          font-weight: 600;
          color: var(--text-primary);
        }

        .author-role {
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        /* CTA Section */
        .cta-section {
          background: linear-gradient(135deg, var(--primary-dark), var(--primary));
          padding: 100px var(--spacing-xl);
        }

        .cta-container {
          max-width: 800px;
          margin: 0 auto;
          text-align: center;
        }

        .cta-section h2 {
          font-size: 2.5rem;
          margin-bottom: var(--spacing-md);
          color: white;
        }

        .cta-section p {
          font-size: 1.125rem;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: var(--spacing-xl);
        }

        .cta-buttons {
          display: flex;
          justify-content: center;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-xl);
        }

        .cta-section .btn-primary {
          background: white;
          color: var(--primary);
        }

        .cta-section .btn-outline {
          border-color: rgba(255, 255, 255, 0.5);
          color: white;
        }

        .cta-features {
          display: flex;
          justify-content: center;
          gap: var(--spacing-xl);
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.875rem;
        }

        .cta-features span {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
        }

        /* Footer */
        .landing-footer {
          background: var(--bg-secondary);
          padding: 60px var(--spacing-xl) var(--spacing-xl);
        }

        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          gap: var(--spacing-2xl);
          padding-bottom: var(--spacing-2xl);
          border-bottom: 1px solid var(--glass-border);
        }

        .footer-brand p {
          color: var(--text-muted);
          margin-top: var(--spacing-md);
          max-width: 300px;
        }

        .footer-tagline {
          font-style: italic;
          font-size: 0.875rem;
        }

        .footer-links {
          display: flex;
          gap: var(--spacing-2xl);
        }

        .footer-col h4 {
          color: var(--text-primary);
          margin-bottom: var(--spacing-md);
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .footer-col a {
          display: block;
          color: var(--text-muted);
          margin-bottom: var(--spacing-sm);
          font-size: 0.9rem;
        }

        .footer-col a:hover {
          color: var(--text-primary);
        }

        .footer-bottom {
          max-width: 1200px;
          margin: 0 auto;
          padding-top: var(--spacing-xl);
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: var(--text-muted);
          font-size: 0.875rem;
        }

        .footer-legal {
          display: flex;
          gap: var(--spacing-lg);
        }

        .footer-legal a {
          color: var(--text-muted);
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .features-grid,
          .testimonials-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .steps-grid {
            flex-wrap: wrap;
          }

          .step-connector {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .nav-links {
            position: fixed;
            top: 0;
            right: -100%;
            width: 80%;
            max-width: 300px;
            height: 100vh;
            background: var(--bg-secondary);
            flex-direction: column;
            padding: 80px var(--spacing-xl);
            transition: right var(--transition-normal);
          }

          .nav-links.open {
            right: 0;
          }

          .mobile-menu-btn {
            display: block;
          }

          .hero-title {
            font-size: 2.5rem;
          }

          .hero-cta {
            flex-direction: column;
          }

          .hero-stats {
            flex-wrap: wrap;
            gap: var(--spacing-lg);
          }

          .features-grid,
          .testimonials-grid {
            grid-template-columns: 1fr;
          }

          .footer-container {
            flex-direction: column;
          }

          .footer-bottom {
            flex-direction: column;
            gap: var(--spacing-md);
            text-align: center;
          }
        }
      `}</style>
        </div>
    )
}

export default LandingPage
