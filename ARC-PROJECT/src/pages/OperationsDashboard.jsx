import React, { useMemo, useState } from 'react';
import { useArc } from '../components/auth/ArcContext';
import StatusBadge from '../components/auth/StatusBadge';
import RoleNav from '../components/auth/RoleNav';

const durationTypes = ['Non-Recurring', 'Monthly', 'Quarterly', 'Semi-Annually', 'Annually'];
const projectTypes = ['Insurance', 'Banking', 'Pension', 'Capital Markets', 'Enterprise Risk'];
const inactiveReasons = ['Early completion', 'Client delays', 'Operational issues'];

const OperationsDashboard = () => {
  const { contracts, officer, updateOperations } = useArc();
  const [search, setSearch] = useState('');
  const [selectedContract, setSelectedContract] = useState(null);
  const [staffEntry, setStaffEntry] = useState({ name: '', contact: '', taskStatus: '' });

  const matchedContract = useMemo(() => {
    if (!search) return null;
    return contracts.find((contract) => contract.contractNumber === search.trim());
  }, [contracts, search]);

  const activeContract = selectedContract || matchedContract;

  const handleSelect = (contract) => {
    setSelectedContract(contract);
    setSearch(contract.contractNumber);
  };

  const handleUpdate = (event) => {
    event.preventDefault();
    if (!activeContract) return;

    const formData = new FormData(event.currentTarget);
    const updates = Object.fromEntries(formData.entries());
    if (
      updates.projectStatusOverride === 'inactive' &&
      !inactiveReasons.includes(updates.inactiveReason)
    ) {
      return;
    }

    updateOperations(activeContract.contractNumber, {
      projectStartDate: updates.projectStartDate,
      projectEndDate: updates.projectEndDate,
      projectType: updates.projectType,
      durationType: updates.durationType,
      operationsOfficer: updates.operationsOfficer,
      projectStatusOverride: updates.projectStatusOverride || null,
      inactiveReason: updates.inactiveReason || null,
      projectStatus: 'Active',
    });
  };

  const addStaff = () => {
    if (!activeContract || !staffEntry.name || !staffEntry.contact || !staffEntry.taskStatus) {
      return;
    }

    updateOperations(activeContract.contractNumber, {
      staffList: [...(activeContract.staffList || []), { ...staffEntry }],
    });
    setStaffEntry({ name: '', contact: '', taskStatus: '' });
  };

  return (
    <div className="min-h-screen bg-brand-black text-white">
      <RoleNav />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12">
        <section className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-brand-gold/30 bg-brand-black/70 p-8 shadow-arc">
            <h2 className="text-xl font-semibold">Retrieve Contract</h2>
            <p className="mt-2 text-sm text-brand-white/60">
              Enter the system-generated Contract Number to configure execution settings and activate
              the project timeline.
            </p>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="brand-2024-0001"
              className="mt-5 w-full rounded-2xl border border-brand-gold/30 bg-transparent px-4 py-3 text-sm text-brand-white focus:border-brand-gold focus:outline-none"
            />

            {activeContract ? (
              <form onSubmit={handleUpdate} className="mt-6 grid gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.3em] text-brand-gold/70">
                    Project Start Date
                    <input
                      name="projectStartDate"
                      defaultValue={activeContract.projectStartDate || ''}
                      type="date"
                      required
                      className="rounded-2xl border border-brand-gold/20 bg-transparent px-4 py-3 text-sm text-brand-white focus:border-brand-gold focus:outline-none"
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.3em] text-brand-gold/70">
                    Project End Date
                    <input
                      name="projectEndDate"
                      defaultValue={activeContract.projectEndDate || ''}
                      type="date"
                      required
                      className="rounded-2xl border border-brand-gold/20 bg-transparent px-4 py-3 text-sm text-brand-white focus:border-brand-gold focus:outline-none"
                    />
                  </label>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.3em] text-brand-gold/70">
                    Project Type
                    <select
                      name="projectType"
                      defaultValue={activeContract.projectType || projectTypes[0]}
                      className="rounded-2xl border border-brand-gold/20 bg-brand-black px-4 py-3 text-sm text-brand-white focus:border-brand-gold focus:outline-none"
                    >
                      {projectTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.3em] text-brand-gold/70">
                    Duration Type
                    <select
                      name="durationType"
                      defaultValue={activeContract.durationType || durationTypes[0]}
                      className="rounded-2xl border border-brand-gold/20 bg-brand-black px-4 py-3 text-sm text-brand-white focus:border-brand-gold focus:outline-none"
                    >
                      {durationTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.3em] text-brand-gold/70">
                  Operations Officer Name
                  <input
                    name="operationsOfficer"
                    defaultValue={activeContract.operationsOfficer || officer.name}
                    type="text"
                    required
                    className="rounded-2xl border border-brand-gold/20 bg-transparent px-4 py-3 text-sm text-brand-white focus:border-brand-gold focus:outline-none"
                  />
                </label>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.3em] text-brand-gold/70">
                    Manual Status Override
                    <select
                      name="projectStatusOverride"
                      defaultValue={activeContract.projectStatusOverride || ''}
                      className="rounded-2xl border border-brand-gold/20 bg-brand-black px-4 py-3 text-sm text-brand-white focus:border-brand-gold focus:outline-none"
                    >
                      <option value="">Auto (Active / Expired)</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </label>
                  <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.3em] text-brand-gold/70">
                    Inactive Reason (Required if inactive)
                    <select
                      name="inactiveReason"
                      defaultValue={activeContract.inactiveReason || ''}
                      className="rounded-2xl border border-brand-gold/20 bg-brand-black px-4 py-3 text-sm text-brand-white focus:border-brand-gold focus:outline-none"
                    >
                      <option value="">Select reason</option>
                      {inactiveReasons.map((reason) => (
                        <option key={reason} value={reason}>
                          {reason}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-2xl border border-brand-gold bg-brand-gold/10 px-6 py-3 text-xs uppercase tracking-[0.3em] text-brand-gold transition hover:bg-brand-gold hover:text-brand-black"
                >
                  Save Execution Setup
                </button>
              </form>
            ) : (
              <div className="mt-6 rounded-2xl border border-brand-gold/20 bg-brand-black/60 p-4 text-sm text-brand-white/60">
                Contract not found. Confirm the Contract Number with Finance.
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-brand-gold/20 bg-brand-black/70 p-6">
              <h3 className="text-lg font-semibold">Contract Directory</h3>
              <div className="mt-4 space-y-3">
                {contracts.length === 0 ? (
                  <p className="text-sm text-brand-white/60">No contracts available.</p>
                ) : (
                  contracts.slice(0, 4).map((contract) => (
                    <button
                      key={contract.contractNumber}
                      onClick={() => handleSelect(contract)}
                      className="flex w-full items-center justify-between rounded-2xl border border-brand-gold/20 bg-brand-black/60 p-4 text-left transition hover:border-brand-gold"
                    >
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-brand-gold/70">{contract.contractNumber}</p>
                        <p className="text-sm text-brand-white/70">Staff: {contract.staffAllocated}</p>
                      </div>
                      <StatusBadge status={contract.profitStatus} label={contract.profitStatus} />
                    </button>
                  ))
                )}
              </div>
            </div>

            {activeContract && (
              <div className="rounded-3xl border border-brand-gold/20 bg-brand-black/70 p-6">
                <h3 className="text-lg font-semibold">Staff Assignment</h3>
                <p className="mt-2 text-sm text-brand-white/60">
                  Allocate staff based on duration, length, and recurrence requirements.
                </p>
                <div className="mt-4 grid gap-3">
                  <input
                    value={staffEntry.name}
                    onChange={(event) => setStaffEntry((prev) => ({ ...prev, name: event.target.value }))}
                    placeholder="Staff name"
                    className="rounded-2xl border border-brand-gold/20 bg-transparent px-4 py-3 text-sm text-brand-white focus:border-brand-gold focus:outline-none"
                  />
                  <input
                    value={staffEntry.contact}
                    onChange={(event) => setStaffEntry((prev) => ({ ...prev, contact: event.target.value }))}
                    placeholder="Contact details"
                    className="rounded-2xl border border-brand-gold/20 bg-transparent px-4 py-3 text-sm text-brand-white focus:border-brand-gold focus:outline-none"
                  />
                  <input
                    value={staffEntry.taskStatus}
                    onChange={(event) => setStaffEntry((prev) => ({ ...prev, taskStatus: event.target.value }))}
                    placeholder="Task completion status"
                    className="rounded-2xl border border-brand-gold/20 bg-transparent px-4 py-3 text-sm text-brand-white focus:border-brand-gold focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={addStaff}
                    className="rounded-2xl border border-brand-gold bg-brand-gold/10 px-6 py-3 text-xs uppercase tracking-[0.3em] text-brand-gold transition hover:bg-brand-gold hover:text-brand-black"
                  >
                    Add Staff
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default OperationsDashboard;
