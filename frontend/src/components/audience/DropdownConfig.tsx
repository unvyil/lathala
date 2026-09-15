// src/components/audience/DropdownConfig.tsx
import React, { useState } from "react";
import { Sliders } from "lucide-react";

interface DropdownConfigProps {
  departments: string[];
  setDepartments: React.Dispatch<React.SetStateAction<string[]>>;
  tierTypes: string[];
  setTierTypes: React.Dispatch<React.SetStateAction<string[]>>;
}

export function DropdownConfig({
  departments,
  setDepartments,
  tierTypes,
  setTierTypes,
}: DropdownConfigProps) {
  const [newDeptInput, setNewDeptInput] = useState("");
  const [newTierInput, setNewTierInput] = useState("");

  return (
    <div className="bg-[#2c2c2c] border border-[#383838] rounded-xl p-5 shadow-sm space-y-4 text-xs">
      <div className="flex items-center gap-2 font-bold text-slate-300 uppercase tracking-wider">
        <Sliders className="w-4 h-4 text-[#0d99ff]" /> Configure Dropdown
        Options (Departments & Types)
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
        <div className="space-y-2">
          <label className="block font-semibold text-slate-400">
            Departments
          </label>
          <div className="flex flex-wrap gap-1.5">
            {departments.map((dept) => (
              <span
                key={dept}
                className="inline-flex items-center gap-1 bg-[#222] text-slate-200 font-semibold px-2.5 py-1 rounded-md border border-[#444]"
              >
                {dept}
                <button
                  onClick={() =>
                    setDepartments(departments.filter((d) => d !== dept))
                  }
                  className="text-slate-400 hover:text-rose-400 font-bold ml-1 text-sm"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2 pt-1">
            <input
              type="text"
              placeholder="Add department..."
              value={newDeptInput}
              onChange={(e) => setNewDeptInput(e.target.value)}
              className="flex-1 p-1.5 bg-[#222] text-slate-100 border border-[#444] rounded-lg outline-none"
            />
            <button
              onClick={() => {
                if (newDeptInput && !departments.includes(newDeptInput)) {
                  setDepartments([...departments, newDeptInput]);
                  setNewDeptInput("");
                }
              }}
              className="px-3 py-1.5 bg-[#0d99ff] text-white font-semibold rounded-lg hover:bg-[#0b84db]"
            >
              Add
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block font-semibold text-slate-400">Types</label>
          <div className="flex flex-wrap gap-1.5">
            {tierTypes.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 bg-[#222] text-indigo-300 font-semibold px-2.5 py-1 rounded-md border border-[#444]"
              >
                {t}
                <button
                  onClick={() =>
                    setTierTypes(tierTypes.filter((type) => type !== t))
                  }
                  className="text-indigo-400 hover:text-rose-400 font-bold ml-1 text-sm"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2 pt-1">
            <input
              type="text"
              placeholder="Add type..."
              value={newTierInput}
              onChange={(e) => setNewTierInput(e.target.value)}
              className="flex-1 p-1.5 bg-[#222] text-slate-100 border border-[#444] rounded-lg outline-none"
            />
            <button
              onClick={() => {
                if (newTierInput && !tierTypes.includes(newTierInput)) {
                  setTierTypes([...tierTypes, newTierInput]);
                  setNewTierInput("");
                }
              }}
              className="px-3 py-1.5 bg-[#0d99ff] text-white font-semibold rounded-lg hover:bg-[#0b84db]"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
