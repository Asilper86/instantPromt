import React, { useState, useRef, useEffect } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Copy, Check, Sparkles, Loader2, ArrowRight, 
  History, Trash2, Shield, Globe, Mail, Info,
  Menu, X, ChevronDown, Zap, Lightbulb, BookOpen
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// --- Sub-components ---

const AdSlot = ({ type, id }) => {
  const configs = {
    header: "w-full h-[90px] md:h-[90px] sm:h-[50px] max-w-[728px] mx-auto",
    result: "w-full h-[250px] max-w-[300px] mx-auto",
    native: "w-full h-auto min-h-[150px] bg-white/5 border border-dashed border-white/20 rounded-xl"
  };

  return (
    <div className={`relative overflow-hidden flex items-center justify-center my-6 ${configs[type] || ''} glass-card rounded-xl`}>
      <div className="flex flex-col items-center opacity-40">
        <span className="text-[10px] uppercase tracking-widest mb-1">Publicidad</span>
        <div className="text-xs font-mono">[ AdSense ID: {id} ]</div>
      </div>
      {/* Background decoration for empty ad slots */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
    </div>
  );
};

const SectionTitle = ({ children, icon: Icon }) => (
  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
    {Icon && <Icon className="w-6 h-6 text-primary" />}
    {children}
  </h2>
);

// --- Main Application ---

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('Professional');
  const [variation, setVariation] = useState('Detailed');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const resultEndRef = useRef(null);

  // Load history
  useEffect(() => {
    const saved = localStorage.getItem('prompt_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  // Auto-scroll result
  useEffect(() => {
    if (resultEndRef.current) resultEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [result]);

  const handleOptimize = async () => {
    if (!prompt.trim()) {
      toast.error('Por favor, ingresa tu idea base.');
      return;
    }
    
    setIsLoading(true);
    setResult('');
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/api/optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, tone, variation })
      });
      
      if (!response.ok) throw new Error('Error al conectar con el motor de IA.');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let text = '';
      
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          text += chunk;
          setResult(prev => prev + chunk);
        }
      }
      
      // Save to history
      const newEntry = { id: Date.now(), prompt: prompt.substring(0, 40) + '...', result: text, date: new Date().toLocaleTimeString() };
      const newHistory = [newEntry, ...history].slice(0, 5);
      setHistory(newHistory);
      localStorage.setItem('prompt_history', JSON.stringify(newHistory));
      
      toast.success('Prompt optimizado');
    } catch (error) {
      toast.error(error.message);
      setResult("Error de conexión. Asegúrate de que el servidor esté activo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <HelmetProvider>
      <div className="min-h-screen bg-dark text-gray-100 selection:bg-primary/30">
        <Toaster position="bottom-center" />
        
        <Helmet>
          <title>InstantPrompt - Optimizador de Prompts Pro para AdSense</title>
          <meta name="description" content="La herramienta definitiva para ingenieros de prompts. Optimiza tus instrucciones para ChatGPT, Claude y Llama con IA avanzada." />
        </Helmet>

        {/* --- Header --- */}
        <header className="sticky top-0 z-50 glass-card border-x-0 border-t-0 backdrop-blur-2xl">
          <div className="max-w-7xl mx-auto px-6 h-16 md:h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
                <Zap className="w-6 h-6 text-primary fill-primary/20" />
              </div>
              <span className="text-xl md:text-2xl font-black tracking-tighter">Instant<span className="text-primary">Prompt</span></span>
            </div>

            <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
              <a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors">Cómo funciona</a>
              <a href="#features" className="text-gray-400 hover:text-white transition-colors">Guía Pro</a>
              <button className="px-5 py-2.5 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                Suscribirse
              </button>
            </nav>

            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-gray-400">
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </header>

        {/* --- Header Ad Slot --- */}
        <div className="px-6">
          <AdSlot type="header" id="top-banner" />
        </div>

        <main className="max-w-7xl mx-auto px-6 py-8 md:py-16">
          
          {/* Hero Section */}
          <div className="text-center mb-12 md:mb-20">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500"
            >
              Potencia tu IA al <span className="text-primary">Máximo.</span>
            </motion.h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Convierte ideas simples en instrucciones magistrales. Diseñado para creadores, desarrolladores y entusiastas de la IA.
            </p>
          </div>

          {/* Main Interaction Area */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mb-24">
            
            {/* Input Column */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="glass-card rounded-[2rem] p-6 md:p-8">
                <label className="block text-xs font-black text-primary uppercase tracking-[0.2em] mb-4">Idea Base</label>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ej: Escribe un artículo sobre energía solar..."
                  className="w-full h-48 md:h-64 bg-black/30 border border-white/5 rounded-2xl p-6 text-lg focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all resize-none mb-6 placeholder:text-gray-700"
                />

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">Tono</span>
                    <div className="relative">
                      <select 
                        value={tone} 
                        onChange={(e) => setTone(e.target.value)}
                        className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm appearance-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
                      >
                        <option value="Professional" className="bg-dark">Profesional</option>
                        <option value="Creative" className="bg-dark">Creativo</option>
                        <option value="Academic" className="bg-dark">Académico</option>
                        <option value="Technical" className="bg-dark">Técnico</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">Variación</span>
                    <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 h-12">
                      {['Short', 'Detailed'].map(v => (
                        <button 
                          key={v}
                          onClick={() => setVariation(v)}
                          className={`flex-1 rounded-lg text-xs font-bold transition-all ${variation === v ? 'bg-primary text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
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
                  className="w-full h-16 bg-primary rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-primary/30 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  {isLoading ? 'Optimizando...' : 'Generar Megaprompt'}
                </button>
              </div>

              {/* Small History (Desktop only) */}
              {history.length > 0 && (
                <div className="hidden lg:block glass-card rounded-3xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold flex items-center gap-2">
                      <History className="w-4 h-4 text-gray-500" /> Historial
                    </h3>
                    <button onClick={() => setHistory([])} className="text-xs text-gray-600 hover:text-red-400 transition-colors">Limpiar</button>
                  </div>
                  <div className="space-y-2">
                    {history.map(h => (
                      <div key={h.id} className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-gray-400 truncate cursor-pointer hover:bg-white/10 transition-colors">
                        {h.prompt}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Output Column */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col h-full"
            >
              <div className="flex-1 glass-card rounded-[2rem] p-6 md:p-8 flex flex-col min-h-[400px]">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm font-bold text-gray-400">Resultado IA</span>
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(result);
                      setIsCopied(true);
                      setTimeout(() => setIsCopied(false), 2000);
                      toast.success('Copiado');
                    }}
                    disabled={!result}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-xs font-bold hover:bg-white/10 transition-all disabled:opacity-20"
                  >
                    {isCopied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    {isCopied ? 'Copiado' : 'Copiar'}
                  </button>
                </div>

                <div className="flex-1 bg-black/40 rounded-2xl p-6 font-mono text-sm leading-relaxed text-blue-100 overflow-y-auto max-h-[500px] border border-white/5">
                  {result ? (
                    <div className="whitespace-pre-wrap">{result}</div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-20">
                      <Lightbulb className="w-12 h-12 mb-4" />
                      <p>El prompt optimizado aparecerá aquí...</p>
                    </div>
                  )}
                  <div ref={resultEndRef} />
                </div>
              </div>

              {/* Result Ad Slot */}
              <AdSlot type="result" id="result-sidebar" />
            </motion.div>

          </div>

          {/* --- SEO Content Section (AdSense Ready) --- */}
          <section id="how-it-works" className="py-20 border-t border-white/5">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-8 space-y-8">
                <SectionTitle icon={BookOpen}>Guía Maestra: ¿Cómo funciona InstantPrompt?</SectionTitle>
                
                <div className="prose prose-invert max-w-none text-gray-400 leading-relaxed space-y-6">
                  <p>
                    En la era de la Inteligencia Artificial generativa, la diferencia entre una respuesta mediocre y una obra maestra reside en el **Prompt Engineering**. No se trata solo de preguntar, sino de cómo estructuramos el contexto, el rol y las restricciones de la solicitud. **InstantPrompt** ha sido diseñado para cerrar esa brecha técnica, permitiendo a cualquier usuario generar instrucciones de alto nivel sin conocimientos previos de programación.
                  </p>

                  <h3 className="text-xl font-bold text-white mt-8 mb-4">1. El Poder de los Roles y el Contexto</h3>
                  <p>
                    Nuestra plataforma utiliza algoritmos de optimización basados en los modelos más avanzados de Llama 3 y Groq. Cuando ingresas una idea, nuestro motor no solo la reescribe; le asigna una **personalidad experta**. Si seleccionas el tono "Profesional", la IA asume el rol de un consultor senior; si eliges "Creativo", se transforma en un director de arte galardonado. Esto garantiza que la salida de modelos como ChatGPT sea mucho más precisa y alineada con tus objetivos.
                  </p>

                  <div className="bg-white/5 p-6 rounded-2xl border border-white/10 my-8">
                    <p className="italic">"Un buen prompt ahorra un 80% del tiempo de edición posterior. Es el lenguaje secreto para hablar con las máquinas."</p>
                  </div>

                  <h3 className="text-xl font-bold text-white mt-8 mb-4">2. Estructura y Variación</h3>
                  <p>
                    Ofrecemos dos tipos de variaciones principales: **Short** (para respuestas directas y rápidas) y **Detailed** (para proyectos complejos que requieren marcos lógicos, ejemplos y criterios de éxito). La versión detallada incluye automáticamente secciones de restricciones y formato de salida, algo que los ingenieros de prompts suelen tardar minutos en redactar manualmente.
                  </p>

                  <h3 className="text-xl font-bold text-white mt-8 mb-4">3. Optimización para SEO y AdSense</h3>
                  <p>
                    Esta herramienta no solo es útil para la IA, sino que está construida bajo los estándares de **Google AdSense**. Esto significa que priorizamos la velocidad de carga, la accesibilidad móvil y la legibilidad. Cada prompt generado sigue una jerarquía lógica que facilita que la IA entienda tus intenciones desde el primer token, reduciendo el consumo de recursos y mejorando la calidad del contenido final.
                  </p>
                </div>

                {/* Native Ad inside content */}
                <AdSlot type="native" id="native-content" />

                <div className="prose prose-invert max-w-none text-gray-400 leading-relaxed mt-12">
                  <p>
                    Ya sea que estés redactando correos electrónicos corporativos, creando guiones para YouTube o diseñando arquitecturas de software, **InstantPrompt** es tu compañero ideal. Nuestra misión es democratizar el acceso a la mejor ingeniería de prompts del mundo, de forma gratuita y accesible desde cualquier dispositivo móvil.
                  </p>
                </div>
              </div>

              {/* Features Sidebar */}
              <div className="lg:col-span-4 space-y-6">
                <div className="glass-card rounded-3xl p-8 sticky top-32">
                  <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-400" /> Beneficios Pro
                  </h4>
                  <ul className="space-y-4 text-sm">
                    {[
                      'Resultados instantáneos con Llama 3.3',
                      'Optimizado para GPT-4, Claude y Gemini',
                      'Sin necesidad de registro obligatorio',
                      'Modo oscuro nativo para baja fatiga visual',
                      'Estructura de ingeniería de prompts real',
                      'Acceso API para desarrolladores'
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                        <span className="text-gray-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

        </main>

        {/* --- Footer (Trust Signals) --- */}
        <footer className="bg-black/40 border-t border-white/5 py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
              <div className="md:col-span-1 space-y-4">
                <div className="flex items-center gap-2">
                   <Zap className="w-5 h-5 text-primary" />
                   <span className="text-xl font-bold">InstantPrompt</span>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">
                  La plataforma líder en optimización de prompts para profesionales. Creamos el puente entre tus ideas y la inteligencia artificial.
                </p>
              </div>
              
              <div>
                <h5 className="font-bold mb-6 text-sm uppercase tracking-widest text-gray-400">Herramienta</h5>
                <ul className="space-y-3 text-sm text-gray-500">
                  <li><a href="#" className="hover:text-primary transition-colors">Optimizar Prompt</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Historial</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Documentación API</a></li>
                </ul>
              </div>

              <div>
                <h5 className="font-bold mb-6 text-sm uppercase tracking-widest text-gray-400">Legal</h5>
                <ul className="space-y-3 text-sm text-gray-500">
                  <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Cookie Policy</a></li>
                </ul>
              </div>

              <div>
                <h5 className="font-bold mb-6 text-sm uppercase tracking-widest text-gray-400">Contacto</h5>
                <ul className="space-y-3 text-sm text-gray-500">
                  <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> support@instantprompt.ai</li>
                  <li className="flex items-center gap-2"><Globe className="w-4 h-4" /> Global Support</li>
                </ul>
              </div>
            </div>

            <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-mono text-gray-600 uppercase tracking-widest">
              <span>© {new Date().getFullYear()} InstantPrompt Pro. Todos los derechos reservados.</span>
              <div className="flex gap-6">
                <span>Versión 4.0.2</span>
                <span>AdSense Approved Layout</span>
              </div>
            </div>
          </div>
        </footer>

        {/* --- Mobile Menu Overlay --- */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              className="fixed inset-0 z-[100] bg-dark p-8 md:hidden"
            >
              <div className="flex justify-between items-center mb-12">
                <span className="text-xl font-bold">Menu</span>
                <button onClick={() => setIsMenuOpen(false)}><X /></button>
              </div>
              <div className="flex flex-col gap-8 text-2xl font-bold">
                <a href="#how-it-works" onClick={() => setIsMenuOpen(false)}>Cómo funciona</a>
                <a href="#features" onClick={() => setIsMenuOpen(false)}>Guía Pro</a>
                <a href="#" onClick={() => setIsMenuOpen(false)}>Legal</a>
                <button className="w-full py-4 bg-primary rounded-2xl text-lg">Empezar ahora</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </HelmetProvider>
  );
}
