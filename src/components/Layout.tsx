import React from 'react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen text-slate-800 bg-[#f8fafc] font-sans">
      <div id="app" className="max-w-7xl mx-auto px-4 pt-0 pb-12">
        {children}
      </div>
    </div>
  );
};
