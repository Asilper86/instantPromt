import React, { useState, useRef, useEffect } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Copy, Check, Sparkles, Loader2, ArrowRight, 
  History, Trash2, Zap, ChevronDown, Type,
  Shield, Globe, Mail, BookOpen, Info
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// --- Sub-components ---

const AdSlot = ({ position }) => {
  // Configuración de tamaños para AdSense y evitar CLS
  const heights = {
    "Header": "h-[90px] md:h-[90px] sm:h-[50px]",
    "Sidebar": "h-[250px]",
    "Content": "h-auto min-h-[120px]"
  };

  return (
    <div className={`w-full my-6 flex items-center justify-center glass-card rounded-2xl overflow-hidden border border-white/5 relative ${heights[position]}`}>
      <div className="flex flex-col items-center opacity-30">
        <span className="text-[10px] uppercase tracking-[0.2em] mb-2">Publicidad</span>
        <div className="text-gray-500 font-mono text-[10px]">[ AdSense Placeholder: {position} ]</div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
    </div>
  );
};

const ErrorBoundary = ({ children }) => {
  try { return children; } catch (e) { return <div className="p-8 text-center text-red-500">Error en el componente</div>; }
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
  const [feedback, setFeedback] = useState(null);

  const resultEndRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('prompt_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (resultEndRef.current) resultEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [result]);

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
      if (!response.ok) throw new Error('Error de conectividad con el servidor.');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
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
      const entry = { id: Date.now(), prompt: prompt.substring(0, 50) + '...', result: fullText, date: new Date().toLocaleTimeString() };
      setHistory(prev => {
        const updated = [entry, ...prev].slice(0, 5);
        localStorage.setItem('prompt_history', JSON.stringify(updated));
        return updated;
      });
      toast.success('¡Optimizado con éxito!');
    } catch (error) {
      toast.error(error.message);
      setResult("### [ERROR]\nNo se pudo conectar con el servidor. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <HelmetProvider>
      <div className="min-h-screen bg-dark text-gray-100 selection:bg-primary/30 relative overflow-hidden font-sans">
        <Toaster position="top-right" />
        
        {/* Animated Background Orbs (Diseño Original) */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

        <Helmet>
          <title>{prompt ? `Optimizar: ${prompt.substring(0, 20)}...` : 'InstantPrompt - Optimizer Profesional'}</title>
          <meta name="description" content="La herramienta definitiva para ingenieros de prompts. Optimización instantánea con IA avanzada para AdSense." />
        </Helmet>

        <header className="glass-card border-x-0 border-t-0 py-4 px-6 relative z-10">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-primary fill-primary/20" />
              <span className="text-xl font-bold tracking-tight">Instant<span className="text-primary">Prompt</span></span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-400">
              <a href="#how-to" className="hover:text-white transition-colors">Cómo funciona</a>
              <a href="#docs" className="hover:text-white transition-colors">Documentación</a>
              <button className="px-4 py-2 bg-white/5 rounded-lg glass-button">Login</button>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-12 relative z-10">
          
          {/* AdSense Top Banner */}
          <AdSlot position="Header" />

          {/* Hero Section (Texto Original Restaurado) */}
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

          {/* Interface Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">
            
            {/* Input Column */}
            <div className="lg:col-span-7 space-y-6">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-card rounded-3xl p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <Type className="w-5 h-5 text-primary" /> Entrada
                  </h2>
                </div>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe lo que quieres que la IA haga..."
                  className="w-full h-48 bg-black/20 border border-white/5 rounded-2xl p-6 text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all resize-none mb-6 placeholder-gray-600 shadow-inner"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Tono del Experto</label>
                    <select 
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm appearance-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
                    >
                      {['Professional', 'Creative', 'Technical', 'Academic'].map(t => <option key={t} value={t} className="bg-dark">{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Variación</label>
                    <div className="flex bg-white/5 rounded-xl p-1 border border-white/10 h-12">
                      {['Short', 'Detailed'].map(v => (
                        <button key={v} onClick={() => setVariation(v)} className={`flex-1 text-xs font-bold rounded-lg transition-all ${variation === v ? 'bg-primary text-white' : 'text-gray-500'}`}>{v}</button>
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleOptimize}
                  disabled={isLoading}
                  className="w-full h-16 bg-gradient-to-r from-primary to-accent rounded-2xl font-bold text-white shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  {isLoading ? 'Optimizando arquitectura...' : 'Generar Megaprompt Pro'}
                </button>
              </motion.div>

              {/* History */}
              {history.length > 0 && (
                <div className="glass-card rounded-3xl p-6 overflow-hidden">
                  <h3 className="text-sm font-bold flex items-center gap-2 mb-4"><History className="w-4 h-4 text-accent" /> Historial</h3>
                  <div className="space-y-2">
                    {history.map(item => (
                      <div key={item.id} onClick={() => setResult(item.result)} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-colors border border-white/5 text-xs text-gray-400 truncate">
                        {item.prompt}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Output Column */}
            <div className="lg:col-span-5 flex flex-col">
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 glass-card rounded-3xl p-8 flex flex-col min-h-[500px]">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold flex items-center gap-2"><Sparkles className="w-5 h-5 text-accent" /> Resultado</h2>
                  <button
                    onClick={() => { navigator.clipboard.writeText(result); setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); toast.success('Copiado'); }}
                    disabled={!result}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-xs font-bold"
                  >
                    {isCopied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    {isCopied ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
                <div className="flex-1 bg-black/40 rounded-2xl p-6 font-mono text-sm text-gray-300 overflow-y-auto max-h-[600px] border border-white/5 relative">
                  {result ? <div className="whitespace-pre-wrap">{result}</div> : <div className="h-full flex items-center justify-center opacity-20 text-xs">Esperando instrucciones...</div>}
                  <div ref={resultEndRef} />
                </div>
              </motion.div>
              {/* Sidebar Ad Container */}
              <AdSlot position="Sidebar" />
            </div>
          </div>

          {/* --- SECCIÓN SEO PARA ADSENSE (NUEVA PERO INTEGRADA CON EL DISEÑO VIEJO) --- */}
          <section id="how-to" className="py-20 border-t border-white/5">
            <div className="max-w-4xl mx-auto space-y-12">
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold flex items-center justify-center gap-3">
                  <BookOpen className="text-primary" /> ¿Cómo usar InstantPrompt?
                </h2>
                <p className="text-gray-400">Guía definitiva para dominar la ingeniería de prompts en 2026.</p>
              </div>

              <div className="prose prose-invert max-w-none text-gray-400 space-y-8 leading-relaxed">
                <p>
                  El éxito con herramientas de IA como ChatGPT, Claude o Llama no depende de la herramienta en sí, sino de la calidad de las instrucciones que recibe. Esto es lo que conocemos como **Prompt Engineering**. **InstantPrompt** simplifica este proceso técnico convirtiendo ideas mundanas en estructuras de comando profesionales.
                </p>

                <div className="grid md:grid-cols-2 gap-8 my-12">
                  <div className="glass-card p-6 rounded-2xl border border-white/5">
                    <h4 className="text-white font-bold mb-2">Paso 1: La Idea</h4>
                    <p className="text-sm">Introduce tu solicitud básica. No te preocupes por el formato, nosotros nos encargamos del resto.</p>
                  </div>
                  <div className="glass-card p-6 rounded-2xl border border-white/5">
                    <h4 className="text-white font-bold mb-2">Paso 2: El Contexto</h4>
                    <p className="text-sm">Selecciona el tono (Profesional, Creativo, etc.) para que la IA asuma un rol experto específico.</p>
                  </div>
                </div>

                {/* Content Ad Slot */}
                <AdSlot position="Content" />

                <h3 className="text-xl font-bold text-white">¿Por qué usar un optimizador de prompts?</h3>
                <p>
                  Un prompt optimizado incluye automáticamente **contexto, restricciones y criterios de éxito**. Al usar InstantPrompt, te aseguras de que la IA no pierda el hilo de la conversación y entregue resultados útiles desde el primer intento, ahorrándote horas de corrección manual.
                </p>
                <p>
                  Nuestra tecnología utiliza modelos de **Groq Llama 3.3** para garantizar que la reescritura sea coherente y siga los estándares más altos de la industria del software y marketing digital.
                </p>
              </div>
            </div>
          </section>

        </main>

        <footer className="py-12 px-6 glass-card border-x-0 border-b-0 text-center text-sm text-gray-500 mt-12 relative z-10">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-wrap justify-center gap-8 text-[10px] font-bold uppercase tracking-[0.2em]">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-primary transition-colors">About Us</a>
              <a href="#" className="hover:text-primary transition-colors">Contact</a>
            </div>
            <p>© {new Date().getFullYear()} InstantPrompt Professional. Powered by Groq Llama 3.3.</p>
          </div>
        </footer>
      </div>
    </HelmetProvider>
  );
}
