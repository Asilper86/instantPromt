import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Copy, Check, Sparkles, Loader2, ArrowRight, 
  History, Trash2, Info, ThumbsUp, ThumbsDown, 
  ChevronDown, Type, Zap
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';

// --- Sub-components ---

const AdContainer = ({ position }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full my-8">
      <div className="relative h-28 w-full rounded-2xl overflow-hidden glass-card flex items-center justify-center">
        {isLoading ? (
          <div className="absolute inset-0 bg-gray-800/50 animate-pulse flex items-center justify-center">
             <span className="text-gray-600 text-[10px] font-mono uppercase tracking-widest">Ad Slot {position} Loading...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <span className="text-gray-500 text-[10px] uppercase tracking-[0.2em] mb-2">Publicidad</span>
            <div className="text-gray-600 font-medium text-sm">[ Google AdSense Placeholder ]</div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main Application ---

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('Professional');
  const [variation, setVariation] = useState('Detailed');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [feedback, setFeedback] = useState(null); // 'up' or 'down'

  const resultEndRef = useRef(null);

  // Load history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('prompt_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (resultEndRef.current) {
      resultEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [result]);

  const saveToHistory = (newResult) => {
    const entry = {
      id: Date.now(),
      prompt: prompt.substring(0, 50) + (prompt.length > 50 ? '...' : ''),
      result: newResult,
      date: new Date().toLocaleTimeString()
    };
    setHistory(prev => {
      const newHistory = [entry, ...prev].slice(0, 5);
      localStorage.setItem('prompt_history', JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const handleOptimize = async () => {
    if (!prompt.trim()) {
      toast.error('Por favor, ingresa una idea para optimizar.');
      return;
    }
    
    setIsLoading(true);
    setResult('');
    setFeedback(null);
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/api/optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, tone, variation })
      });
      
      if (!response.ok) {
        if (response.status === 429) throw new Error('Límite de uso alcanzado. Espera un minuto.');
        throw new Error('Error de conectividad con el servidor.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;
      let fullText = '';
      
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          fullText += chunk;
          setResult(prev => prev + chunk);
        }
      }
      
      saveToHistory(fullText);
      toast.success('Prompt optimizado con éxito!');
      
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Error de conexión.');
      setResult("### [ERROR]\nNo se pudo conectar con el servidor. Inténtalo de nuevo en unos segundos.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setIsCopied(true);
    toast.success('Copiado al portapapeles');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('prompt_history');
    toast('Historial borrado', { icon: '🗑️' });
  };

  const charCount = prompt.length;
  const wordCount = prompt.trim() ? prompt.trim().split(/\s+/).length : 0;

  return (
    <HelmetProvider>
      <ErrorBoundary>
        <div className="min-h-screen bg-dark text-gray-100 selection:bg-primary/30 relative overflow-hidden">
          <Toaster position="top-right" toastOptions={{
            style: { background: '#1f2937', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
          }} />
          
          {/* Animated Background Orbs */}
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

          <Helmet>
            <title>{prompt ? `Optimizar: ${prompt.substring(0, 20)}...` : 'InstantPrompt - Optimizer Profesional'}</title>
            <meta name="description" content="La herramienta definitiva para ingenieros de prompts. Optimización instantánea con IA avanzada." />
          </Helmet>

          <header className="glass-card border-x-0 border-t-0 py-4 px-6 relative z-10">
             <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div className="flex items-center gap-2">
                   <Zap className="w-6 h-6 text-primary fill-primary/20" />
                   <span className="text-xl font-bold tracking-tight">Instant<span className="text-primary">Prompt</span></span>
                </div>
                <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-400">
                   <a href="#" className="hover:text-white transition-colors">Características</a>
                   <a href="#" className="hover:text-white transition-colors">API</a>
                   <a href="#" className="px-4 py-2 bg-white/5 rounded-lg glass-button">Login</a>
                </div>
             </div>
          </header>

          <main className="max-w-6xl mx-auto px-4 py-12 relative z-10">
            {/* Hero Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-16"
            >
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6">
                Ingeniería de <span className="text-gradient">Prompts</span><br/>
                en un solo clic.
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                Transforma instrucciones simples en directivas de alto rendimiento para ChatGPT, Claude y Llama 3.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Input & Controls */}
              <div className="lg:col-span-7 space-y-6">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass-card rounded-3xl p-8"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                      <Type className="w-5 h-5 text-primary" />
                      Entrada del Prompt
                    </h2>
                    <div className="flex gap-4 text-xs font-mono text-gray-500">
                      <span>{charCount} Caracteres</span>
                      <span>{wordCount} Palabras</span>
                    </div>
                  </div>

                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe lo que quieres que la IA haga..."
                    className="w-full h-48 bg-black/20 border border-white/5 rounded-2xl p-6 text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all resize-none mb-6 placeholder-gray-600 shadow-inner"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 px-1">Tono del Experto</label>
                      <div className="relative group">
                         <select 
                           value={tone}
                           onChange={(e) => setTone(e.target.value)}
                           className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
                         >
                            {['Professional', 'Creative', 'Technical', 'Academic'].map(t => (
                              <option key={t} value={t} className="bg-dark">{t}</option>
                            ))}
                         </select>
                         <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none group-hover:text-white transition-colors" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 px-1">Variación</label>
                      <div className="flex bg-white/5 rounded-xl p-1 border border-white/10">
                        {['Short', 'Detailed', 'Creative'].map(v => (
                          <button
                            key={v}
                            onClick={() => setVariation(v)}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${variation === v ? 'bg-primary text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleOptimize}
                    disabled={isLoading}
                    className="w-full py-4 bg-gradient-to-r from-primary to-accent rounded-2xl font-bold text-white shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 overflow-hidden group"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Optimizando arquitectura...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        <span>Generar Megaprompt Pro</span>
                        <ArrowRight className="w-4 h-4 opacity-50 group-hover:translate-x-1 transition-all" />
                      </>
                    )}
                  </button>
                </motion.div>

                {/* History Section */}
                <AnimatePresence>
                  {history.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="glass-card rounded-3xl p-6 overflow-hidden"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold flex items-center gap-2">
                          <History className="w-4 h-4 text-accent" />
                          Historial Reciente
                        </h3>
                        <button onClick={clearHistory} className="text-gray-500 hover:text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-2">
                        {history.map((item) => (
                          <motion.div 
                            key={item.id}
                            layoutId={item.id}
                            onClick={() => setResult(item.result)}
                            className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-colors border border-white/5 group"
                          >
                            <span className="text-xs text-gray-400 truncate max-w-[200px]">{item.prompt}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] text-gray-600 font-mono">{item.date}</span>
                              <ArrowRight className="w-3 h-3 text-gray-700 group-hover:text-primary transition-colors" />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Right Column: Output & Ads */}
              <div className="lg:col-span-5 flex flex-col">
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex-1 glass-card rounded-3xl p-8 relative flex flex-col min-h-[500px]"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-accent" />
                      Resultado
                    </h2>
                    <button
                      onClick={handleCopy}
                      disabled={!result}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl glass-button text-xs font-bold disabled:opacity-30"
                    >
                      {isCopied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      {isCopied ? 'Copiado' : 'Copiar'}
                    </button>
                  </div>

                  <div className="flex-1 bg-black/40 rounded-2xl p-6 font-mono text-sm text-gray-300 leading-relaxed overflow-y-auto max-h-[600px] custom-scrollbar border border-white/5 relative">
                    {result ? (
                      <>
                        <div className="whitespace-pre-wrap">{result}</div>
                        {isLoading && <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />}
                        <div ref={resultEndRef} />
                        
                        {/* Feedback Overlay */}
                        {!isLoading && (
                          <div className="sticky bottom-0 mt-8 flex justify-center gap-4 py-4 bg-gradient-to-t from-black/80 to-transparent">
                            <button 
                              onClick={() => { setFeedback('up'); toast.success('¡Gracias por tu feedback!'); }}
                              className={`p-2 rounded-lg border transition-all ${feedback === 'up' ? 'bg-green-500/20 border-green-500/50 text-green-400' : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'}`}
                            >
                              <ThumbsUp className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => { setFeedback('down'); toast.error('Lamentamos que no sirviera.'); }}
                              className={`p-2 rounded-lg border transition-all ${feedback === 'down' ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'}`}
                            >
                              <ThumbsDown className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-gray-600 py-12">
                        <Loader2 className={`w-12 h-12 mb-4 opacity-20 ${isLoading ? 'animate-spin' : ''}`} />
                        <p className="text-sm font-medium opacity-50">Esperando instrucciones...</p>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Ad Container below output */}
                <AdContainer position="Sidebar" />
              </div>

            </div>

            {/* Bottom Ad Container */}
            <AdContainer position="Bottom" />

          </main>

          <footer className="py-12 px-6 glass-card border-x-0 border-b-0 text-center text-sm text-gray-500 mt-12">
             <div className="max-w-7xl mx-auto">
                <p className="mb-4">© {new Date().getFullYear()} InstantPrompt Professional. Powered by Groq Llama 3.3.</p>
                <div className="flex justify-center gap-8 text-[10px] font-bold uppercase tracking-[0.2em]">
                   <a href="#" className="hover:text-primary transition-colors">Privacidad</a>
                   <a href="#" className="hover:text-primary transition-colors">Términos</a>
                   <a href="#" className="hover:text-primary transition-colors">Contacto</a>
                </div>
             </div>
          </footer>
        </div>
      </ErrorBoundary>
    </HelmetProvider>
  );
}
