// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Home, Calendar, User } from 'lucide-react';
// @ts-ignore;
import { useToast } from '@/components/ui';

export function TabBar({
  activeTab,
  onTabChange
}) {
  const tabs = [{
    id: 'home',
    label: '首页',
    icon: Home
  }, {
    id: 'activities',
    label: '我的活动',
    icon: Calendar
  }, {
    id: 'profile',
    label: '个人中心',
    icon: User
  }];
  return <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {tabs.map(tab => {
        const Icon = tab.icon;
        return <button key={tab.id} onClick={() => onTabChange(tab.id)} className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 ${activeTab === tab.id ? 'text-blue-700 bg-blue-50' : 'text-gray-500 hover:text-gray-700'}`}>
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>;
      })}
      </div>
    </div>;
}