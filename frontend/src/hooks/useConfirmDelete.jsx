import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';

export function useConfirmDelete(onDelete) {
  const [deletingId, setDeletingId] = useState(null);

  const requestDelete = (id) => setDeletingId(id);
  const cancelDelete = () => setDeletingId(null);
  const confirmDelete = async () => {
    if (deletingId) {
      await onDelete(deletingId);
      setDeletingId(null);
    }
  };

  return { deletingId, requestDelete, cancelDelete, confirmDelete };
}

export function ConfirmDeleteModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-red-100 p-2.5 rounded-full"><Trash2 className="h-5 w-5 text-red-600"/></div>
          <div>
            <h2 className="text-[13px] font-black text-slate-800 uppercase">Confirm Delete</h2>
            <p className="text-[11px] text-slate-500">This action cannot be undone.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onConfirm} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-black uppercase text-[11px] tracking-wide py-2.5 rounded-lg">Delete</button>
          <button onClick={onCancel} className="flex-1 border-2 border-slate-200 text-slate-600 font-black uppercase text-[11px] tracking-wide py-2.5 rounded-lg">Cancel</button>
        </div>
      </div>
    </div>
  );
}
