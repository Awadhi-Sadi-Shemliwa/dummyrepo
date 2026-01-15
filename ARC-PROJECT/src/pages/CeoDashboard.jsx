import React from 'react';
import StatusBadge from '../components/auth/StatusBadge';
import { useArc } from '../components/auth/ArcContext';
import RoleNav from '../components/auth/RoleNav';
import { BarChart3, TrendingUp, AlertTriangle, DollarSign, Users, FileText, Calendar, Target } from 'lucide-react';

const statusLabel = (status) => {
  if (status === 'green') return 'Green';
  if (status === 'orange') return 'Orange';
  return 'Red';
};

const CeoDashboard = () => {
  const { contracts } = useArc();

  const totalValue = contracts.reduce((sum, c) => sum + (c.contractValue || 0), 0);
  const totalProfit = contracts.reduce((sum, c) => sum + (c.actualProfit || 0), 0);
  const activeCount = contracts.filter((c) => c.projectStatus === 'Active').length;
  const atRiskCount = contracts.filter((c) => c.profitStatus === 'red').length;

  return (
    <div className="min-h-screen bg-brand-black text-white">
      <RoleNav />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-12">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl border border-brand-gold/30 bg-gradient-to-br from-brand-black via-brand-slate/50 to-brand-black p-12 shadow-2xl">
          <div className="absolute inset-0">
            <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-brand-red/20 blur-[120px] animate-glow" />
            <div className="absolute bottom-10 left-10 h-56 w-56 rounded-full bg-brand-gold/20 blur-[120px] animate-glow" />
          </div>
          <div className="relative z-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-8">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-brand-gold/70 mb-2">Executive Command Center</p>
                <h1 className="text-4xl md:text-5xl font-semibold mb-3">Portfolio Performance Overview</h1>
                <p className="text-brand-sand/70 max-w-2xl">
                  Real-time visibility across all contracts, financial metrics, and operational status
                </p>
              </div>
              <div className="flex flex-wrap gap-4 text-xs uppercase tracking-[0.3em] text-brand-sand/60">
                <span className="px-4 py-2 rounded-full border border-brand-gold/30 bg-brand-gold/5">Read-only visibility</span>
                <span className="px-4 py-2 rounded-full border border-brand-gold/30 bg-brand-gold/5">Full system control</span>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-4">
              <div className="rounded-2xl border border-brand-gold/20 bg-brand-black/60 backdrop-blur p-6 hover:border-brand-gold/40 transition">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-xl bg-brand-gold/20">
                    <FileText size={20} className="text-brand-gold" />
                  </div>
                  <p className="text-xs uppercase tracking-[0.3em] text-brand-gold/70">Total Projects</p>
                </div>
                <p className="text-4xl font-bold">{contracts.length}</p>
              </div>
              <div className="rounded-2xl border border-brand-gold/20 bg-brand-black/60 backdrop-blur p-6 hover:border-brand-gold/40 transition">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-xl bg-brand-gold/20">
                    <TrendingUp size={20} className="text-brand-gold" />
                  </div>
                  <p className="text-xs uppercase tracking-[0.3em] text-brand-gold/70">Active Contracts</p>
                </div>
                <p className="text-4xl font-bold">{activeCount}</p>
              </div>
              <div className="rounded-2xl border border-brand-red/20 bg-brand-black/60 backdrop-blur p-6 hover:border-brand-red/40 transition">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-xl bg-brand-red/20">
                    <AlertTriangle size={20} className="text-brand-red" />
                  </div>
                  <p className="text-xs uppercase tracking-[0.3em] text-brand-red/70">At Risk</p>
                </div>
                <p className="text-4xl font-bold text-brand-red">{atRiskCount}</p>
              </div>
              <div className="rounded-2xl border border-brand-gold/20 bg-brand-black/60 backdrop-blur p-6 hover:border-brand-gold/40 transition">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-xl bg-brand-gold/20">
                    <DollarSign size={20} className="text-brand-gold" />
                  </div>
                  <p className="text-xs uppercase tracking-[0.3em] text-brand-gold/70">Total Value</p>
                </div>
                <p className="text-3xl font-bold">{totalValue.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          {contracts.length === 0 ? (
            <div className="rounded-3xl border border-brand-gold/20 bg-brand-black/70 p-12 text-center">
              <FileText size={48} className="mx-auto mb-4 text-brand-gold/50" />
              <p className="text-lg text-brand-sand/70 mb-2">No contracts have been created yet</p>
              <p className="text-sm text-brand-sand/60">
                Once Finance records a signed contract, it will appear here instantly.
              </p>
            </div>
          ) : (
            contracts.map((contract) => (
              <div
                key={contract.contractNumber}
                className="group rounded-3xl border border-brand-gold/20 bg-gradient-to-br from-brand-black/80 to-brand-slate/40 p-8 shadow-lg hover:shadow-2xl hover:border-brand-gold/40 transition-all"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-brand-gold/70 mb-1">Contract Number</p>
                    <h3 className="text-2xl font-bold mb-2">{contract.contractNumber}</h3>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        contract.projectStatus === 'Active' 
                          ? 'bg-brand-gold/20 text-brand-gold border border-brand-gold/30'
                          : contract.projectStatus === 'Expired'
                          ? 'bg-brand-red/20 text-brand-red border border-brand-red/30'
                          : 'bg-brand-sand/20 text-brand-sand border border-brand-sand/30'
                      }`}>
                        {contract.projectStatus}
                      </span>
                      {contract.inactiveReason && (
                        <span className="text-xs text-brand-sand/60">· {contract.inactiveReason}</span>
                      )}
                    </div>
                  </div>
                  <StatusBadge status={contract.profitStatus} label={statusLabel(contract.profitStatus)} />
                </div>

                <div className="grid gap-4 md:grid-cols-3 mb-6">
                  <div className="rounded-2xl border border-brand-gold/20 bg-brand-black/60 backdrop-blur p-6 hover:border-brand-gold/40 transition">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign size={16} className="text-brand-gold" />
                      <p className="text-xs uppercase tracking-[0.3em] text-brand-gold/70">Contract Value</p>
                    </div>
                    <p className="text-2xl font-bold">{contract.contractValue?.toLocaleString() || '0'}</p>
                  </div>
                  <div className="rounded-2xl border border-brand-gold/20 bg-brand-black/60 backdrop-blur p-6 hover:border-brand-gold/40 transition">
                    <div className="flex items-center gap-2 mb-2">
                      <Target size={16} className="text-brand-gold" />
                      <p className="text-xs uppercase tracking-[0.3em] text-brand-gold/70">Target Profit</p>
                    </div>
                    <p className="text-2xl font-bold text-brand-gold">{contract.targetProfit?.toLocaleString() || '0'}</p>
                  </div>
                  <div className={`rounded-2xl border backdrop-blur p-6 transition ${
                    contract.actualProfit >= 0 
                      ? 'border-brand-gold/20 bg-brand-black/60 hover:border-brand-gold/40'
                      : 'border-brand-red/20 bg-brand-red/10 hover:border-brand-red/40'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp size={16} className={contract.actualProfit >= 0 ? 'text-brand-gold' : 'text-brand-red'} />
                      <p className="text-xs uppercase tracking-[0.3em] text-brand-gold/70">Actual Profit</p>
                    </div>
                    <p className={`text-2xl font-bold ${contract.actualProfit >= 0 ? 'text-brand-gold' : 'text-brand-red'}`}>
                      {contract.actualProfit?.toLocaleString() || '0'}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3 mb-6">
                  <div className="rounded-2xl border border-brand-gold/20 bg-brand-black/60 backdrop-blur p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Users size={16} className="text-brand-gold" />
                      <p className="text-xs uppercase tracking-[0.3em] text-brand-gold/70">Staff Allocated</p>
                    </div>
                    <p className="text-2xl font-bold">{contract.staffAllocated || '0'}</p>
                  </div>
                  <div className="rounded-2xl border border-brand-gold/20 bg-brand-black/60 backdrop-blur p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText size={16} className="text-brand-gold" />
                      <p className="text-xs uppercase tracking-[0.3em] text-brand-gold/70">Finance Officer</p>
                    </div>
                    <p className="text-lg font-semibold">{contract.financeOfficer || 'Not Assigned'}</p>
                  </div>
                  <div className="rounded-2xl border border-brand-gold/20 bg-brand-black/60 backdrop-blur p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Users size={16} className="text-brand-gold" />
                      <p className="text-xs uppercase tracking-[0.3em] text-brand-gold/70">Operations Officer</p>
                    </div>
                    <p className="text-lg font-semibold">{contract.operationsOfficer || 'Not Assigned'}</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-brand-gold/20 bg-brand-black/60 backdrop-blur p-6 mb-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-brand-gold/70 mb-4">Staff Payment Structure</p>
                  <div className="grid gap-3 text-sm text-brand-sand/80 md:grid-cols-3">
                    <div className="flex justify-between">
                      <span>Staff Cost:</span>
                      <span className="font-semibold">{contract.staffCost?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Commission:</span>
                      <span className="font-semibold">{contract.commission?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Admin Fee:</span>
                      <span className="font-semibold">{contract.adminFee?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span className="font-semibold">{contract.tax?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Overhead:</span>
                      <span className="font-semibold">{contract.overheadCost?.toLocaleString() || '0'}</span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 mb-6">
                  <div className="rounded-2xl border border-brand-gold/20 bg-brand-black/60 backdrop-blur p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText size={16} className="text-brand-gold" />
                      <p className="text-xs uppercase tracking-[0.3em] text-brand-gold/70">Project Type</p>
                    </div>
                    <p className="text-lg font-semibold">{contract.projectType || 'Pending'}</p>
                  </div>
                  <div className="rounded-2xl border border-brand-gold/20 bg-brand-black/60 backdrop-blur p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar size={16} className="text-brand-gold" />
                      <p className="text-xs uppercase tracking-[0.3em] text-brand-gold/70">Duration Type</p>
                    </div>
                    <p className="text-lg font-semibold">{contract.durationType || 'Pending'}</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-brand-gold/20 bg-brand-black/60 backdrop-blur p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Users size={16} className="text-brand-gold" />
                    <p className="text-xs uppercase tracking-[0.3em] text-brand-gold/70">Staff List</p>
                  </div>
                  {contract.staffList && contract.staffList.length > 0 ? (
                    <div className="grid gap-3 md:grid-cols-2">
                      {contract.staffList.map((staff, index) => (
                        <div key={`${staff.name}-${index}`} className="rounded-2xl border border-brand-gold/20 bg-brand-slate/40 p-4 hover:border-brand-gold/40 transition">
                          <p className="text-sm font-semibold mb-1">{staff.name}</p>
                          <p className="text-xs text-brand-sand/70 mb-1">{staff.contact}</p>
                          <p className="text-xs text-brand-gold/70">{staff.taskStatus}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-brand-sand/60">No staff assigned yet.</p>
                  )}
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
};

export default CeoDashboard;
