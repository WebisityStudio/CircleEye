import React from 'react';
import { AlertTriangle, Shield, Info } from 'lucide-react';

interface ThreatLevelCardProps {
  level: string;
  description: string;
  color: string;
  lastUpdated: string;
}

// Define all threat levels with updated colors
const THREAT_LEVELS = [
  {
    name: 'Low',
    color: 'from-green-500 to-green-400',
    solidColor: 'bg-green-500',
    textColor: 'text-green-400',
    glowColor: 'shadow-green-500/50',
    description: 'Attack highly unlikely'
  },
  {
    name: 'Moderate',
    color: 'from-emerald-500 to-teal-400',
    solidColor: 'bg-emerald-500',
    textColor: 'text-emerald-400',
    glowColor: 'shadow-emerald-500/50',
    description: 'Attack possible but not likely'
  },
  {
    name: 'Substantial',
    color: 'from-yellow-500 to-amber-400',
    solidColor: 'bg-yellow-500',
    textColor: 'text-yellow-400',
    glowColor: 'shadow-yellow-500/50',
    description: 'Attack is likely'
  },
  {
    name: 'Severe',
    color: 'from-orange-500 to-orange-400',
    solidColor: 'bg-orange-500',
    textColor: 'text-orange-400',
    glowColor: 'shadow-orange-500/50',
    description: 'Attack highly likely'
  },
  {
    name: 'Critical',
    color: 'from-red-600 to-red-500',
    solidColor: 'bg-red-600',
    textColor: 'text-red-500',
    glowColor: 'shadow-red-500/50',
    description: 'Attack expected imminently'
  },
];

export function ThreatLevelCard({ level, description, lastUpdated }: ThreatLevelCardProps) {
  const normalizedLevel = level?.toLowerCase() ?? '';
  const activeIndex = THREAT_LEVELS.findIndex(t => t.name.toLowerCase() === normalizedLevel);
  const activeThreat = activeIndex >= 0 ? THREAT_LEVELS[activeIndex] : null;

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border border-gray-700/50 rounded-2xl p-6 sm:p-8 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#1785d1]/20 rounded-xl">
            <Shield className="h-6 w-6 text-[#1785d1]" />
          </div>
          <div>
            <h3 className="text-white text-xl font-bold">UK Terrorism Threat Level</h3>
            <p className="text-gray-400 text-sm">National security assessment from MI5</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/80 rounded-full text-xs text-gray-400">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Live Data
        </div>
      </div>

      {/* Level Cards */}
      <div className="grid grid-cols-5 gap-2 sm:gap-3 mb-8">
        {THREAT_LEVELS.map((threat, index) => {
          const isActive = index === activeIndex;
          const isPast = index < activeIndex;

          return (
            <div
              key={threat.name}
              className={`
                relative rounded-xl p-3 sm:p-4 transition-all duration-300 cursor-default
                ${isActive
                  ? `bg-gradient-to-b ${threat.color} shadow-lg ${threat.glowColor}`
                  : isPast
                    ? 'bg-gray-800/80 border border-gray-700/50'
                    : 'bg-gray-800/40 border border-gray-700/30'
                }
              `}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full shadow-lg animate-pulse" />
              )}

              {/* Level number */}
              <div className={`
                text-2xl sm:text-3xl font-black mb-1
                ${isActive ? 'text-white' : isPast ? 'text-gray-400' : 'text-gray-600'}
              `}>
                {index + 1}
              </div>

              {/* Level name */}
              <div className={`
                text-[10px] sm:text-xs font-semibold uppercase tracking-wide
                ${isActive ? 'text-white/90' : isPast ? 'text-gray-500' : 'text-gray-600'}
              `}>
                {threat.name}
              </div>
            </div>
          );
        })}
      </div>

      {/* Current Status Panel */}
      <div className={`
        relative overflow-hidden rounded-xl p-5
        bg-gradient-to-r from-gray-800/80 to-gray-800/40
        border-l-4 ${activeThreat ? activeThreat.solidColor.replace('bg-', 'border-') : 'border-gray-600'}
      `}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-gray-400 text-sm font-medium">Current Assessment</span>
              <Info className="w-4 h-4 text-gray-500" />
            </div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`text-3xl font-black ${activeThreat?.textColor || 'text-gray-400'}`}>
                {level}
              </span>
              {activeThreat && (
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${activeThreat.solidColor} text-white`}>
                  Level {activeIndex + 1} of 5
                </span>
              )}
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">{description}</p>
          </div>

          {/* Visual indicator */}
          {activeThreat && (
            <div className={`
              hidden sm:flex items-center justify-center w-20 h-20 rounded-2xl
              bg-gradient-to-br ${activeThreat.color} shadow-lg ${activeThreat.glowColor}
            `}>
              <AlertTriangle className="w-10 h-10 text-white/90" />
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-800">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>Source: MI5 Security Service</span>
        </div>
        <span className="text-xs text-gray-500">Updated: {lastUpdated}</span>
      </div>
    </div>
  );
}
