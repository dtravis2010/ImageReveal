
import React, { useState } from 'react';
import { generateGameImage } from '../geminiService';

interface SetupScreenProps {
  onStart: (image: string, difficulty: 'easy' | 'medium' | 'hard', teamConfig?: any) => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({ onStart }) => {
  const [prompt, setPrompt] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [mode, setMode] = useState<'solo' | 'battle'>('battle');
  const [localImage, setLocalImage] = useState<string | null>(null);
  
  // Team 1 State
  const [t1Name, setT1Name] = useState('Team Alpha');
  const [t1Players, setT1Players] = useState('');
  
  // Team 2 State
  const [t2Name, setT2Name] = useState('Team Omega');
  const [t2Players, setT2Players] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    const img = await generateGameImage(prompt);
    if (img) {
      setLocalImage(img);
    }
    setIsGenerating(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        setLocalImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStart = () => {
    if (!localImage) return;
    const teamConfig = mode === 'battle' ? {
      t1: { name: t1Name, players: t1Players.split(',').map(s => s.trim()).filter(Boolean) },
      t2: { name: t2Name, players: t2Players.split(',').map(s => s.trim()).filter(Boolean) }
    } : undefined;
    onStart(localImage, difficulty, teamConfig);
  };

  return (
    <div className="p-6 md:p-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Side: Game Config */}
        <div className="flex-[1.5] space-y-6">
          <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg">
                <i className="fa-solid fa-gamepad"></i>
             </div>
             <h2 className="text-2xl font-black text-slate-800 tracking-tight">Game Settings</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Image Generator</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. Ancient Rome"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full pl-4 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                  />
                  <button
                    disabled={isGenerating || !prompt.trim()}
                    onClick={handleGenerate}
                    className="absolute right-2 top-2 bottom-2 px-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isGenerating ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
                  </button>
                </div>
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Difficulty</label>
                <select 
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold appearance-none"
                >
                  <option value="easy">Easy (4x4)</option>
                  <option value="medium">Medium (6x6)</option>
                  <option value="hard">Hard (10x10)</option>
                </select>
             </div>
          </div>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-white px-2 text-slate-400 font-black">Or Upload Image</span>
            </div>
          </div>

          <label className="cursor-pointer flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-200 rounded-xl hover:bg-slate-50 hover:border-indigo-300 transition-all text-slate-600 group">
            <i className="fa-solid fa-upload group-hover:text-indigo-500"></i>
            <span className="text-sm font-bold">Choose File</span>
            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
          </label>

          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Team Mode</label>
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button onClick={() => setMode('solo')} className={`px-4 py-1 rounded-md text-xs font-bold transition-all ${mode === 'solo' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>Solo</button>
                <button onClick={() => setMode('battle')} className={`px-4 py-1 rounded-md text-xs font-bold transition-all ${mode === 'battle' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>Battle</button>
              </div>
            </div>

            {mode === 'battle' && (
              <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 space-y-3">
                   <input 
                    placeholder="Team 1 Name" 
                    value={t1Name} 
                    onChange={e => setT1Name(e.target.value)}
                    className="w-full bg-white/60 p-2 rounded-lg text-sm font-bold text-rose-700 outline-none focus:bg-white"
                   />
                   <textarea 
                    placeholder="Participants (comma separated)" 
                    value={t1Players}
                    onChange={e => setT1Players(e.target.value)}
                    className="w-full h-20 bg-white/60 p-2 rounded-lg text-xs outline-none focus:bg-white resize-none"
                   />
                </div>
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 space-y-3 text-right">
                   <input 
                    placeholder="Team 2 Name" 
                    value={t2Name} 
                    onChange={e => setT2Name(e.target.value)}
                    className="w-full bg-white/60 p-2 rounded-lg text-sm font-bold text-blue-700 outline-none focus:bg-white text-right"
                   />
                   <textarea 
                    placeholder="Participants (comma separated)" 
                    value={t2Players}
                    onChange={e => setT2Players(e.target.value)}
                    className="w-full h-20 bg-white/60 p-2 rounded-lg text-xs outline-none focus:bg-white text-right resize-none"
                   />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Action & Preview */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex-1 flex flex-col justify-center items-center p-6 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 min-h-[300px] overflow-hidden relative">
            {localImage ? (
              <div className="absolute inset-0 p-2">
                <img src={localImage} alt="Preview" className="w-full h-full object-cover rounded-[1.5rem] shadow-sm" />
                <button 
                  onClick={() => setLocalImage(null)}
                  className="absolute top-4 right-4 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70"
                >
                  <i className="fa-solid fa-times"></i>
                </button>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto">
                  <i className="fa-solid fa-image text-slate-400 text-3xl"></i>
                </div>
                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Image Preview</p>
              </div>
            )}
          </div>

          <button
            onClick={handleStart}
            disabled={!localImage}
            className="w-full py-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-3xl shadow-xl shadow-indigo-100 transition-all group relative overflow-hidden disabled:opacity-50 disabled:grayscale"
          >
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform"></div>
            <i className="fa-solid fa-bolt text-3xl mb-2 block"></i>
            <span className="text-xl font-black uppercase tracking-tighter">
              {mode === 'battle' ? 'Start Battle' : 'Start Solo Game'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
