
import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface ShareModalProps {
  roomId: string;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ roomId, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const joinUrl = `${window.location.origin}${window.location.pathname}?room=${roomId}`;

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, joinUrl, {
        width: 250,
        margin: 2,
        color: {
          dark: '#4f46e5',
          light: '#ffffff',
        },
      });
    }
  }, [joinUrl]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl border-4 border-indigo-50 text-center relative overflow-hidden">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
          <i className="fa-solid fa-times text-xl"></i>
        </button>

        <div className="mb-6">
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <i className="fa-solid fa-qrcode text-3xl"></i>
          </div>
          <h3 className="text-2xl font-black text-slate-800">Invite Players</h3>
          <p className="text-slate-500 font-medium">Scan to watch the reveal live!</p>
        </div>

        <div className="bg-indigo-50 p-4 rounded-3xl mb-6 flex justify-center shadow-inner">
          <canvas ref={canvasRef} className="rounded-xl"></canvas>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-100 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Room Code</p>
              <p className="text-2xl font-black text-indigo-600 tracking-widest">{roomId}</p>
            </div>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(joinUrl);
                alert("Link copied!");
              }}
              className="px-4 py-2 bg-white text-indigo-600 rounded-xl font-bold shadow-sm hover:shadow-md transition-all text-sm"
            >
              Copy Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
