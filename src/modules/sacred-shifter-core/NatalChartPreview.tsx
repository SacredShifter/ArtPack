import { AstrologicalSignature } from './AstrologicalCalculator';
import { Flame, Droplet, Wind, Mountain, Sun, Moon, ArrowUp } from 'lucide-react';

interface NatalChartPreviewProps {
  signature: AstrologicalSignature;
  showDetails?: boolean;
}

export function NatalChartPreview({ signature, showDetails = true }: NatalChartPreviewProps) {
  const { natalChart, elementBalance, dominantElement } = signature;

  const elementIcons: Record<string, any> = {
    fire: Flame,
    earth: Mountain,
    air: Wind,
    water: Droplet
  };

  const ElementIcon = elementIcons[dominantElement] || Flame;

  const elementColors: Record<string, string> = {
    fire: 'from-red-500 to-orange-500',
    earth: 'from-green-600 to-green-800',
    air: 'from-blue-300 to-cyan-400',
    water: 'from-blue-600 to-purple-600'
  };

  const gradientClass = elementColors[dominantElement] || 'from-purple-500 to-indigo-500';

  return (
    <div className="bg-slate-800/60 backdrop-blur-md border border-purple-500/40 rounded-xl p-6 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-3 rounded-full bg-gradient-to-br ${gradientClass}`}>
          <ElementIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Your Cosmic Signature</h3>
          <p className="text-sm text-purple-200/70 capitalize">{dominantElement} Element Dominant</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-900/60 border border-purple-500/20 rounded-lg p-4 text-center">
          <Sun className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
          <div className="text-xs text-purple-200/70 mb-1">Sun Sign</div>
          <div className="text-lg font-bold text-white">{natalChart.sun.sign}</div>
          <div className="text-xs text-purple-300/60">{natalChart.sun.degree.toFixed(1)}°</div>
        </div>

        <div className="bg-slate-900/60 border border-purple-500/20 rounded-lg p-4 text-center">
          <Moon className="w-6 h-6 text-blue-300 mx-auto mb-2" />
          <div className="text-xs text-purple-200/70 mb-1">Moon Sign</div>
          <div className="text-lg font-bold text-white">{natalChart.moon.sign}</div>
          <div className="text-xs text-purple-300/60">{natalChart.moon.degree.toFixed(1)}°</div>
        </div>

        <div className="bg-slate-900/60 border border-purple-500/20 rounded-lg p-4 text-center">
          <ArrowUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
          <div className="text-xs text-purple-200/70 mb-1">Rising</div>
          <div className="text-lg font-bold text-white">{natalChart.rising.sign}</div>
          <div className="text-xs text-purple-300/60">{natalChart.rising.degree.toFixed(1)}°</div>
        </div>
      </div>

      {showDetails && (
        <>
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-purple-200 mb-3">Element Balance</h4>
            <div className="space-y-2">
              {Object.entries(elementBalance).map(([element, percentage]) => {
                const Icon = elementIcons[element];
                const color = elementColors[element];
                const widthPercent = (percentage * 100).toFixed(0);

                return (
                  <div key={element} className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-purple-300 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs text-purple-200/70 mb-1">
                        <span className="capitalize">{element}</span>
                        <span>{widthPercent}%</span>
                      </div>
                      <div className="h-2 bg-slate-900/60 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${color} transition-all duration-500`}
                          style={{ width: `${widthPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-semibold text-purple-200 mb-3">Inner Planets</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-900/40 rounded p-2">
                <span className="text-purple-200/70">☿ Mercury:</span>
                <span className="text-white ml-2">{natalChart.mercury.sign}</span>
              </div>
              <div className="bg-slate-900/40 rounded p-2">
                <span className="text-purple-200/70">♀ Venus:</span>
                <span className="text-white ml-2">{natalChart.venus.sign}</span>
              </div>
              <div className="bg-slate-900/40 rounded p-2">
                <span className="text-purple-200/70">♂ Mars:</span>
                <span className="text-white ml-2">{natalChart.mars.sign}</span>
              </div>
              <div className="bg-slate-900/40 rounded p-2">
                <span className="text-purple-200/70">♃ Jupiter:</span>
                <span className="text-white ml-2">{natalChart.jupiter.sign}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-purple-200 mb-3">Outer Planets</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-900/40 rounded p-2">
                <span className="text-purple-200/70">♄ Saturn:</span>
                <span className="text-white ml-2">{natalChart.saturn.sign}</span>
              </div>
              <div className="bg-slate-900/40 rounded p-2">
                <span className="text-purple-200/70">♅ Uranus:</span>
                <span className="text-white ml-2">{natalChart.uranus.sign}</span>
              </div>
              <div className="bg-slate-900/40 rounded p-2">
                <span className="text-purple-200/70">♆ Neptune:</span>
                <span className="text-white ml-2">{natalChart.neptune.sign}</span>
              </div>
              <div className="bg-slate-900/40 rounded p-2">
                <span className="text-purple-200/70">♇ Pluto:</span>
                <span className="text-white ml-2">{natalChart.pluto.sign}</span>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="mt-6 pt-6 border-t border-purple-500/20">
        <div className="bg-purple-500/10 border border-purple-400/30 rounded-lg p-3">
          <h4 className="text-xs font-semibold text-purple-200 mb-2">Your Visual Encoding</h4>
          <ul className="space-y-1 text-xs text-purple-200/70">
            <li>• Primary color from Sun in {natalChart.sun.sign}</li>
            <li>• Luminosity from Moon in {natalChart.moon.sign}</li>
            <li>• Rotation speed from {natalChart.rising.sign} rising</li>
            <li>• Position in House {natalChart.sun.house} zone</li>
            <li>• {dominantElement} element intensity</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
