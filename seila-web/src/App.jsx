import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Shirt, Volume2, VolumeX, Palette, X, Smartphone, Monitor, ArrowLeft, Gamepad2, Sparkles, User, Calendar, Coffee, Music, Paintbrush, Heart, Smile, BookHeart, Lock, Check, ShoppingBag, Coins as CoinIcon, Gift, LayoutGrid } from 'lucide-react';
import ChatBox from './components/ChatBox';

const themeColors = {
  indigo: { bg: 'bg-indigo-600', hover: 'hover:bg-indigo-500', text: 'text-indigo-400', border: 'border-indigo-500/30', borderSolid: 'border-indigo-400', glow: 'shadow-[0_0_30px_rgba(79,70,229,0.6)]' },
  rose: { bg: 'bg-rose-600', hover: 'hover:bg-rose-500', text: 'text-rose-400', border: 'border-rose-500/30', borderSolid: 'border-rose-400', glow: 'shadow-[0_0_30px_rgba(225,29,72,0.6)]' },
  emerald: { bg: 'bg-emerald-600', hover: 'hover:bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500/30', borderSolid: 'border-emerald-400', glow: 'shadow-[0_0_30px_rgba(5,150,105,0.6)]' },
  amber: { bg: 'bg-amber-600', hover: 'hover:bg-amber-500', text: 'text-amber-400', border: 'border-amber-500/30', borderSolid: 'border-amber-400', glow: 'shadow-[0_0_30px_rgba(217,119,6,0.6)]' },
  custom: { bg: 'bg-custom-main', hover: 'hover:bg-custom-hover', text: 'text-custom-main', border: 'border-custom-alpha', borderSolid: 'border-custom-main', glow: 'shadow-custom-glow' }
};

const particles = Array.from({ length: 35 }).map((_, i) => ({ id: i, size: Math.random() * 12 + 6, x: Math.random() * 100, y: Math.random() * 100, duration: Math.random() * 20 + 15, delay: Math.random() * 5 }));

const shopItems = [
  { id: 'cokelat', name: 'Cokelat Manis', icon: '🍫', price: 20, moodBonus: 3, desc: '+3 Mood Instan' },
  { id: 'kopi', name: 'Es Kopi Susu', icon: '☕', price: 45, moodBonus: 8, desc: '+8 Mood Instan' },
  { id: 'buku', name: 'Novel Fiksi', icon: '📖', price: 80, moodBonus: 15, desc: '+15 Mood Instan' },
  { id: 'palet', name: 'Palet Premium', icon: '🎨', price: 150, moodBonus: 30, desc: '+30 Mood Instan' },
];

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [uiColor, setUiColor] = useState('indigo');
  const [customHex, setCustomHex] = useState('#d946ef');
  const [outfit, setOutfit] = useState('kasual');
  const [isMuted, setIsMuted] = useState(false);
  const [viewMode, setViewMode] = useState('novel'); 

  // STATE UNTUK MENU HUB & SIDEBAR
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('settings'); 
  const [isHubOpen, setIsHubOpen] = useState(false);
  const [hubTab, setHubTab] = useState('profile'); 
  const [shopTab, setShopTab] = useState('beli'); 

  // CORE STATES (Termasuk Nama Pemain)
  const [playerName, setPlayerName] = useState(''); 
  const [moodScore, setMoodScore] = useState(30); 
  const [coins, setCoins] = useState(50); 
  const [inventory, setInventory] = useState([]);
  const [giftEvent, setGiftEvent] = useState(null); 
  const [hasNewDiary, setHasNewDiary] = useState(false); 
  const [diaryEntries, setDiaryEntries] = useState([]);

  // MINI GAME STATES
  const [activeGame, setActiveGame] = useState('menu'); 
  const [drawProgress, setDrawProgress] = useState(0);
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const hue = useRef(0);
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [solved, setSolved] = useState([]);
  const [moves, setMoves] = useState(0);

  const theme = themeColors[uiColor];
  const bgmRef = useRef(null);
  const sfxClick = useRef(null);
  const sfxPop = useRef(null);
  const sfxSuccess = useRef(null);
  const sfxCoin = useRef(null);
  const sfxWriting = useRef(null);

  // LOGIKA SAVE & LOAD PROGRESS
  useEffect(() => {
    const savedData = localStorage.getItem('seila_progress');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      if(parsed.playerName) setPlayerName(parsed.playerName);
      if(parsed.moodScore !== undefined) setMoodScore(parsed.moodScore);
      if(parsed.coins !== undefined) setCoins(parsed.coins);
      if(parsed.inventory) setInventory(parsed.inventory);
      if(parsed.outfit) setOutfit(parsed.outfit);
      if(parsed.diaryEntries && parsed.diaryEntries.length > 0) {
        setDiaryEntries(parsed.diaryEntries);
      } else {
        setDiaryEntries([{ id: 1, date: "Hari Pertama", text: `Akhirnya ngobrol lagi sama ${parsed.playerName || 'kamu'}. Rasanya kangen banget masa SMA dulu. Hehe.`, reqMood: 0 }]);
      }
      if(parsed.uiColor) setUiColor(parsed.uiColor);
      if(parsed.hasNewDiary !== undefined) setHasNewDiary(parsed.hasNewDiary);
    } else {
       // Set default diary pertama kali jika belum ada data
       setDiaryEntries([{ id: 1, date: "Hari Pertama", text: "Akhirnya ngobrol lagi sama teman lamaku. Rasanya kangen banget masa SMA dulu. Hehe.", reqMood: 0 }]);
    }
  }, []);

  useEffect(() => {
    // Jangan save jika belum memasukkan nama
    if (playerName) {
      const progress = { playerName, moodScore, coins, inventory, outfit, diaryEntries, uiColor, hasNewDiary };
      localStorage.setItem('seila_progress', JSON.stringify(progress));
    }
  }, [playerName, moodScore, coins, inventory, outfit, diaryEntries, uiColor, hasNewDiary]);

  // RESET DATA FUNCTION
  const handleResetData = () => {
    if (window.confirm('Yakin ingin menghapus semua progress dan mengulang dari awal?')) {
      localStorage.removeItem('seila_progress');
      window.location.reload(); // Refresh halaman agar state kembali ke awal
    }
  };

  useEffect(() => {
    bgmRef.current = new Audio('/bgm.mp3'); 
    sfxClick.current = new Audio('/click.mp3'); 
    sfxPop.current = new Audio('/pop.mp3');
    sfxSuccess.current = new Audio('/success.mp3');
    sfxCoin.current = new Audio('/coin.mp3');
    sfxWriting.current = new Audio('/writing.mp3');

    bgmRef.current.loop = true; bgmRef.current.volume = 0.3; 
    return () => { if (bgmRef.current) { bgmRef.current.pause(); bgmRef.current.src = ""; } };
  }, []);

  useEffect(() => { if (bgmRef.current) bgmRef.current.muted = isMuted; }, [isMuted]);

  const startGame = () => { 
    if(!playerName.trim()) return;
    
    // Perbarui entry diary pertama jika nama baru saja dimasukkan
    if (diaryEntries.length === 1 && diaryEntries[0].id === 1) {
       setDiaryEntries([{ id: 1, date: "Hari Pertama", text: `Akhirnya ngobrol lagi sama ${playerName}. Rasanya kangen banget masa SMA dulu. Hehe.`, reqMood: 0 }]);
    }
    
    setIsPlaying(true); 
    if (bgmRef.current) bgmRef.current.play().catch(e => console.log("BGM tertahan:", e)); 
  };
  
  const playSound = (soundName) => { 
    if (isMuted) return; 
    let audio;
    if (soundName === 'click') audio = sfxClick.current;
    else if (soundName === 'pop') audio = sfxPop.current;
    else if (soundName === 'success') audio = sfxSuccess.current;
    else if (soundName === 'coin') audio = sfxCoin.current;
    else if (soundName === 'writing') audio = sfxWriting.current;
    
    if (audio) { audio.currentTime = 0; audio.volume = 0.5; audio.play().catch(e => console.log("SFX tertahan:", e)); } 
  };

  const closeAllModals = () => { 
    setIsHubOpen(false); 
    setIsSidebarOpen(false); 
    setActiveGame('menu'); 
  };

  const buyItem = (item) => {
    if (coins >= item.price) {
      playSound('coin'); setCoins(c => c - item.price);
      setInventory(prev => [...prev, { ...item, uniqueId: Date.now() + Math.random() }]);
    }
  };

  const giveItem = (uniqueId, item) => {
    playSound('pop');
    setInventory(prev => prev.filter(i => i.uniqueId !== uniqueId));
    setMoodScore(prev => Math.min(100, prev + item.moodBonus));
    setGiftEvent({ text: `*${playerName} memberikan hadiah: ${item.name} ${item.icon}*`, id: Date.now() });
    setShopTab('beli');
    closeAllModals(); 
  };

  const handleNewDiaryEntry = (diaryText) => {
    setDiaryEntries(prev => {
      const nextId = prev.length + 1;
      
      // Ambil syarat mood dari catatan terakhir, lalu tambah 15 poin
      const lastReqMood = prev.length > 0 ? prev[prev.length - 1].reqMood : 0;
      let newReqMood = lastReqMood + 15; 
      
      // Batas maksimal kedekatan adalah 95% agar tetap bisa dibuka
      if (newReqMood > 95) newReqMood = 95; 
      
      const newEntry = { id: nextId, date: "Memori Baru ✨", text: diaryText, reqMood: newReqMood };
      return [...prev, newEntry];
    });
    setHasNewDiary(true);
  };

  const initCanvasGame = () => { playSound('click'); setDrawProgress(0); setActiveGame('canvas'); };
  
  useEffect(() => {
    if (activeGame === 'canvas' && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  }, [activeGame]);

  const getCoordinates = (e) => {
    if (e.touches && e.touches.length > 0) {
      const rect = canvasRef.current.getBoundingClientRect();
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
  };

  const startDrawing = (e) => { if (activeGame !== 'canvas') return; isDrawing.current = true; lastPos.current = getCoordinates(e); };
  const stopDrawing = () => { isDrawing.current = false; };
  const draw = (e) => {
    if (!isDrawing.current || drawProgress >= 100) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext('2d');
    const currentPos = getCoordinates(e);
    ctx.beginPath(); ctx.moveTo(lastPos.current.x, lastPos.current.y); ctx.lineTo(currentPos.x, currentPos.y);
    ctx.strokeStyle = `hsl(${hue.current}, 100%, 65%)`; ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.shadowBlur = 15; ctx.shadowColor = `hsl(${hue.current}, 100%, 65%)`; ctx.stroke();
    lastPos.current = currentPos; hue.current += 4;
    setDrawProgress(prev => {
      const next = prev + 0.5;
      if (next >= 100 && prev < 100) { setTimeout(() => { setMoodScore(m => Math.min(100, m + 2)); setCoins(c => c + 20); playSound('success'); setActiveGame('canvas-win'); }, 300); }
      return next;
    });
  };

  const initMemoryGame = () => {
    playSound('click');
    const icons = ['🎨', '☕', '🎧', '📖', '👗', '✨'];
    const shuffled = [...icons, ...icons].sort(() => Math.random() - 0.5).map((icon, id) => ({ id, icon }));
    setCards(shuffled); setFlipped([]); setSolved([]); setMoves(0); setActiveGame('memory');
  };

  const handleCardClick = (index) => {
    if (flipped.length >= 2 || flipped.includes(index) || solved.includes(index)) return;
    playSound('click');
    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);
    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      if (cards[newFlipped[0]].icon === cards[newFlipped[1]].icon) { setTimeout(() => { playSound('pop'); setSolved(s => [...s, newFlipped[0], newFlipped[1]]); setFlipped([]); }, 500);
      } else { setTimeout(() => setFlipped([]), 1000); }
    }
  };

  useEffect(() => {
    if (activeGame === 'memory' && solved.length === cards.length && cards.length > 0) {
      setTimeout(() => { setMoodScore(m => Math.min(100, m + 5)); setCoins(c => c + 30); playSound('success'); setActiveGame('memory-win'); }, 600);
    }
  }, [solved, activeGame, cards.length]);

  const isAnyOverlayOpen = isHubOpen;
  const staggerContainer = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const staggerItem = { hidden: { opacity: 0, x: -20, scale: 0.9 }, show: { opacity: 1, x: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 20 } } };

  return (
    <div className="h-screen w-full text-white overflow-hidden relative font-sans bg-slate-950">
      <style dangerouslySetInnerHTML={{__html: `.bg-custom-main { background-color: ${customHex}; } .hover\\:bg-custom-hover:hover { background-color: ${customHex}dd; } .text-custom-main { color: ${customHex}; } .border-custom-alpha { border-color: ${customHex}4d; } .border-custom-main { border-color: ${customHex}; } .shadow-custom-glow { box-shadow: 0 0 30px ${customHex}99; } @keyframes shimmer { 100% { transform: translateX(100%); } } .perspective-1000 { perspective: 1000px; } .preserve-3d { transform-style: preserve-3d; } .backface-hidden { backface-visibility: hidden; } .rotate-y-180 { transform: rotateY(180deg); }`}} />
      <div className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-1000" style={{ backgroundImage: "url('/bg-kampus.jpg')" }}>
        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] transition-all duration-1000" />
      </div>
      <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none mix-blend-screen">
        {particles.map((p) => (<motion.div key={p.id} className="absolute bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.9)]" style={{ width: p.size, height: p.size, left: `${p.x}vw`, top: `${p.y}vh` }} animate={{ y: [0, -200, 0], x: [0, Math.random() * 60 - 30, 0], opacity: [0, 0.7, 0] }} transition={{ duration: p.duration, repeat: Infinity, ease: "easeInOut", delay: p.delay }} />))}
      </div>
      
      <div className="absolute inset-0 z-20">
        <AnimatePresence mode="wait">
          {!isPlaying ? (
            <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }} transition={{ duration: 0.8 }} className="h-full flex flex-col items-center justify-center text-center p-4 relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[20vw] bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none" />
              <motion.div animate={{ y: [-10, 10, -10] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="relative z-10">
                <h1 className={`text-6xl md:text-8xl font-black tracking-tighter ${theme.text} mb-4 drop-shadow-[0_0_30px_rgba(255,255,255,0.15)]`}>SEILA TALITA</h1>
                <p className="text-lg md:text-2xl tracking-[0.4em] uppercase font-light text-slate-300 mb-12 opacity-80">Interactive Story</p>
              </motion.div>

              {/* FORM MAIN MENU & TOMBOL RESET */}
              <div className="z-10 bg-slate-900/50 backdrop-blur-xl p-6 sm:p-8 rounded-[2.5rem] border border-white/10 w-full max-w-md shadow-2xl flex flex-col items-center relative">
                <p className="text-slate-300 font-medium mb-3">Siapa namamu?</p>
                <input 
                  type="text" 
                  value={playerName} 
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 mb-6 outline-none focus:border-indigo-500 transition-all text-white text-center text-lg"
                  placeholder="Masukkan nama panggilan..."
                  maxLength={15}
                />
                
                <div className="flex flex-col w-full gap-3 mt-2">
                  <motion.button 
                    onClick={startGame} 
                    disabled={!playerName.trim()}
                    whileHover={{ scale: playerName.trim() ? 1.05 : 1 }} 
                    whileTap={{ scale: playerName.trim() ? 0.95 : 1 }} 
                    className={`w-full py-4 ${theme.bg} text-white font-bold rounded-2xl transition-all shadow-lg ${!playerName.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    MULAI CERITA
                  </motion.button>
                  
                  {localStorage.getItem('seila_progress') && (
                    <button 
                      onClick={handleResetData} 
                      className="text-xs text-rose-400 hover:text-rose-300 mt-3 font-bold uppercase tracking-wider transition-colors"
                    >
                      Reset Data Progress
                    </button>
                  )}
                </div>
              </div>

            </motion.div>
          ) : (
            <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="h-full w-full flex flex-col items-center relative">
              
              <div className="absolute top-6 left-6 z-50">
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => { playSound('click'); setIsPlaying(false); closeAllModals(); }} className={`p-3 rounded-full bg-slate-900/80 backdrop-blur-md shadow-lg border border-white/20 text-white hover:${theme.text} transition-colors`}><ArrowLeft size={20} /></motion.button>
              </div>

              {/* NAVIGASI KANAN ATAS YANG SUDAH DIRINGKAS */}
              <div className="absolute top-6 right-6 z-50 flex gap-2 sm:gap-3 items-center">
                <div className="flex gap-2 bg-slate-900/80 backdrop-blur-md px-3 sm:px-4 py-2 rounded-full border border-white/10 shadow-lg mr-1 sm:mr-2">
                  <div className="flex items-center gap-1.5" title="Suasana Hati Seila"><motion.div animate={{ scale: moodScore > 80 ? [1, 1.2, 1] : 1 }} transition={{ repeat: Infinity, duration: 0.8 }}><Heart size={16} className={moodScore > 70 ? 'text-rose-500 fill-rose-500' : moodScore > 40 ? 'text-amber-400' : 'text-slate-400'} /></motion.div><span className="text-sm font-bold w-7">{moodScore}</span></div>
                  <div className="w-px h-5 bg-white/20 mx-1"></div>
                  <div className="flex items-center gap-1.5" title="Koin Aria"><CoinIcon size={16} className="text-amber-400" /><span className="text-sm font-bold text-amber-400">{coins}</span></div>
                </div>
                
                {/* MENU HUB BUTTON */}
                <motion.button 
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} 
                  onClick={() => { playSound('click'); setIsSidebarOpen(false); setIsHubOpen(true); }} 
                  className={`p-3 rounded-full ${theme.bg} shadow-lg border border-white/10 relative`} title="Menu Hub">
                  <LayoutGrid size={18} />
                  {hasNewDiary && <span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span></span>}
                </motion.button>

                {/* SIDEBAR WARDROBE/SETTINGS BUTTON */}
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => { playSound('click'); setIsHubOpen(false); setIsSidebarOpen(true); setActiveTab('settings'); }} className={`p-3 rounded-full ${theme.bg} shadow-lg border border-white/10`} title="Pengaturan"><Settings size={18} /></motion.button>
              </div>

              <div className={`absolute inset-0 flex items-end justify-center pointer-events-none z-10 transition-all duration-1000 ${viewMode === 'chat' || isAnyOverlayOpen ? 'opacity-30 blur-md scale-105' : 'opacity-100 blur-0 scale-100'}`}>
                <AnimatePresence mode="wait"><motion.img key={outfit} src={`/seila-${outfit}.png`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, filter: 'blur(10px)' }} transition={{ duration: 0.6 }} className="h-[85vh] sm:h-[95vh] scale-100 object-cover object-[center_20%] sm:object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]" onError={(e) => { e.target.src = '/seila.png'; }} /></AnimatePresence>
              </div>

              <div className={`w-full h-full flex items-center justify-center p-4 md:p-10 pointer-events-none z-40 transition-opacity duration-500 ${isAnyOverlayOpen ? 'opacity-0' : 'opacity-100'}`}>
                <div className={`w-full transition-all duration-700 pointer-events-auto ${viewMode === 'chat' ? 'max-w-md h-full flex items-center mt-4' : 'max-w-5xl mt-auto'}`}>
                  {/* PASS PLAYER NAME KE CHATBOX */}
                  <ChatBox theme={theme} playSound={playSound} viewMode={viewMode} setMoodScore={setMoodScore} setCoins={setCoins} giftEvent={giftEvent} onNewDiaryEntry={handleNewDiaryEntry} playerName={playerName} />
                </div>
              </div>

              {/* UNIFIED MENU HUB OVERLAY */}
              <AnimatePresence>
                {isHubOpen && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[70] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md pointer-events-auto">
                    <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30, opacity: 0 }} className="relative w-full max-w-4xl bg-slate-900 border-2 border-slate-700 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col h-[85vh]">
                      
                      <button onClick={closeAllModals} className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 bg-slate-800 rounded-full hover:bg-rose-500 transition-colors z-50"><X size={20}/></button>

                      {/* TAB NAVIGATION HEADER */}
                      {activeGame === 'menu' && (
                        <div className="flex overflow-x-auto gap-2 p-3 sm:p-4 border-b border-slate-800 bg-slate-950/50 shrink-0 custom-scrollbar pr-16 sm:pr-4">
                          <button onClick={() => { playSound('click'); setHubTab('profile'); }} className={`px-4 py-2 sm:py-3 rounded-xl flex items-center gap-2 font-bold text-sm sm:text-base whitespace-nowrap transition-colors ${hubTab === 'profile' ? theme.bg : 'bg-slate-800 text-slate-400 hover:text-white'}`}><User size={18}/> Profil</button>
                          <button onClick={() => { playSound('click'); setHubTab('shop'); }} className={`px-4 py-2 sm:py-3 rounded-xl flex items-center gap-2 font-bold text-sm sm:text-base whitespace-nowrap transition-colors ${hubTab === 'shop' ? theme.bg : 'bg-slate-800 text-slate-400 hover:text-white'}`}><ShoppingBag size={18}/> Toko & Tas</button>
                          <button onClick={() => { playSound('writing'); setHubTab('diary'); setHasNewDiary(false); }} className={`px-4 py-2 sm:py-3 rounded-xl flex items-center gap-2 font-bold text-sm sm:text-base whitespace-nowrap transition-colors relative ${hubTab === 'diary' ? theme.bg : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
                            <BookHeart size={18}/> Catatan
                            {hasNewDiary && <span className="absolute top-2 right-2 flex h-2.5 w-2.5 rounded-full bg-rose-500"></span>}
                          </button>
                          <button onClick={() => { playSound('click'); setHubTab('arcade'); }} className={`px-4 py-2 sm:py-3 rounded-xl flex items-center gap-2 font-bold text-sm sm:text-base whitespace-nowrap transition-colors ${hubTab === 'arcade' ? theme.bg : 'bg-slate-800 text-slate-400 hover:text-white'}`}><Gamepad2 size={18}/> Arcade</button>
                        </div>
                      )}

                      {/* CONTENT AREA */}
                      <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar relative">
                        
                        {/* PROFIL TAB */}
                        {hubTab === 'profile' && (
                          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="flex flex-col gap-6 max-w-2xl mx-auto mt-4 sm:mt-8">
                            <motion.div variants={staggerItem} className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-white/10 pb-6">
                              <div className={`w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-slate-800 border-4 ${theme.borderSolid} overflow-hidden shadow-xl shrink-0`}><img src={`/seila-kasual.png`} alt="Profile" className="w-full h-full object-cover object-top scale-125" onError={(e) => { e.target.src = '/seila.png'; }} /></div>
                              <div className="text-center sm:text-left mt-2">
                                <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-1 flex items-center justify-center sm:justify-start gap-2">Seila Talita <Sparkles size={24} className={theme.text}/></h2>
                                <p className="text-slate-400 font-medium tracking-widest text-sm uppercase mt-2">Mahasiswi Seni Semester Akhir</p>
                                <div className="flex gap-4 mt-4 justify-center sm:justify-start">
                                  <span className="flex items-center gap-1.5 text-sm bg-white/5 px-3 py-1.5 rounded-full font-medium"><Calendar size={14} className={theme.text}/> 14 Maret</span>
                                  <span className="flex items-center gap-1.5 text-sm bg-white/5 px-3 py-1.5 rounded-full font-medium"><User size={14} className={theme.text}/> 20 Tahun</span>
                                </div>
                              </div>
                            </motion.div>
                            <motion.div variants={staggerItem} className="bg-white/5 rounded-2xl p-5 sm:p-6 border border-white/5"><p className="text-slate-200 leading-relaxed text-sm sm:text-base italic">"Mahasiswi tingkat akhir jurusan Seni yang kepalanya penuh revisian skripsi, tapi selalu punya energi ekstra buat tersenyum. Suka banget bercanda dan jadi moodbooster buat orang-orang di sekitarnya. Pantang menyerah walau kadang manja kalau lagi capek!"</p></motion.div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-8">
                              <motion.div variants={staggerItem}><h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Heart size={16} className="text-rose-400"/> Hobi Utama</h3><div className="flex flex-wrap gap-2"><span className="flex items-center gap-2 text-sm bg-rose-500/10 border border-rose-500/20 text-rose-300 px-3 py-2 rounded-xl"><Paintbrush size={14}/> Menggambar Sketsa</span><span className="flex items-center gap-2 text-sm bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-3 py-2 rounded-xl"><Coffee size={14}/> Ngopi di Cafe</span><span className="flex items-center gap-2 text-sm bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-3 py-2 rounded-xl"><Smile size={14}/> Bikin Cerita Pendek</span></div></motion.div>
                              <motion.div variants={staggerItem}><h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Sparkles size={16} className="text-amber-400"/> Hal Favorit</h3><div className="flex flex-wrap gap-2"><span className="flex items-center gap-2 text-sm bg-amber-500/10 border border-amber-500/20 text-amber-300 px-3 py-2 rounded-xl"><Shirt size={14}/> Baju Oversized</span><span className="flex items-center gap-2 text-sm bg-pink-500/10 border border-pink-500/20 text-pink-300 px-3 py-2 rounded-xl"><Music size={14}/> BGM Orkestra RPG</span></div></motion.div>
                            </div>
                          </motion.div>
                        )}

                        {/* TOKO TAB */}
                        {hubTab === 'shop' && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full">
                            <div className="flex justify-center mb-6">
                              <div className="bg-slate-800 p-1 rounded-full flex gap-1">
                                <button onClick={() => { playSound('click'); setShopTab('beli'); }} className={`px-6 py-2 sm:py-3 rounded-full text-sm font-bold transition-all ${shopTab === 'beli' ? theme.bg : 'text-slate-400 hover:text-white'}`}>Toko Hadiah</button>
                                <button onClick={() => { playSound('click'); setShopTab('tas'); }} className={`px-6 py-2 sm:py-3 rounded-full text-sm font-bold transition-all ${shopTab === 'tas' ? theme.bg : 'text-slate-400 hover:text-white'}`}>Tas {playerName} ({inventory.length})</button>
                              </div>
                            </div>
                            {shopTab === 'beli' && (
                              <div className="flex-1 pb-8">
                                <div className="flex justify-between items-center mb-4 px-2"><h3 className="font-bold text-slate-300">Daftar Barang</h3><div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1 rounded-full"><CoinIcon size={14} className="text-amber-400"/><span className="text-sm font-bold text-amber-400">{coins}</span></div></div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  {shopItems.map((item) => (
                                    <div key={item.id} className="bg-slate-800/50 border border-slate-700 p-4 rounded-2xl flex items-center justify-between">
                                      <div className="flex items-center gap-3"><div className="text-3xl bg-slate-800 p-3 rounded-xl">{item.icon}</div><div><h4 className="font-bold text-sm sm:text-base">{item.name}</h4><p className="text-xs text-emerald-400 mt-1">{item.desc}</p></div></div>
                                      <button onClick={() => buyItem(item)} disabled={coins < item.price} className={`px-3 py-2 rounded-xl text-sm font-bold transition-transform ${coins >= item.price ? 'bg-amber-500 hover:bg-amber-400 text-slate-900 active:scale-95' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}>{item.price} Koin</button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {shopTab === 'tas' && (
                              <div className="flex-1 pb-8">
                                <h3 className="font-bold text-slate-300 mb-4 px-2">Isi Tas Kamu</h3>
                                {inventory.length === 0 ? (
                                  <div className="flex flex-col items-center justify-center text-slate-500 mt-12"><ShoppingBag size={48} className="mb-4 opacity-50"/><p>Tasmu masih kosong.</p></div>
                                ) : (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {inventory.map((item) => (
                                      <div key={item.uniqueId} className="bg-slate-800 border border-slate-600 p-4 rounded-2xl flex items-center justify-between">
                                        <div className="flex items-center gap-3"><div className="text-3xl bg-slate-900 p-3 rounded-xl">{item.icon}</div><h4 className="font-bold text-sm sm:text-base">{item.name}</h4></div>
                                        <button onClick={() => giveItem(item.uniqueId, item)} className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold bg-rose-500 hover:bg-rose-400 text-white flex gap-1 items-center transition-transform active:scale-95`}><Gift size={14}/> Berikan</button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </motion.div>
                        )}

                        {/* DIARY TAB */}
                        {hubTab === 'diary' && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col pb-4">
                            <div className="relative w-full h-full bg-slate-100 rounded-[2rem] p-6 sm:p-10 shadow-inner text-slate-800 overflow-hidden flex flex-col min-h-[50vh]">
                              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/lined-paper.png')] opacity-50 pointer-events-none mix-blend-multiply" />
                              <div className="relative z-10 flex flex-col h-full">
                                <div className="text-center mb-6 border-b-2 border-slate-300 pb-4"><h2 className="text-2xl sm:text-3xl font-black font-serif tracking-tight text-slate-700 flex items-center justify-center gap-2"><BookHeart className="text-rose-400"/> Catatan Seila</h2><p className="text-slate-500 text-sm italic mt-1">"Tempat aku menyimpan memori penting kita..."</p></div>
                                <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                                  {diaryEntries.map((entry) => {
                                    const isUnlocked = moodScore >= entry.reqMood;
                                    return (
                                      <motion.div key={entry.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className={`p-5 rounded-2xl border-2 transition-all ${isUnlocked ? 'bg-white border-rose-200 shadow-sm' : 'bg-slate-200/50 border-slate-300 items-center justify-center flex flex-col py-8'}`}>
                                        {isUnlocked ? (<><div className="flex justify-between items-center mb-2"><span className="text-xs font-bold text-rose-400 bg-rose-50 px-2 py-1 rounded-md uppercase tracking-wider">{entry.date}</span><Heart size={14} className="text-rose-300 fill-rose-300"/></div><p className="text-slate-600 font-medium leading-relaxed font-serif text-base sm:text-lg">{entry.text}</p></>) : (<><Lock size={24} className="text-slate-400 mb-2" /><p className="text-sm font-bold text-slate-500">Memori Terkunci</p><p className="text-xs text-slate-400 mt-1">Butuh kedekatan {entry.reqMood}% untuk membuka</p></>)}
                                      </motion.div>
                                    )
                                  })}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {/* ARCADE TAB */}
                        {hubTab === 'arcade' && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col min-h-[50vh]">
                            {activeGame === 'menu' && (
                              <div className="flex-1 flex flex-col items-center justify-center relative z-20 mt-8 pb-8">
                                <Gamepad2 size={64} className={`${theme.text} mb-6`} /><h2 className="text-3xl sm:text-4xl font-black mb-2 text-center">Game Arcade</h2><p className="text-slate-300 mb-10 text-center max-w-md px-4">Menangkan permainan untuk mendapatkan Koin ekstra.</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg px-2">
                                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={initCanvasGame} className={`flex flex-col items-center p-6 bg-slate-800 border-2 border-slate-700 rounded-2xl hover:${theme.borderSolid} transition-colors group`}><Paintbrush size={40} className="text-slate-400 group-hover:text-white mb-3" /><h3 className="font-bold text-lg">Kanvas Ajaib</h3><p className="text-xs text-slate-400 text-center mt-2">Coret layar (Hadiah: +20 Koin)</p></motion.button>
                                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={initMemoryGame} className={`flex flex-col items-center p-6 bg-slate-800 border-2 border-slate-700 rounded-2xl hover:${theme.borderSolid} transition-colors group`}><div className="flex gap-1 mb-3"><div className="w-8 h-10 bg-slate-400 rounded-sm group-hover:bg-white rotate-[-10deg] transition-colors" /><div className="w-8 h-10 bg-slate-500 rounded-sm group-hover:bg-slate-200 rotate-[10deg] transition-colors" /></div><h3 className="font-bold text-lg">Kartu Memori</h3><p className="text-xs text-slate-400 text-center mt-2">Cocokkan kartu (Hadiah: +30 Koin)</p></motion.button>
                                </div>
                              </div>
                            )}
                            {activeGame === 'canvas' && (
                              <div className="flex-1 flex flex-col h-full w-full animate-in fade-in duration-500 min-h-[300px]">
                                <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-slate-300 flex items-center gap-2"><Sparkles size={16} className={theme.text}/> Kanvas Ajaib</h3><div className="w-1/2 bg-slate-800 h-4 rounded-full overflow-hidden border border-slate-700"><motion.div className={`h-full ${theme.bg}`} style={{ width: `${drawProgress}%` }} transition={{ ease: "easeOut" }} /></div></div>
                                <div className="flex-1 bg-slate-950 rounded-2xl border-2 border-slate-800 overflow-hidden relative cursor-crosshair shadow-inner"><canvas ref={canvasRef} width={800} height={500} className="w-full h-full touch-none" onPointerDown={startDrawing} onPointerMove={draw} onPointerUp={stopDrawing} onPointerLeave={stopDrawing} /></div>
                              </div>
                            )}
                            {activeGame === 'memory' && (
                              <div className="flex-1 flex flex-col h-full w-full animate-in fade-in duration-500 min-h-[300px]">
                                <div className="flex justify-between items-center mb-6"><h3 className="font-bold text-slate-300 flex items-center gap-2"><BookHeart size={16} className={theme.text}/> Ingatan Seila</h3><div className="px-4 py-1 bg-slate-800 rounded-full text-sm font-bold border border-slate-700">Langkah: {moves}</div></div>
                                <div className="flex-1 grid grid-cols-3 sm:grid-cols-4 gap-3 place-items-center content-center pb-4">
                                  {cards.map((card, index) => {
                                    const isFlipped = flipped.includes(index) || solved.includes(index);
                                    return (
                                      <motion.div key={index} onClick={() => handleCardClick(index)} className="w-16 h-24 sm:w-20 sm:h-28 perspective-1000 cursor-pointer"><motion.div animate={{ rotateY: isFlipped ? 180 : 0 }} transition={{ duration: 0.3, type: "spring", stiffness: 260, damping: 20 }} className="w-full h-full relative preserve-3d"><div className={`absolute inset-0 backface-hidden bg-slate-800 border-2 border-slate-600 rounded-xl flex items-center justify-center shadow-md`}><Sparkles size={20} className="text-slate-500 opacity-50"/></div><div className={`absolute inset-0 backface-hidden bg-slate-100 border-2 ${theme.borderSolid} rounded-xl flex items-center justify-center rotate-y-180 shadow-lg`}><span className="text-3xl sm:text-4xl drop-shadow-sm">{card.icon}</span>{solved.includes(index) && <div className="absolute top-1 right-1"><Check size={14} className="text-emerald-500"/></div>}</div></motion.div></motion.div>
                                    )
                                  })}
                                </div>
                              </div>
                            )}
                            {(activeGame === 'canvas-win' || activeGame === 'memory-win') && (
                              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex-1 flex flex-col items-center justify-center relative z-20 py-12">
                                <h2 className="text-3xl sm:text-4xl font-black text-amber-400 mb-4 drop-shadow-lg text-center">✨ Berhasil! ✨</h2><p className="text-base sm:text-lg text-slate-200 mb-8 text-center max-w-sm px-4">Menang game arcade! <br/><span className="text-amber-400 font-bold mt-2 inline-block bg-amber-500/20 px-3 py-1 rounded-full">+ {activeGame === 'memory-win' ? '30' : '20'} Koin</span></p>
                                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4"><button onClick={() => { playSound('click'); setActiveGame('menu'); }} className={`w-full sm:w-auto px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-full font-bold transition-transform`}>Main Lagi</button><button onClick={closeAllModals} className={`w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-full font-bold shadow-lg hover:scale-105 transition-transform`}>Kembali Mengobrol</button></div>
                              </motion.div>
                            )}
                          </motion.div>
                        )}
                        
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* SIDEBAR SETTINGS (Tetap Utuh untuk Wardrobe/Pengaturan) */}
              <AnimatePresence>
                {isSidebarOpen && (
                  <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="absolute top-0 right-0 h-full w-full sm:w-80 bg-slate-900/95 backdrop-blur-2xl z-[80] p-6 shadow-2xl flex flex-col pointer-events-auto border-l border-white/10">
                    <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                      <div className="flex gap-4">
                        <button onClick={() => { playSound('click'); setActiveTab('dress'); }} className={`text-lg font-bold uppercase tracking-wider transition-colors ${activeTab === 'dress' ? theme.text : 'text-slate-500 hover:text-white'}`}>Baju</button>
                        <button onClick={() => { playSound('click'); setActiveTab('settings'); }} className={`text-lg font-bold uppercase tracking-wider transition-colors ${activeTab === 'settings' ? theme.text : 'text-slate-500 hover:text-white'}`}>Setting</button>
                      </div>
                      <button onClick={closeAllModals} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"><X size={20} /></button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                      {activeTab === 'settings' && (
                        <div className="space-y-8 pb-8">
                          <div><h3 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-widest flex items-center gap-2"><Monitor size={14}/> Mode Interaksi</h3><div className="grid grid-cols-2 gap-2"><button onClick={() => { playSound('click'); setViewMode('novel'); }} className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${viewMode === 'novel' ? `${theme.bg} border-transparent shadow-lg` : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}><Monitor size={18} /> <span className="text-[10px] uppercase tracking-wider font-bold">Visual Novel</span></button><button onClick={() => { playSound('click'); setViewMode('chat'); }} className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${viewMode === 'chat' ? `${theme.bg} border-transparent shadow-lg` : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}><Smartphone size={18} /> <span className="text-[10px] uppercase tracking-wider font-bold">Chat HP</span></button></div></div>
                          <div><h3 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-widest flex items-center gap-2"><Palette size={14}/> Tema Warna</h3><div className="grid grid-cols-2 gap-2 mb-3">{[{ id: 'indigo', name: 'Biru' }, { id: 'rose', name: 'Merah' }, { id: 'emerald', name: 'Hijau' }, { id: 'amber', name: 'Emas' }].map((color) => (<button key={color.id} onClick={() => { playSound('click'); setUiColor(color.id); }} className={`p-2 rounded-xl border flex justify-center text-xs font-bold transition-all ${uiColor === color.id ? `${themeColors[color.id].bg} border-transparent shadow-lg text-white` : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}>{color.name}</button>))}</div><div className={`flex items-center justify-between p-3 rounded-xl border transition-all ${uiColor === 'custom' ? 'bg-white/10 border-white/30 shadow-lg' : 'bg-white/5 border-white/10'}`}><span className="text-xs font-bold text-slate-300">Warna Kustom</span><div className="relative w-8 h-8 rounded overflow-hidden cursor-pointer shadow-md border border-white/20"><input type="color" value={customHex} onChange={(e) => { setCustomHex(e.target.value); setUiColor('custom'); }} onClick={() => playSound('click')} className="absolute top-[-10px] left-[-10px] w-[50px] h-[50px] cursor-pointer" /></div></div></div>
                          <div><h3 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-widest flex items-center gap-2"><Volume2 size={14}/> Audio</h3><button onClick={() => { playSound('click'); setIsMuted(!isMuted); }} className={`w-full p-4 rounded-xl border flex justify-between items-center transition-all ${!isMuted ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/20 border-rose-500/30 text-rose-400'}`}><span className="font-bold text-sm">{isMuted ? 'Muted' : 'Sound On'}</span> {isMuted ? <VolumeX size={18}/> : <Volume2 size={18}/>}</button></div>
                        </div>
                      )}
                      {activeTab === 'dress' && (
                        <div className="grid grid-cols-1 gap-3 pb-8">
                          {['kasual', 'kampus', 'kencan', 'olahraga'].map(item => (<button key={item} onClick={() => { playSound('click'); setOutfit(item); }} className={`p-4 rounded-xl border capitalize font-semibold tracking-wide transition-all flex items-center justify-between ${outfit === item ? `${theme.bg} border-transparent shadow-lg` : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'}`}>{item} {outfit === item && <Shirt size={16} />}</button>))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}