import { X, Command, Keyboard } from "lucide-react";

const SHORTCUTS = [
  { keys: ["Ctrl", "K"], action: "Open Global Search" },
  { keys: ["Ctrl", "1"], action: "Go to Dashboard" },
  { keys: ["Ctrl", "2"], action: "Go to Marketplace" },
  { keys: ["Ctrl", "3"], action: "Go to Wallet" },
  { keys: ["Ctrl", "M"], action: "Toggle Demo Controller" },
  { keys: ["Esc"], action: "Close Modal / Drawer" },
  { keys: ["↑", "↓"], action: "Navigate Search Results" },
  { keys: ["Enter"], action: "Select Search Result" },
];

export default function KeyboardShortcutsModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4" style={{ animation: "backdropFadeIn 0.15s ease-out" }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#1a1e2e] border border-white/[0.1] rounded-2xl shadow-2xl overflow-hidden" style={{ animation: "globalSearchSlideIn 0.2s ease-out" }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Keyboard Shortcuts</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-gray-300 transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-4 space-y-1">
          {SHORTCUTS.map((s, i) => (
            <div key={i} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-white/[0.03] transition-colors">
              <span className="text-sm text-gray-400">{s.action}</span>
              <div className="flex items-center gap-1">
                {s.keys.map((k, j) => (
                  <span key={j}>
                    <kbd className="px-2 py-1 rounded-md bg-white/[0.06] border border-white/[0.08] text-[10px] text-gray-400 font-mono min-w-[24px] text-center inline-block">{k}</kbd>
                    {j < s.keys.length - 1 && <span className="text-gray-600 text-xs mx-0.5">+</span>}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="px-5 py-3 border-t border-white/[0.06] bg-[#151823]">
          <p className="text-[10px] text-gray-600 text-center">Press <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] text-gray-500 font-mono">?</kbd> to toggle this panel</p>
        </div>
      </div>
    </div>
  );
}
