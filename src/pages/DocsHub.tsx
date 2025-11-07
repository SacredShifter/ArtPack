import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BookOpen, Microscope, Code, Zap, ArrowLeft, Sparkles, CheckCircle, Network, Plug, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Doc {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  color_gradient: string;
  page_count: string;
  content: string;
  order: number;
}

const iconMap: Record<string, any> = {
  'book-open': BookOpen,
  'code': Code,
  'microscope': Microscope,
  'zap': Zap,
  'sparkles': Sparkles,
  'check-circle': CheckCircle,
  'network': Network,
  'plug': Plug
};

export function DocsHub() {
  const navigate = useNavigate();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Doc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocs();
  }, []);

  async function loadDocs() {
    const { data, error } = await supabase
      .from('documentation')
      .select('*')
      .eq('is_published', true)
      .order('order');

    if (error) {
      console.error('Failed to load docs:', error);
    } else {
      setDocs(data || []);
    }
    setLoading(false);
  }

  if (selectedDoc) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a14] to-[#1a1a2e] py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setSelectedDoc(null)}
            className="mb-8 px-4 py-2 bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-full text-slate-300 hover:text-white hover:border-cyan-500/50 transition-all flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            <span className="text-sm font-medium">Close</span>
          </button>

          <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 md:p-12">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-4">{selectedDoc.title}</h1>
              <p className="text-lg text-slate-400">{selectedDoc.description}</p>
              <div className="flex items-center gap-4 mt-4">
                <span className="text-sm text-slate-500 bg-slate-800/50 px-3 py-1 rounded-full">
                  {selectedDoc.page_count}
                </span>
                <span className="text-sm text-slate-500 bg-slate-800/50 px-3 py-1 rounded-full capitalize">
                  {selectedDoc.category}
                </span>
              </div>
            </div>

            <div className="prose prose-invert prose-cyan max-w-none">
              <div className="whitespace-pre-wrap text-slate-300 leading-relaxed font-mono text-sm">
                {selectedDoc.content}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            Complete guides, scientific references, and integration documentation stored in Supabase
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="relative">
              <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-cyan-500 border-r-purple-500" />
              <div className="w-16 h-16" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {docs.map((doc) => {
              const Icon = iconMap[doc.icon] || BookOpen;
              return (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className="group relative bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 hover:border-slate-600/50 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-cyan-500/10 text-left"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${doc.color_gradient} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h2 className="text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                          {doc.title}
                        </h2>
                        <span className="text-xs text-slate-500 bg-slate-800/50 px-2 py-1 rounded">
                          {doc.page_count}
                        </span>
                      </div>
                      <p className="text-slate-400 leading-relaxed">
                        {doc.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between text-sm">
                    <span className="text-cyan-400 font-medium group-hover:underline">
                      Read Documentation →
                    </span>
                    <span className="text-slate-600 capitalize">
                      {doc.category}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-12 bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-white mb-4">About the Documentation</h3>
          <div className="space-y-3 text-slate-400">
            <p>
              All documentation is stored in Supabase and rendered in real-time from the database.
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
          <p>Documentation managed through Supabase • {docs.length} documents available</p>
        </div>
      </div>
    </div>
  );
}
