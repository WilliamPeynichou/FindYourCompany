import React, { useMemo } from 'react';
import { BookmarkCheck, Download, Mail, Phone, Globe, Trash2, ClipboardList } from 'lucide-react';

const statusLabels = {
  todo: 'À contacter',
  contacted: 'Contactée',
  followup: 'À relancer'
};

const statusClasses = {
  todo: 'bg-zinc-100 text-zinc-700 border-zinc-200',
  contacted: 'bg-green-50 text-green-700 border-green-200',
  followup: 'bg-amber-50 text-amber-700 border-amber-200'
};

export const ApplicationSelectionPanel = ({ selection }) => {
  const stats = useMemo(() => ({
    total: selection.items.length,
    withEmail: selection.items.filter(item => item.company.email).length,
    withWebsiteOnly: selection.items.filter(item => !item.company.email && item.company.website).length
  }), [selection.items]);

  if (selection.items.length === 0) {
    return (
      <aside className="bg-white border border-dashed border-zinc-300 rounded-3xl p-6 text-center">
        <ClipboardList className="w-8 h-8 mx-auto text-zinc-300 mb-3" />
        <h3 className="font-bold text-zinc-900">Ma sélection de candidatures</h3>
        <p className="text-sm text-zinc-500 mt-2">Ajoute des entreprises depuis les résultats pour suivre tes candidatures sans créer de compte.</p>
      </aside>
    );
  }

  return (
    <aside className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-sm space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest bg-red-50 text-red-700 px-2 py-1 rounded-full mb-2">
            <BookmarkCheck className="w-3 h-3" /> Suivi local
          </div>
          <h3 className="text-lg font-bold">Ma sélection</h3>
          <p className="text-xs text-zinc-500">Sauvegardée uniquement dans ce navigateur.</p>
        </div>
        <div className="text-right text-xs text-zinc-500">
          <div className="font-bold text-zinc-900 text-xl">{stats.total}</div>
          entreprises
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-zinc-50 rounded-xl p-3"><b>{stats.withEmail}</b><br />avec email</div>
        <div className="bg-zinc-50 rounded-xl p-3"><b>{stats.withWebsiteOnly}</b><br />site sans email</div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={selection.exportSelection} className="text-xs bg-zinc-900 text-white px-3 py-2 rounded-lg flex items-center gap-1 hover:bg-zinc-700">
          <Download className="w-3 h-3" /> Exporter
        </button>
        <button onClick={selection.copySelection} className="text-xs border border-zinc-300 px-3 py-2 rounded-lg hover:bg-zinc-50">
          Copier la liste
        </button>
      </div>

      <div className="space-y-3 max-h-[520px] overflow-auto pr-1">
        {selection.items.map(item => (
          <div key={item.id} className="border border-zinc-200 rounded-2xl p-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-sm leading-tight">{item.company.name}</p>
                <p className="text-xs text-zinc-500">{item.company.city || item.company.postcode}</p>
              </div>
              <button onClick={() => selection.removeCompany(item.id)} className="text-zinc-400 hover:text-red-600" aria-label="Retirer">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <select
              value={item.status}
              onChange={(event) => selection.updateStatus(item.id, event.target.value)}
              className={`w-full text-xs border rounded-lg px-2 py-1.5 ${statusClasses[item.status]}`}
            >
              {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>

            <textarea
              value={item.note}
              onChange={(event) => selection.updateNote(item.id, event.target.value)}
              placeholder="Note perso : relance, contact, lien offre…"
              className="w-full text-xs border border-zinc-200 rounded-lg p-2 min-h-14 focus:outline-none focus:ring-2 focus:ring-red-100"
              maxLength={300}
            />

            <div className="flex flex-wrap gap-2 text-zinc-500">
              {item.company.email && <Mail className="w-3.5 h-3.5" />}
              {item.company.phone && <Phone className="w-3.5 h-3.5" />}
              {item.company.website && <Globe className="w-3.5 h-3.5" />}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};
