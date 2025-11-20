// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { ArrowLeft, RefreshCw } from 'lucide-react';

export function LeaderboardHeader({
  onBack,
  onRefresh,
  refreshing,
  typeText,
  periodText
}) {
  return <div className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white mt-8">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-32 h-32 border-4 border-yellow-400 rounded-full transform -translate-x-16 -translate-y-16"></div>
        <div className="absolute top-10 right-10 w-24 h-24 border-4 border-yellow-400 rounded-lg transform rotate-45"></div>
      </div>
      
      <div className="relative z-10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={onBack} className="mr-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-yellow-300">排行榜</h1>
            <p className="text-blue-100 text-sm">{typeText} - {periodText}</p>
          </div>
        </div>
        <button onClick={onRefresh} disabled={refreshing} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
          <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>;
}