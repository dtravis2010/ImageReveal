
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="text-center space-y-2">
      <div className="inline-flex items-center justify-center p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 mb-2">
        <i className="fa-solid fa-th-large text-white text-3xl"></i>
      </div>
      <h1 className="text-4xl font-black text-slate-800 tracking-tight">
        Reveal <span className="text-indigo-600">Masters</span>
      </h1>
      <p className="text-slate-500 font-medium max-w-md mx-auto">
        The ultimate classroom activity. Guess the hidden image one tile at a time.
      </p>
    </header>
  );
};
