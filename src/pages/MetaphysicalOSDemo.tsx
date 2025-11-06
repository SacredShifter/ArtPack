import React, { useEffect, useState } from 'react';
import { Sparkles, Brain, Zap, Users, Eye, Compass, TrendingUp } from 'lucide-react';
import { geh } from '../core/GlobalEventHorizon';
import { moduleManager } from '../core/ModuleManager';
import { ArtPackModule } from '../modules/artpacks/ArtPackModule';
import { CollectiveCoherenceEngine } from '../modules/collective-coherence/CollectiveCoherenceEngine';
import { TemporalResonanceArchive } from '../modules/temporal-resonance/TemporalResonanceArchive';
import { SilenceAmplifier } from '../modules/silence-amplifier/SilenceAmplifier';
import { QuantumEntanglementMode } from '../modules/quantum-entanglement/QuantumEntanglementMode';
import { JourneyOrchestrator } from '../modules/journey-orchestrator/JourneyOrchestrator';
import type { ResonanceField } from '../core/types';

export function MetaphysicalOSDemo() {
  const [systemInitialized, setSystemInitialized] = useState(false);
  const [resonanceField, setResonanceField] = useState<ResonanceField | null>(null);
  const [activeModules, setActiveModules] = useState<string[]>([]);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [coherence, setCoherence] = useState(0);
  const [stillnessScore, setStillnessScore] = useState(0);

  useEffect(() => {
    initializeSystem();

    const fieldInterval = setInterval(() => {
      const field = geh.getResonanceField();
      setResonanceField(field);
      setActiveModules(moduleManager.getActiveModules());

      const history = geh.queryHistory({ limit: 5 });
      setRecentEvents(history);
    }, 1000);

    return () => clearInterval(fieldInterval);
  }, []);

  async function initializeSystem() {
    await moduleManager.registerModule(new ArtPackModule());
    await moduleManager.registerModule(new CollectiveCoherenceEngine());
    await moduleManager.registerModule(new TemporalResonanceArchive());
    await moduleManager.registerModule(new SilenceAmplifier());
    await moduleManager.registerModule(new QuantumEntanglementMode());
    await moduleManager.registerModule(new JourneyOrchestrator());

    await moduleManager.activateModule('artpack-system');
    await moduleManager.activateModule('silence-amplifier');
    await moduleManager.activateModule('temporal-resonance-archive');

    setSystemInitialized(true);

    simulateCoherence();
  }

  function simulateCoherence() {
    setInterval(() => {
      const amplitude = Math.random() * 0.5 + 0.3;

      setCoherence(amplitude);

      geh.publish({
        type: 'coherence-sample-updated',
        timestamp: Date.now(),
        sourceModule: 'demo-simulator',
        labels: ['coherence', 'biometric', 'simulated'],
        payload: {
          sample: {
            timestamp: Date.now(),
            amplitude,
            phase: Math.random() * Math.PI * 2,
            frequency: 0.1
          }
        }
      });
    }, 2000);
  }

  async function startJourney(intention: string) {
    geh.publish({
      type: 'journey-requested',
      timestamp: Date.now(),
      sourceModule: 'demo-ui',
      labels: ['journey', 'user-action'],
      payload: { intention }
    });
  }

  async function createQuantumPair() {
    await moduleManager.activateModule('quantum-entanglement-mode');

    const qe = moduleManager.getExposedItem('quantum-entanglement-mode', 'createPair');
    await qe('user-1', 'user-2', 'complementary');

    geh.publish({
      type: 'quantum-pair-created',
      timestamp: Date.now(),
      sourceModule: 'demo-ui',
      labels: ['quantum', 'user-action'],
      payload: { mode: 'complementary' }
    });
  }

  async function captureResonanceMoment() {
    const archive = moduleManager.getExposedItem('temporal-resonance-archive', 'captureNow');
    await archive('peak-experience', 'Manual capture from demo');
  }

  async function startCollectiveSession() {
    await moduleManager.activateModule('collective-coherence-engine');

    const cce = moduleManager.getExposedItem('collective-coherence-engine', 'createSession');
    cce('demo-session', 'demo-user');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <Sparkles className="w-12 h-12 text-purple-400 animate-pulse" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Sacred Shifter
            </h1>
          </div>
          <p className="text-xl text-purple-300">Metaphysical Operating System</p>
          <p className="text-sm text-purple-400 mt-2">
            World's First Consciousness-Responsive Visual Experience Platform
          </p>
        </header>

        {!systemInitialized ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
            <p className="mt-4 text-purple-300">Initializing Metaphysical OS...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                  Global Resonance Field
                </h2>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-purple-900/30 rounded-xl p-4">
                    <div className="text-sm text-purple-300 mb-1">Global Coherence</div>
                    <div className="text-3xl font-bold">{resonanceField?.globalCoherence.toFixed(2) || '0.00'}</div>
                  </div>
                  <div className="bg-blue-900/30 rounded-xl p-4">
                    <div className="text-sm text-blue-300 mb-1">Event Density</div>
                    <div className="text-3xl font-bold">{resonanceField?.eventDensity.toFixed(2) || '0.00'}</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-purple-300 mb-2">Live Coherence</div>
                  <div className="h-4 bg-purple-900/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                      style={{ width: `${coherence * 100}%` }}
                    />
                  </div>
                  <div className="text-right text-sm text-purple-400 mt-1">{(coherence * 100).toFixed(1)}%</div>
                </div>

                <div className="mt-4">
                  <div className="text-sm text-purple-300 mb-2">Dominant Labels</div>
                  <div className="flex flex-wrap gap-2">
                    {resonanceField?.dominantLabels.map(label => (
                      <span key={label} className="px-3 py-1 bg-purple-500/20 rounded-full text-xs">
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Zap className="w-6 h-6 text-yellow-400" />
                  Revolutionary Features
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => startJourney('deep grief processing')}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl p-4 text-left transition-all hover:scale-105"
                  >
                    <Compass className="w-6 h-6 mb-2" />
                    <div className="font-semibold">Journey Orchestrator</div>
                    <div className="text-xs opacity-80">Telos-driven sequences</div>
                  </button>

                  <button
                    onClick={createQuantumPair}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-xl p-4 text-left transition-all hover:scale-105"
                  >
                    <Users className="w-6 h-6 mb-2" />
                    <div className="font-semibold">Quantum Entanglement</div>
                    <div className="text-xs opacity-80">Non-local connection</div>
                  </button>

                  <button
                    onClick={captureResonanceMoment}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-xl p-4 text-left transition-all hover:scale-105"
                  >
                    <Eye className="w-6 h-6 mb-2" />
                    <div className="font-semibold">Resonance Archive</div>
                    <div className="text-xs opacity-80">Capture peak moments</div>
                  </button>

                  <button
                    onClick={startCollectiveSession}
                    className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 rounded-xl p-4 text-left transition-all hover:scale-105"
                  >
                    <Brain className="w-6 h-6 mb-2" />
                    <div className="font-semibold">Collective Coherence</div>
                    <div className="text-xs opacity-80">Group field sync</div>
                  </button>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20">
                <h2 className="text-2xl font-bold mb-4">Recent Events</h2>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {recentEvents.map((event, i) => (
                    <div key={i} className="bg-purple-900/20 rounded-lg p-3 text-sm">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-purple-300">{event.type}</span>
                        <span className="text-xs text-purple-500">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-xs text-purple-400">
                        {event.sourceModule} • {event.labels.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20">
                <h2 className="text-xl font-bold mb-4">Active Modules</h2>
                <div className="space-y-2">
                  {moduleManager.getAllModules().map(mod => {
                    const isActive = activeModules.includes(mod.id);
                    return (
                      <div
                        key={mod.id}
                        className={`p-3 rounded-lg ${
                          isActive ? 'bg-green-500/20 border border-green-500/30' : 'bg-slate-700/20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-sm">{mod.name}</span>
                          <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-400' : 'bg-slate-500'}`} />
                        </div>
                        <div className="text-xs text-purple-400">{mod.integrityScore}% integrity</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20">
                <h2 className="text-xl font-bold mb-4">Silence Amplifier</h2>
                <p className="text-sm text-purple-300 mb-4">
                  Stay still to enhance visuals. Movement reduces complexity.
                </p>
                <div className="bg-purple-900/30 rounded-xl p-4">
                  <div className="text-sm text-purple-300 mb-2">Stillness Score</div>
                  <div className="text-4xl font-bold">{stillnessScore.toFixed(0)}</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30">
                <h2 className="text-xl font-bold mb-2">About This System</h2>
                <p className="text-sm text-purple-200 leading-relaxed">
                  Sacred Shifter is the world's first consciousness-responsive visual platform,
                  integrating biometric feedback, collective coherence, and metaphysical principles
                  into a unified operating system for expanded awareness.
                </p>
                <div className="mt-4 pt-4 border-t border-purple-500/30">
                  <div className="text-xs text-purple-400 space-y-1">
                    <div>✨ Telos-driven orchestration</div>
                    <div>🌊 Conspansion lifecycle</div>
                    <div>🎯 Super-tautological validation</div>
                    <div>🌌 Quantum entanglement mode</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
