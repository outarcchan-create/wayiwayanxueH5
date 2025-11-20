// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Search, Filter } from 'lucide-react';

export function LeaderboardFilters({
  searchQuery,
  onSearchChange,
  selectedPeriod,
  onPeriodChange,
  selectedType,
  onTypeChange
}) {
  const periods = [{
    value: 'all',
    label: '总榜'
  }, {
    value: 'month',
    label: '月榜'
  }, {
    value: 'week',
    label: '周榜'
  }, {
    value: 'day',
    label: '日榜'
  }];
  const types = [{
    value: 'points',
    label: '积分排行'
  }, {
    value: 'activities',
    label: '活动排行'
  }, {
    value: 'tasks',
    label: '任务排行'
  }, {
    value: 'score',
    label: '分数排行'
  }, {
    value: 'time',
    label: '时长排行'
  }];
  return <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input type="text" placeholder="搜索用户..." value={searchQuery} onChange={e => onSearchChange(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
          <Filter className="w-4 h-4 text-gray-600" />
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-gray-600 mb-1 block">时间范围</label>
          <select value={selectedPeriod} onChange={e => onPeriodChange(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
            {periods.map(period => <option key={period.value} value={period.value}>
                {period.label}
              </option>)}
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-600 mb-1 block">排行类型</label>
          <select value={selectedType} onChange={e => onTypeChange(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
            {types.map(type => <option key={type.value} value={type.value}>
                {type.label}
              </option>)}
          </select>
        </div>
      </div>
    </div>;
}