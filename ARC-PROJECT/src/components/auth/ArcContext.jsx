import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ArcContext = createContext(null);

const CONTRACTS_KEY = 'arc-contracts';
const ROLE_KEY = 'arc-role';
const OFFICER_KEY = 'arc-officer';
const SEQUENCE_KEY = 'arc-contract-sequence';

const defaultOfficer = {
  name: 'Executive',
};

const loadStored = (key, fallback) => {
  try {
    const stored = window.localStorage.getItem(key);
    if (!stored) return fallback;
    return JSON.parse(stored);
  } catch (error) {
    return fallback;
  }
};

const persist = (key, value) => {
  window.localStorage.setItem(key, JSON.stringify(value));
};

const generateContractNumber = () => {
  const year = new Date().getFullYear();
  const current = Number(window.localStorage.getItem(SEQUENCE_KEY) || 0) + 1;
  window.localStorage.setItem(SEQUENCE_KEY, String(current));
  return `ARC-${year}-${String(current).padStart(4, '0')}`;
};

const normalizeNumber = (value) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const withProfit = (contract) => {
  const contractValue = normalizeNumber(contract.contractValue);
  const staffCost = normalizeNumber(contract.staffCost);
  const commission = normalizeNumber(contract.commission);
  const tax = normalizeNumber(contract.tax);
  const adminFee = normalizeNumber(contract.adminFee);
  const overheadCost = normalizeNumber(contract.overheadCost);
  const targetProfit = 0.3 * contractValue;
  const actualProfit = contractValue - (staffCost + commission + tax + adminFee + overheadCost);

  let profitStatus = 'green';
  if (actualProfit < 0) {
    profitStatus = 'red';
  } else if (actualProfit < targetProfit) {
    profitStatus = 'orange';
  }

  return {
    ...contract,
    contractValue,
    staffCost,
    commission,
    tax,
    adminFee,
    overheadCost,
    targetProfit,
    actualProfit,
    profitStatus,
  };
};

const calculateProjectStatus = (contract) => {
  const now = new Date();
  const startDate = contract.projectStartDate ? new Date(contract.projectStartDate) : null;
  const endDate = contract.projectEndDate ? new Date(contract.projectEndDate) : null;

  if (contract.projectStatusOverride === 'inactive') {
    return 'Inactive';
  }

  if (startDate && endDate) {
    if (now > endDate) {
      return 'Expired';
    }
    if (now >= startDate) {
      return 'Active';
    }
  }

  return contract.projectStatus || 'Pending';
};

export const ArcProvider = ({ children }) => {
  const [contracts, setContracts] = useState(() => loadStored(CONTRACTS_KEY, []));
  const [role, setRole] = useState(() => loadStored(ROLE_KEY, 'ceo'));
  const [officer, setOfficer] = useState(() => loadStored(OFFICER_KEY, defaultOfficer));

  useEffect(() => {
    persist(CONTRACTS_KEY, contracts);
  }, [contracts]);

  useEffect(() => {
    persist(ROLE_KEY, role);
  }, [role]);

  useEffect(() => {
    persist(OFFICER_KEY, officer);
  }, [officer]);

  const createContract = (payload) => {
    const contractNumber = generateContractNumber();
    const newContract = {
      id: crypto.randomUUID(),
      contractNumber,
      createdAt: new Date().toISOString(),
      financeOfficer: payload.financeOfficer,
      contractValue: payload.contractValue,
      staffAllocated: payload.staffAllocated,
      tax: payload.tax,
      overheadCost: payload.overheadCost,
      commission: payload.commission,
      adminFee: payload.adminFee,
      staffCost: payload.staffCost,
      projectStatus: 'Pending',
      staffList: [],
      ...payload,
    };

    setContracts((prev) => [newContract, ...prev]);
    return contractNumber;
  };

  const updateOperations = (contractNumber, updates) => {
    setContracts((prev) =>
      prev.map((contract) =>
        contract.contractNumber === contractNumber
          ? {
              ...contract,
              ...updates,
            }
          : contract
      )
    );
  };

  const setActiveRole = (nextRole, officerName) => {
    setRole(nextRole);
    setOfficer({ name: officerName || defaultOfficer.name });
  };

  const enrichedContracts = useMemo(() => {
    return contracts.map((contract) => ({
      ...withProfit(contract),
      projectStatus: calculateProjectStatus(contract),
    }));
  }, [contracts]);

  const value = {
    contracts: enrichedContracts,
    rawContracts: contracts,
    role,
    officer,
    createContract,
    updateOperations,
    setActiveRole,
  };

  return <ArcContext.Provider value={value}>{children}</ArcContext.Provider>;
};

export const useArc = () => {
  const context = useContext(ArcContext);
  if (!context) {
    throw new Error('useArc must be used within ArcProvider');
  }
  return context;
};

