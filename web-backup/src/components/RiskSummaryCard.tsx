import React from 'react';
import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export function RiskSummaryCard() {
  const riskMetrics = [
    {
      category: 'Overall Risk Level',
      current: 'Medium',
      change: 'stable',
      score: 6.2,
      color: 'text-yellow-500'
    },
    {
      category: 'Terrorism Threat',
      current: 'Substantial',
      change: 'up',
      score: 7.0,
      color: 'text-[#1785d1]'
    },
    {
      category: 'Crime Rate',
      current: 'Medium-High',
      change: 'down',
      score: 6.8,
      color: 'text-red-400'
    },
    {
      category: 'Weather Risk',
      current: 'High',
      change: 'up',
      score: 8.1,
      color: 'text-red-500'
    }
  ];

  const getTrendIcon = (change: string) => {
    switch (change) {
      case 'up': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-green-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-[#1785d1]/30 transition-all">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white text-lg font-semibold">Risk Assessment Summary</h3>
        <Activity className="h-6 w-6 text-[#1785d1]" />
      </div>
      
      <div className="space-y-4">
        {riskMetrics.map((metric, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-300 text-sm">{metric.category}</span>
                {getTrendIcon(metric.change)}
              </div>
              <div className="flex items-center space-x-3">
                <span className={`font-medium ${metric.color}`}>{metric.current}</span>
                <div className="flex-1 bg-gray-800 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      metric.score >= 8 ? 'bg-red-500' :
                      metric.score >= 6 ? 'bg-[#1785d1]' :
                      metric.score >= 4 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${metric.score * 10}%` }}
                  ></div>
                </div>
                <span className="text-gray-400 text-sm w-8">{metric.score}/10</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-800">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium">Recommended Action</span>
            <span className="text-[#1785d1] text-sm">Medium Priority</span>
          </div>
          <p className="text-gray-400 text-sm">
            Monitor weather conditions closely and review travel plans. Stay informed about local security updates.
          </p>
        </div>
      </div>
    </div>
  );
}