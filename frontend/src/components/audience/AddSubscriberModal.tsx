// src/components/audience/AddSubscriberModal.tsx
import React, { useState } from "react";
import type { Subscriber } from "../../types";
interface AddSubscriberModalProps {
  departments: string[];
  tierTypes: string[];
  onClose: () => void;
  onAdd: (sub: Subscriber) => void;
}

export function AddSubscriberModal({
  departments,
  tierTypes,
  onClose,
  onAdd,
}: AddSubscriberModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    department: departments[0] || "Marketing",
    type: tierTypes[0] || "Core",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    onAdd({
      id: Date.now().toString(),
      ...formData,
      status: "Unsent",
      is_sent: false,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#2c2c2c] rounded-2xl p-6 w-full max-w-md shadow-xl border border-[#383838] text-xs">
        <h3 className="font-bold text-sm text-white mb-4">
          Add New Subscriber
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold text-slate-400 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g. Jordan Lee"
              className="w-full p-2 bg-[#222] border border-[#444] text-white rounded-lg outline-none"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-400 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="e.g. jordan@quickworks.app"
              className="w-full p-2 bg-[#222] border border-[#444] text-white rounded-lg font-mono outline-none"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-400 mb-1">
              Job Role
            </label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              placeholder="e.g. Lead Architect"
              className="w-full p-2 bg-[#222] border border-[#444] text-white rounded-lg outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-400 mb-1">
                Department
              </label>
              <select
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                className="w-full p-2 bg-[#222] border border-[#444] text-white rounded-lg outline-none"
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-400 mb-1">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="w-full p-2 bg-[#222] border border-[#444] text-white rounded-lg outline-none"
              >
                {tierTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-[#383838]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#444] rounded-lg font-medium text-slate-300 hover:bg-[#333]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#0d99ff] hover:bg-[#0b84db] text-white font-semibold rounded-lg shadow-sm"
            >
              Save Subscriber
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
