import { useEffect, useState } from 'react';

const STORAGE_KEY = 'ttb_application_selection_v1';

const getCompanyId = (company) => company?.siret || company?.siren || `${company?.name}-${company?.postcode}`;

const statusLabels = {
  todo: 'À contacter',
  contacted: 'Contactée',
  followup: 'À relancer'
};

const toCsv = (items) => {
  const headers = ['Statut', 'Nom', 'Adresse', 'Ville', 'Code postal', 'Email', 'Téléphone', 'Site web', 'Secteur', 'Note'];
  const rows = items.map(({ company, status, note }) => [
    statusLabels[status] || status,
    company.name || '',
    company.address || '',
    company.city || '',
    company.postcode || '',
    company.email || '',
    company.phone || '',
    company.website || '',
    company.sectorLabel || company.sector || '',
    note || ''
  ]);

  return [
    headers.join(';'),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
  ].join('\n');
};

export const useApplicationSelection = () => {
  const [items, setItems] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Le stockage local est un confort, pas une dépendance bloquante.
    }
  }, [items]);

  const addCompany = (company) => {
    const id = getCompanyId(company);
    if (!id) return;
    setItems(prev => {
      if (prev.some(item => item.id === id)) return prev;
      return [{ id, company, status: 'todo', note: '', createdAt: new Date().toISOString() }, ...prev];
    });
  };

  const removeCompany = (id) => setItems(prev => prev.filter(item => item.id !== id));
  const updateStatus = (id, status) => setItems(prev => prev.map(item => item.id === id ? { ...item, status } : item));
  const updateNote = (id, note) => setItems(prev => prev.map(item => item.id === id ? { ...item, note } : item));
  const isSelected = (company) => items.some(item => item.id === getCompanyId(company));

  const exportSelection = () => {
    const blob = new Blob(['\ufeff' + toCsv(items)], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `candidatures_alternance_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const copySelection = async () => {
    const text = items.map(({ company, status, note }) => [
      `${company.name} — ${statusLabels[status]}`,
      company.email ? `Email : ${company.email}` : 'Email : non disponible',
      company.phone ? `Téléphone : ${company.phone}` : null,
      company.website ? `Site : ${company.website}` : null,
      company.address ? `Adresse : ${company.address}` : null,
      note ? `Note : ${note}` : null
    ].filter(Boolean).join('\n')).join('\n\n');
    await navigator.clipboard?.writeText(text);
  };

  return { items, addCompany, removeCompany, updateStatus, updateNote, isSelected, exportSelection, copySelection };
};
