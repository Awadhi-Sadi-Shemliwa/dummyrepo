import React, { useState } from 'react';
import { useArc } from '../components/auth/ArcContext';
import StatusBadge from '../components/auth/StatusBadge';
import RoleNav from '../components/auth/RoleNav';

const emptyForm = {
  contractValue: '',
  staffAllocated: '',
  tax: '',
  overheadCost: '',
  commission: '',
  adminFee: '',
  staffCost: '',
  financeOfficer: '',
};

const FinanceDashboard = () => {
  const { contracts, officer, createContract } = useArc();
  const [formData, setFormData] = useState({ ...emptyForm, financeOfficer: officer.name });
  const [recentContract, setRecentContract] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const contractNumber = createContract(formData);
    setRecentContract(contractNumber);
    setFormData({ ...emptyForm, financeOfficer: officer.name });
  };

  // Show only contracts created by this finance officer
  const myContracts = contracts.filter(
    (contract) => contract.financeOfficer?.toLowerCase() === officer.name?.toLowerCase()
  );
  const latestContracts = myContracts.slice(0, 4);

  return (
    <div className="min-h-screen bg-brand-black text-white">
      <RoleNav />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12">
        <section className="grid gap-8 md:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-brand-gold/30 bg-brand-black/70 p-8 shadow-lg">
            <h2 className="text-xl font-semibold">Create New Contract</h2>
            <p className="mt-2 text-sm text-brand-white/60">
              Contract signature triggers project initiation instantly. Capture full financial inputs
              to lock target and actual profit metrics.
            </p>
            <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.3em] text-brand-gold/70">
                  Contract Value
                  <input
                    name="contractValue"
                    value={formData.contractValue}
                    onChange={handleChange}
                    type="number"
                    required
                    className="rounded-2xl border border-brand-gold/20 bg-transparent px-4 py-3 text-sm text-brand-white focus:border-brand-gold focus:outline-none"
                  />
                </label>
                <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.3em] text-brand-gold/70">
                  Staff Allocated
                  <input
                    name="staffAllocated"
                    value={formData.staffAllocated}
                    onChange={handleChange}
                    type="number"
                    required
                    className="rounded-2xl border border-brand-gold/20 bg-transparent px-4 py-3 text-sm text-brand-white focus:border-brand-gold focus:outline-none"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {[
                  { label: 'Tax', name: 'tax' },
                  { label: 'Overhead Cost', name: 'overheadCost' },
                  { label: 'Commission', name: 'commission' },
                  { label: 'Admin Fee', name: 'adminFee' },
                  { label: 'Staff Cost', name: 'staffCost' },
                ].map((field) => (
                  <label
                    key={field.name}
                    className="flex flex-col gap-2 text-xs uppercase tracking-[0.3em] text-brand-gold/70"
                  >
                    {field.label}
                    <input
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      type="number"
                      required
                      className="rounded-2xl border border-brand-gold/20 bg-transparent px-4 py-3 text-sm text-brand-white focus:border-brand-gold focus:outline-none"
                    />
                  </label>
                ))}
              </div>

              <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.3em] text-brand-gold/70">
                Finance Officer Name
                <input
                  name="financeOfficer"
                  value={formData.financeOfficer}
                  onChange={handleChange}
                  type="text"
                  required
                  className="rounded-2xl border border-brand-gold/20 bg-transparent px-4 py-3 text-sm text-brand-white focus:border-brand-gold focus:outline-none"
                />
              </label>

              <button
                type="submit"
                className="mt-2 w-full rounded-2xl border border-brand-gold bg-brand-gold/10 px-6 py-3 text-xs uppercase tracking-[0.3em] text-brand-gold transition hover:bg-brand-gold hover:text-brand-black"
              >
                Generate Contract
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-brand-gold/20 bg-brand-black/70 p-6">
              <h3 className="text-lg font-semibold">Auto-Calculated Metrics</h3>
              <p className="mt-2 text-sm text-brand-white/60">
                Target Profit is fixed at 30% of contract value. Actual Profit reflects the full cost
                structure provided. Profit status updates automatically with every entry.
              </p>
              {recentContract && (
                <div className="mt-5 rounded-2xl border border-brand-gold/30 bg-brand-black/70 p-4 text-sm">
                  <p className="text-xs uppercase tracking-[0.3em] text-brand-gold/70">Last Contract</p>
                  <p className="mt-2 text-lg font-semibold">{recentContract}</p>
                </div>
              )}
            </div>
            <div className="rounded-3xl border border-brand-gold/20 bg-brand-black/70 p-6">
              <h3 className="text-lg font-semibold">Recent Contracts</h3>
              <div className="mt-4 space-y-4">
                {latestContracts.length === 0 ? (
                  <p className="text-sm text-brand-white/60">No contracts created yet.</p>
                ) : (
                  latestContracts.map((contract) => (
                    <div
                      key={contract.contractNumber}
                      className="rounded-2xl border border-brand-gold/20 bg-brand-black/60 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.3em] text-brand-gold/70">Contract</p>
                          <p className="text-lg font-semibold">{contract.contractNumber}</p>
                        </div>
                        <StatusBadge
                          status={contract.profitStatus}
                          label={contract.profitStatus.toUpperCase()}
                        />
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-brand-white/60">
                        <span>Value: {contract.contractValue.toLocaleString()}</span>
                        <span>Target: {contract.targetProfit.toLocaleString()}</span>
                        <span>Actual: {contract.actualProfit.toLocaleString()}</span>
                        <span>Staff: {contract.staffAllocated}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default FinanceDashboard;
