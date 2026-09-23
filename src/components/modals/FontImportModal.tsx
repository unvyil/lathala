import React, { useState } from 'react';
import { useStudio } from '../../contexts/StudioContext';
import { XIcon, PlusIcon, TypeIcon, SparklesIcon, CheckIcon } from 'lucide-react';

interface FontImportModalProps {
  open: boolean;
  onClose: () => void;
}

const POPULAR_GOOGLE_FONTS = [
  { family: 'Playfair Display', category: 'Serif', sample: 'Editorial Excellence' },
  { family: 'Cormorant Garamond', category: 'Serif', sample: 'Graceful Renaissance' },
  { family: 'Cinzel', category: 'Serif', sample: 'Classic Roman' },
  { family: 'Space Mono', category: 'Monospace', sample: 'Terminal Code' },
  { family: 'Syne', category: 'Display', sample: 'Experimental Studio' },
  { family: 'Bodoni Moda', category: 'Serif', sample: 'High Fashion & Elegance' },
  { family: 'Plus Jakarta Sans', category: 'Sans-Serif', sample: 'Modern Tech & Human' },
  { family: 'Bitter', category: 'Serif', sample: 'Comfortable Reading' },
];

export function FontImportModal({ open, onClose }: FontImportModalProps) {
  const { fonts, addFont } = useStudio();
  const [customFamily, setCustomFamily] = useState('');
  const [customCategory, setCustomCategory] = useState<'sans-serif' | 'serif' | 'monospace' | 'display'>('serif');

  if (!open) return null;

  const handleImport = (family: string, category: string = 'serif') => {
    // Inject link tag for Google Font dynamically if not already loaded
    const fontQuery = family.replace(/\s+/g, '+');
    const linkId = `gfont-${fontQuery.toLowerCase()}`;
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${fontQuery}:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap`;
      document.head.appendChild(link);
    }

    addFont({
      family,
      label: family,
      category: category as any,
      weights: [400, 600, 700],
      source: 'google',
    });
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFamily.trim()) return;
    handleImport(customFamily.trim(), customCategory);
    setCustomFamily('');
  };

  return (
    <div className="fixed inset-0 bg-onyx/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-base border border-sandbar rounded-2xl w-full max-w-lg shadow-artboard overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-onyx text-parchment px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TypeIcon size={16} className="text-accent" />
            <h3 className="font-serif text-base font-semibold">Import Google Font</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-parchment/60 hover:text-parchment"
          >
            <XIcon size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 overflow-y-auto max-h-[75vh] lathala-scroll">
          {/* Custom Font Name Input */}
          <form onSubmit={handleCustomSubmit} className="space-y-3 bg-white p-4 rounded-xl border border-sandbar">
            <label className="block text-xs font-semibold text-onyx">
              Add any Google Font by name
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customFamily}
                onChange={(e) => setCustomFamily(e.target.value)}
                placeholder="e.g. UnifrakturMaguntia, DM Serif Text, Fraunces"
                className="flex-1 h-9 rounded-lg border border-sandbar bg-white px-3 text-xs text-onyx focus:border-accent focus:outline-none"
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-lg bg-onyx hover:bg-espresso text-parchment text-xs font-semibold shrink-0"
              >
                Add Font
              </button>
            </div>
            <p className="text-[10px] text-espresso/60">
              Lathala will automatically inject the Google Fonts stylesheet link and make it selectable in the Typography Inspector.
            </p>
          </form>

          {/* Curated Editorial Recommendations */}
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-espresso/70 block mb-2">
              Curated Editorial Typestyles
            </span>
            <div className="space-y-2">
              {POPULAR_GOOGLE_FONTS.map((font) => {
                const isAlreadyAdded = fonts.some(
                  (f) => f.family.toLowerCase() === font.family.toLowerCase(),
                );

                return (
                  <div
                    key={font.family}
                    className="flex items-center justify-between p-3 rounded-xl bg-white border border-sandbar hover:border-accent/60 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-onyx">{font.family}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sandbar/40 text-espresso/70">
                          {font.category}
                        </span>
                      </div>
                      <span className="text-xs text-espresso/60 mt-0.5 block italic">
                        "{font.sample}"
                      </span>
                    </div>

                    <button
                      onClick={() => handleImport(font.family, font.category.toLowerCase())}
                      disabled={isAlreadyAdded}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                        isAlreadyAdded
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-onyx hover:bg-espresso text-parchment'
                      }`}
                    >
                      {isAlreadyAdded ? (
                        <>
                          <CheckIcon size={12} />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <PlusIcon size={12} />
                          <span>Import</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-sandbar/20 px-5 py-3 border-t border-sandbar flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-onyx text-parchment text-xs font-semibold hover:bg-espresso"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
