// src/components/audience/AudienceTable.tsx
import React, { useState } from "react";
import type { Subscriber } from "../types";
import {
  UserPlus,
  Plus,
  Send,
  Search,
  Check,
  Clock,
  Edit3,
  Trash2,
} from "lucide-react";

interface AudienceTableProps {
  subscribers: Subscriber[];
  setSubscribers: React.Dispatch<React.SetStateAction<Subscriber[]>>;
  departments: string[];
  tierTypes: string[];
  onOpenModal: () => void;
  onToggleSent: (sub: Subscriber) => void;
  onSendAll: () => void;
  isProcessing: boolean;
}

export function AudienceTable({
  subscribers,
  setSubscribers,
  departments,
  tierTypes,
  onOpenModal,
  onToggleSent,
  onSendAll,
  isProcessing,
}: AudienceTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingSubId, setEditingSubId] = useState<string | null>(null);

  const handleUpdateField = (
    id: string,
    field: keyof Subscriber,
    value: any,
  ) => {
    setSubscribers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    );
  };

  const handleDelete = (id: string) => {
    setSubscribers((prev) => prev.filter((s) => s.id !== id));
  };

  const filtered = subscribers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const sentCount = subscribers.filter((s) => s.is_sent).length;
  const pendingCount = subscribers.length - sentCount;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-white font-bold text-lg">
            <UserPlus className="w-5 h-5 text-[#0d99ff]" /> Audience Database
            CRM
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            {subscribers.length} total subscribers • {sentCount} dispatched •{" "}
            {pendingCount} pending
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenModal}
            className="flex items-center gap-2 px-4 py-2 bg-[#2c2c2c] border border-[#383838] hover:bg-[#383838] rounded-xl text-xs font-semibold shadow-sm text-white"
          >
            <Plus className="w-4 h-4" /> Add Subscriber
          </button>
          <button
            onClick={onSendAll}
            disabled={isProcessing}
            className="flex items-center gap-2 px-5 py-2 bg-[#0d99ff] hover:bg-[#0b84db] disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm"
          >
            <Send className="w-4 h-4" />{" "}
            {isProcessing ? "Dispatching..." : "Send to All Unsent"}
          </button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-[#2c2c2c] border border-[#383838] text-white rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#0d99ff] shadow-sm"
        />
      </div>

      <div className="bg-[#2c2c2c] border border-[#383838] rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#383838] bg-[#222] text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-center">Dispatch</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#383838] text-xs">
            {filtered.map((sub) => (
              <tr key={sub.id} className="hover:bg-[#333]">
                <td className="py-3 px-4 font-medium text-white">
                  {editingSubId === sub.id ? (
                    <input
                      type="text"
                      value={sub.name}
                      onChange={(e) =>
                        handleUpdateField(sub.id, "name", e.target.value)
                      }
                      className="px-2 py-1 bg-[#222] border border-[#444] text-white rounded text-xs w-full"
                    />
                  ) : (
                    sub.name
                  )}
                </td>
                <td className="py-3 px-4 text-slate-400 font-mono text-xs">
                  {editingSubId === sub.id ? (
                    <input
                      type="email"
                      value={sub.email}
                      onChange={(e) =>
                        handleUpdateField(sub.id, "email", e.target.value)
                      }
                      className="px-2 py-1 bg-[#222] border border-[#444] text-white rounded text-xs w-full font-mono"
                    />
                  ) : (
                    sub.email
                  )}
                </td>
                <td className="py-3 px-4 text-slate-300">
                  {editingSubId === sub.id ? (
                    <input
                      type="text"
                      value={sub.role}
                      onChange={(e) =>
                        handleUpdateField(sub.id, "role", e.target.value)
                      }
                      className="px-2 py-1 bg-[#222] border border-[#444] text-white rounded text-xs w-full"
                    />
                  ) : (
                    sub.role
                  )}
                </td>
                <td className="py-3 px-4">
                  <select
                    value={sub.department}
                    onChange={(e) =>
                      handleUpdateField(sub.id, "department", e.target.value)
                    }
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg border bg-[#222] border-[#444] text-slate-200 cursor-pointer outline-none"
                  >
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-3 px-4">
                  <select
                    value={sub.type}
                    onChange={(e) =>
                      handleUpdateField(sub.id, "type", e.target.value)
                    }
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg border bg-[#222] border-[#444] text-indigo-300 cursor-pointer outline-none"
                  >
                    {tierTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex items-center gap-1 font-medium ${sub.is_sent ? "text-emerald-400" : "text-slate-400"}`}
                  >
                    {sub.is_sent ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    {sub.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <input
                    type="checkbox"
                    checked={sub.is_sent}
                    disabled={isProcessing}
                    onChange={() => onToggleSent(sub)}
                    className="w-4 h-4 text-[#0d99ff] border-[#444] rounded focus:ring-[#0d99ff] cursor-pointer bg-[#222]"
                  />
                </td>
                <td className="py-3 px-4 text-center space-x-2">
                  <button
                    onClick={() =>
                      setEditingSubId(editingSubId === sub.id ? null : sub.id)
                    }
                    className="p-1.5 text-slate-400 hover:bg-[#383838] rounded"
                    title="Edit Row"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(sub.id)}
                    className="p-1.5 text-rose-400 hover:bg-rose-950/40 rounded"
                    title="Delete Subscriber"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
