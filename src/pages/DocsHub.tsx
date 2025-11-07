import { useNavigate } from 'react-router-dom';
import { BookOpen, Microscope, Code, Zap, ArrowLeft } from 'lucide-react';

export function DocsHub() {
  const navigate = useNavigate();

  const docs = [
    {
      title: 'User Guide',
      description: 'Complete guide to using Sacred Shifter - what the metrics mean, how to interpret forms, and practical tips',
      icon: BookOpen,
      color: 'from-cyan-500 to-blue-500',
      file: '/SACRED_SHIFTER_USER_GUIDE.md',
      pages: '27 pages'
    },
    {
      title: 'Developer Guide',
      description: 'Integration guide for Cursor AI and developers - architecture, APIs, code examples, and database schema',
      icon: Code,
      color: 'from-purple-500 to-pink-500',
      file: '/SACRED_SHIFTER_DEVELOPER_GUIDE.md',
      pages: '35 pages'
    },
    {
      title: 'Scientific References',
      description: 'Complete research mapping - all 6 consciousness metrics linked to published neuroscience papers',
      icon: Microscope,
      color: 'from-emerald-500 to-teal-500',
      file: '/SACRED_SHIFTER_SCIENCE.md',
      pages: '18 pages'
    },
    {
      title: 'Quick Reference',
      description: 'Cheat sheet - visual interpretation guide, metrics table, troubleshooting, keyboard shortcuts',
      icon: Zap,
      color: 'from-yellow-500 to-orange-500',
      file: '/SACRED_SHIFTER_QUICK_REFERENCE.md',
      pages: '4 pages'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a14] to-[#1a1a2e] py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate('/sessions')}
          className="mb-8 px-4 py-2 bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-full text-slate-300 hover:text-white hover:border-cyan-500/50 transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Sessions</span>
        </button>

        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 mb-4">
            Sacred Shifter Documentation
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Complete guides, scientific references, and integration documentation for the consciousness training system
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {docs.map((doc) => {
            const Icon = doc.icon;
            return (
              <a
                key={doc.file}
                href={doc.file}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 hover:border-slate-600/50 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-cyan-500/10"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${doc.color} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h2 className="text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                        {doc.title}
                      </h2>
                      <span className="text-xs text-slate-500 bg-slate-800/50 px-2 py-1 rounded">
                        {doc.pages}
                      </span>
                    </div>
                    <p className="text-slate-400 leading-relaxed">
                      {doc.description}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between text-sm">
                  <span className="text-cyan-400 font-medium group-hover:underline">
                    Open Documentation →
                  </span>
                  <span className="text-slate-600">
                    Markdown
                  </span>
                </div>
              </a>
            );
          })}
        </div>

        <div className="mt-12 bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-white mb-4">About the Documentation</h3>
          <div className="space-y-3 text-slate-400">
            <p>
              All documentation is written in Markdown format and can be viewed directly in your browser or favorite text editor.
            </p>
            <p>
              The guides are comprehensive and production-ready, covering everything from user experience to scientific validation studies.
            </p>
            <p className="text-cyan-400 font-medium">
              These are living documents - refer back frequently as you deepen your practice or extend the system.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center text-slate-500 text-sm">
          <p>Documentation generated with scientific rigor and practical focus</p>
          <p className="mt-2">🌌 May your forms reveal your truth ✨</p>
        </div>
      </div>
    </div>
  );
}
