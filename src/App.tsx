import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { MetaphysicalOSDemo } from './pages/MetaphysicalOSDemo';
import { DemoMode } from './modules/sacred-shifter-core';
import { Home } from 'lucide-react';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
        <nav className="bg-slate-900/80 backdrop-blur-md border-b border-purple-500/30 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-2 text-purple-200 hover:text-white transition-colors">
                <Home className="w-5 h-5" />
                <span className="font-semibold">Home</span>
              </Link>
              <Link to="/demo/sacred-shifter" className="text-purple-200 hover:text-white transition-colors">
                Sacred Shifter Demo
              </Link>
              <Link to="/metaphysical-os" className="text-purple-200 hover:text-white transition-colors">
                Metaphysical OS
              </Link>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/demo/sacred-shifter" element={<DemoMode />} />
          <Route path="/metaphysical-os" element={<MetaphysicalOSDemo />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

function HomePage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold text-white mb-6 text-center">
          Sacred Shifter Core
        </h1>
        <p className="text-xl text-purple-200 mb-12 text-center">
          Collective consciousness visualization with full astrological integration
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <Link
            to="/demo/sacred-shifter"
            className="bg-slate-800/60 backdrop-blur-md border border-purple-500/40 rounded-xl p-8 hover:border-purple-400 hover:bg-slate-800/80 transition-all group"
          >
            <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">
              Sacred Shifter Demo
            </h2>
            <p className="text-purple-200/80 mb-4">
              Experience all four visualization modes: Individual, Small Group, Large Group, and Massive Scale.
            </p>
            <ul className="space-y-2 text-sm text-purple-200/70">
              <li>✓ Interactive mode switching</li>
              <li>✓ Real-time GAA harmonics (432 Hz)</li>
              <li>✓ Golden angle spiral distribution</li>
              <li>✓ Simulated participants (no setup required)</li>
            </ul>
          </Link>

          <Link
            to="/metaphysical-os"
            className="bg-slate-800/60 backdrop-blur-md border border-purple-500/40 rounded-xl p-8 hover:border-purple-400 hover:bg-slate-800/80 transition-all group"
          >
            <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">
              Metaphysical OS
            </h2>
            <p className="text-purple-200/80 mb-4">
              Full modular consciousness operating system with art pack gallery and module management.
            </p>
            <ul className="space-y-2 text-sm text-purple-200/70">
              <li>✓ Global Event Horizon</li>
              <li>✓ Module orchestration</li>
              <li>✓ Art pack gallery</li>
              <li>✓ Label-based semantic processing</li>
            </ul>
          </Link>
        </div>

        <div className="mt-12 bg-purple-500/10 border border-purple-400/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-purple-200 mb-3">
            🌟 Astrological Features (Coming Soon)
          </h3>
          <p className="text-purple-200/70 text-sm mb-3">
            The complete astrological system is built and ready! It includes:
          </p>
          <ul className="grid md:grid-cols-2 gap-2 text-sm text-purple-200/70">
            <li>☉ Sun/Moon/Rising calculations</li>
            <li>♃ All planetary positions</li>
            <li>⚹ Aspect calculations</li>
            <li>🔥 Element balance visualization</li>
            <li>🏠 House positioning</li>
            <li>💫 Synastry compatibility</li>
          </ul>
          <p className="text-purple-200/70 text-sm mt-4">
            To enable: Add birth data input to the join flow and use the AstrologicalEncoder.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
