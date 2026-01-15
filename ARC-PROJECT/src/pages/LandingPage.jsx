import React from 'react';
import { ArrowRight, ShieldCheck, Sparkles, CalendarClock, BarChart3, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import arcLogo from '../assets/logo.png';

const highlights = [
  {
    title: 'Portfolio command center',
    description: 'Track every engagement, risk review, and compliance milestone in a single source of truth.',
    icon: BarChart3,
  },
  {
    title: 'Workflows that feel effortless',
    description: 'Automate approvals, SLA reminders, and client reporting with configurable playbooks.',
    icon: Sparkles,
  },
  {
    title: 'Security-first collaboration',
    description: 'Keep sensitive data protected with role-based access, audit trails, and encrypted files.',
    icon: ShieldCheck,
  },
];

const workflows = [
  {
    title: 'Intake & triage',
    description: 'Capture new work requests, assign stakeholders, and prioritize in minutes.',
  },
  {
    title: 'Project delivery',
    description: 'Run sprints, risk registers, and deliverable checklists with live status tracking.',
  },
  {
    title: 'Executive reporting',
    description: 'Generate board-ready summaries with KPIs, timelines, and financial health.',
  },
];

const metrics = [
  { label: 'Average delivery time', value: '28% faster' },
  { label: 'Compliance readiness', value: '98% audit-ready' },
  { label: 'Stakeholder visibility', value: '3x higher' },
];

const LandingPage = () => {
  return (
    <div className="bg-brand-black text-white">
      <section className="relative overflow-hidden pt-20 pb-24">
        <div className="absolute inset-0">
          <div className="absolute -top-20 -right-24 h-64 w-64 rounded-full bg-brand-red/40 blur-[120px] animate-glow" />
          <div className="absolute bottom-10 left-10 h-56 w-56 rounded-full bg-brand-gold/30 blur-[120px] animate-glow" />
        </div>

        <div className="relative mx-auto flex max-w-7xl flex-col gap-16 px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-3 rounded-full border border-brand-gold/30 bg-white/5 px-4 py-2 text-sm text-brand-sand/80">
              <Sparkles size={16} className="text-brand-gold" />
              Elevate office operations with ARC FlowSuite
            </div>
            <h1 className="mt-6 text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              The premium project management system for actuarial &amp; risk consulting teams.
            </h1>
            <p className="mt-6 text-lg text-brand-sand/80">
              Deliver client engagements faster, coordinate every office workflow, and keep leadership informed with a
              modern workspace inspired by ARC&apos;s precision and elegance.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-full bg-brand-red px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-red/30 transition hover:-translate-y-0.5"
              >
                Start with ARC
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-full border border-brand-gold/60 px-6 py-3 text-sm font-semibold text-brand-gold transition hover:bg-brand-gold/10"
              >
                Book a demo
                <CalendarClock size={16} />
              </Link>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {metrics.map((metric) => (
                <div key={metric.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-brand-sand/70">{metric.label}</p>
                  <p className="mt-2 text-xl font-semibold text-brand-gold">{metric.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
              <div className="flex items-center justify-between">
                <img src={arcLogo} alt="ARC Actuarial and Risk Consulting" className="h-12 object-contain" />
                <span className="rounded-full bg-brand-gold/20 px-3 py-1 text-xs font-semibold text-brand-gold">
                  Live Workspace
                </span>
              </div>
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl bg-brand-slate/70 p-4">
                  <p className="text-sm text-brand-sand/70">Enterprise portfolio</p>
                  <p className="mt-1 text-lg font-semibold">Q4 Risk Readiness</p>
                  <p className="mt-3 text-xs text-brand-sand/60">12 teams • 48 deliverables • 96% on-track</p>
                </div>
                <div className="rounded-2xl border border-brand-gold/30 bg-black/60 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-brand-sand/70">Today&apos;s focus</p>
                    <span className="rounded-full bg-brand-red/20 px-3 py-1 text-xs text-brand-red">High priority</span>
                  </div>
                  <p className="mt-2 text-base font-semibold">Client renewal modeling</p>
                  <div className="mt-3 h-2 w-full rounded-full bg-white/10">
                    <div className="h-2 w-4/5 rounded-full bg-brand-gold" />
                  </div>
                </div>
                <div className="rounded-2xl bg-white/5 p-4">
                  <div className="flex items-center gap-3 text-sm text-brand-sand/70">
                    <Users size={16} className="text-brand-gold" />
                    14 stakeholders aligned with live updates
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -left-10 top-8 hidden w-44 rounded-2xl border border-white/10 bg-black/60 p-4 text-sm text-brand-sand/70 shadow-xl lg:block animate-float">
              <p className="font-semibold text-white">Real-time risk alerts</p>
              <p className="mt-2 text-xs">3 items require review today</p>
            </div>
            <div className="absolute -bottom-10 right-12 hidden w-40 rounded-2xl border border-white/10 bg-brand-red/90 p-4 text-xs text-white shadow-xl lg:block animate-float-slow">
              SLA compliance 99.2%
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="bg-gradient-to-b from-brand-black to-brand-slate/40 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-brand-gold">Designed for offices</p>
              <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">
                Modern tools with the polish of a premium consulting brand.
              </h2>
            </div>
            <p className="max-w-xl text-brand-sand/70">
              ARC FlowSuite blends project tracking, risk management, and knowledge sharing into a single refined
              experience so teams stay aligned and clients stay confident.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {highlights.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:-translate-y-1 hover:border-brand-gold/60"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gold/20">
                    <Icon className="text-brand-gold" size={22} />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold">{feature.title}</h3>
                  <p className="mt-3 text-sm text-brand-sand/70">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="workflow" className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <h2 className="text-3xl font-semibold sm:text-4xl">From intake to board-ready reporting.</h2>
              <p className="mt-4 text-brand-sand/70">
                Replace scattered spreadsheets with a cohesive system that scales across consulting engagements, internal
                initiatives, and compliance projects.
              </p>
              <div className="mt-8 space-y-6">
                {workflows.map((flow, index) => (
                  <div key={flow.title} className="flex gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-gold/40 text-sm font-semibold text-brand-gold">
                      0{index + 1}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{flow.title}</h3>
                      <p className="mt-2 text-sm text-brand-sand/70">{flow.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-brand-sand/70">Office portfolio health</p>
                  <span className="rounded-full bg-brand-gold/20 px-3 py-1 text-xs text-brand-gold">Updated 5 min ago</span>
                </div>
                <div className="mt-6 space-y-4">
                  {['Capital modeling', 'Client reporting', 'ERM implementation'].map((item) => (
                    <div key={item} className="rounded-2xl bg-brand-slate/70 p-4">
                      <p className="text-sm font-semibold">{item}</p>
                      <div className="mt-3 h-2 w-full rounded-full bg-white/10">
                        <div className="h-2 w-3/4 rounded-full bg-brand-red" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -right-6 -top-6 hidden rounded-2xl border border-white/10 bg-black/70 p-4 text-xs text-brand-sand/70 shadow-xl lg:block animate-drift">
                18 automations running
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="cta" className="bg-brand-slate/70 py-16">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 rounded-3xl border border-white/10 bg-black/60 px-8 py-12 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-3xl font-semibold">Upgrade the office to brand-level precision.</h2>
            <p className="mt-3 text-brand-sand/70">
              Bring everyone into a consistent, elegant workspace that matches the trust your clients expect.
            </p>
          </div>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-full bg-brand-gold px-6 py-3 text-sm font-semibold text-brand-black shadow-lg shadow-brand-gold/30 transition hover:-translate-y-0.5"
          >
            Launch workspace
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
