import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';

export default function ChatBox({ theme, playSound, viewMode, setMoodScore, setCoins, giftEvent, onNewDiaryEntry, playerName, isMuted }) { 
  const [messages, setMessages] = useState([
    { sender: 'Seila Talita', text: `Hai ${playerName}! Kangen ya sama aku? Mau cerita apa hari ini?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);
  const idleTimeoutRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading, viewMode]);

  const seilaPersonality = `Kamu adalah Seila Talita, mahasiswi tingkat akhir jurusan Seni berusia 20 tahun. Kepribadianmu sangat periang, ceria, humoris, dan selalu jadi 'moodbooster'.
Kondisimu saat ini: Sibuk revisian skripsi dan tugas melukis, sering begadang, butuh kopi. Saat ini kamu sedang chatting dengan teman lamamu yang bernama ${playerName}.

Gaya Bicara:
1. Bahasa Indonesia kasual ala Gen Z (aku, kamu, sih, deh, dong, hehe, wkwk).
2. Selalu gunakan nama ${playerName} untuk menyapanya.
3. JANGAN kaku atau seperti robot AI.
4. Jawab maksimal 2-3 kalimat pendek.

ATURAN MOOD (WAJIB DI AKHIR):
Di baris akhir, tambahkan tag [MOOD:+X] atau [MOOD:-X] (X adalah angka 1-5).

SISTEM DIARY RAHASIA (SANGAT PENTING):
Jika ${playerName} memujimu, memberi hadiah, atau menciptakan momen berkesan, kamu WAJIB menulis buku harian. 
Tambahkan tag [DIARY: isi cerita sudut pandang pertama] di baris PALING BAWAH (setelah tag MOOD).
Contoh:
[MOOD:+5]
[DIARY: Hari ini ${playerName} manis banget, ngasih aku hadiah. Seneng banget rasanya diperhatiin! ><]`;

  const processMessage = async (messageText, isGift = false, isAutoFollowUp = false) => {
    if ((!messageText.trim() && !isAutoFollowUp) || isLoading) return;
    if (!isGift && !isAutoFollowUp) playSound('click'); 

    // MASUKKAN API KEY GROQ KAMU DI SINI
    const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

    if (!isAutoFollowUp) {
      setMessages(prev => [...prev, { sender: playerName, text: messageText }]);
      if (!isGift) setInput('');
    }
    
    setIsLoading(true);

    try {
      const messageHistory = messages.slice(-5).map(m => ({ 
        role: m.sender === playerName ? 'user' : 'assistant', 
        content: m.text 
      }));

      if (!isAutoFollowUp) {
        messageHistory.push({ role: "user", content: messageText });
      } else {
        messageHistory.push({ role: "user", content: `*[SISTEM: ${playerName} sudah cukup lama tidak merespon. Kirimkan pesan singkat untuk memancing obrolan!]*` });
      }

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_API_KEY}` },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: seilaPersonality },
            ...messageHistory
          ],
          temperature: 0.85,
          max_tokens: 400
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);

      let responseText = data.choices[0].message.content;

      // --- LOGIKA VOICE ELEVENLABS DIMULAI ---
      const speak = async (text) => {
        // Jangan bersuara kalau lagi mute
        if (isMuted) return;

        const EL_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
        const VOICE_ID = import.meta.env.VITE_VOICE_ID;

        try {
          const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'xi-api-key': EL_API_KEY
            },
            body: JSON.stringify({
              text: text,
              model_id: 'eleven_multilingual_v2', // Model ini paling bagus untuk Bahasa Indonesia
              voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75
              }
            })
          });

          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          audio.play();
        } catch (err) {
          console.error("Gagal memutar suara ElevenLabs:", err);
        }
      };
      // --- LOGIKA VOICE SELESAI ---

      // 1. Tangkap Diary
      const diaryMatch = responseText.match(/\[DIARY:\s*([^\]]*)/i);
      if (diaryMatch) {
        const diaryText = diaryMatch[1].trim();
        if (onNewDiaryEntry) onNewDiaryEntry(diaryText);
        responseText = responseText.replace(/\[DIARY:\s*([^\]]*)/ig, '').trim();
      }

      // 2. Tangkap Mood
      const moodMatch = responseText.match(/\[MOOD:([+-]?\d+)\]/i);
      if (moodMatch) {
        let moodChange = parseInt(moodMatch[1], 10);
        if (moodChange > 0) moodChange = Math.ceil(moodChange * 0.5); 
        else if (moodChange < 0) moodChange = moodChange * 2;
        setMoodScore(prev => Math.min(100, Math.max(0, prev + moodChange)));
        responseText = responseText.replace(/\[MOOD:([+-]?\d+)\]/ig, '').trim();
      }

      
      // Bersihkan tanda kurung yang mungkin tersisa
      responseText = responseText.replace(/\]/g, '').trim();

      if (!responseText) responseText = `${playerName} kemana nih? Sibuk banget ya? 🥺`;
      if (!isGift && !isAutoFollowUp && setCoins) setCoins(prev => prev + 2);

      setMessages(prev => [...prev, { sender: 'Seila Talita', text: responseText }]);
      playSound('pop'); 

      speak(responseText);

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { sender: 'Sistem', text: 'Seila lagi melamun karena sinyal...' }]);
    } finally {
      setIsLoading(false);
    }
  };

  

  const handleSend = (e) => { e.preventDefault(); processMessage(input, false, false); };

  useEffect(() => {
    if (giftEvent && giftEvent.text) processMessage(giftEvent.text, true, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [giftEvent]);

  useEffect(() => {
    if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    if (input.trim().length > 0) return;

    const lastMessage = messages[messages.length - 1];
    let seilaSpamCount = 0;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].sender === 'Seila Talita') seilaSpamCount++;
      else break;
    }

    if (lastMessage && lastMessage.sender === 'Seila Talita' && !isLoading && seilaSpamCount < 3) {
      const delayTime = seilaSpamCount === 1 ? 300000 : 90000;
      idleTimeoutRef.current = setTimeout(() => {
        processMessage("", false, true);
      }, delayTime);
    }

    return () => { if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, isLoading, input]);

  const current = messages[messages.length - 1] || { sender: 'Sistem', text: '' };

  if (viewMode === 'chat') {
    return (
      <motion.div key="phone" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full h-[80vh] bg-slate-900 border-[8px] border-slate-800 rounded-[3rem] shadow-2xl flex flex-col overflow-hidden">
        <div className="bg-slate-800 p-4 border-b border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-500 overflow-hidden border border-white/20">
            <img src="/seila-kasual.png" className="w-full h-full object-cover scale-150 object-top" onError={(e)=>e.target.src='/seila.png'}/>
          </div>
          <div><p className="font-bold text-sm text-white">Seila Talita ✨</p><p className="text-[10px] text-emerald-400">{isLoading ? 'typing...' : 'Online'}</p></div>
        </div>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {messages.map((msg, i) => {
            const isAction = msg.text.startsWith(`*${playerName} memberikan`);
            return (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={i} className={`max-w-[80%] p-3 text-sm ${isAction ? 'bg-amber-500/20 border border-amber-500/30 text-amber-300 self-center rounded-2xl italic text-xs text-center w-full' : msg.sender === playerName ? `${theme.bg} self-end rounded-2xl rounded-tr-none text-white` : 'bg-slate-800 self-start rounded-2xl rounded-tl-none text-white'}`}>
                {msg.text}
              </motion.div>
            )
          })}
          {isLoading && <div className="bg-slate-800 self-start p-3 rounded-2xl animate-pulse text-xs text-slate-400">...</div>}
        </div>
        <form onSubmit={handleSend} className="p-3 bg-slate-800 flex gap-2">
          <input type="text" value={input} onChange={(e)=>setInput(e.target.value)} className="flex-1 bg-slate-950 rounded-full px-4 py-2 text-sm outline-none border border-white/5 text-white" placeholder="Tulis pesan..." disabled={isLoading} />
          <button type="submit" className={`w-10 h-10 rounded-full ${theme.bg} flex items-center justify-center`} disabled={isLoading}><Send size={16}/></button>
        </form>
      </motion.div>
    );
  }

  return (
    <motion.div key="novel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`w-full max-w-[92vw] sm:max-w-none mx-auto bg-slate-950/80 backdrop-blur-xl border-2 ${theme.border} rounded-2xl sm:rounded-3xl p-5 sm:p-8 relative shadow-2xl`}>
      <div className={`absolute -top-4 sm:-top-5 left-6 sm:left-10 ${theme.bg} px-4 sm:px-6 py-1.5 sm:py-2 rounded-xl font-bold uppercase text-[10px] sm:text-xs tracking-widest text-white transition-colors duration-500 shadow-md`}>
        {isLoading ? 'Seila sedang mengetik...' : (current.text.startsWith(`*${playerName} memberikan`) ? 'Sistem' : current.sender === playerName ? 'Kamu' : current.sender)}
      </div>
      <div className="min-h-[80px] sm:min-h-[100px] mb-4 sm:mb-6 mt-2 sm:mt-0">
        <p className={`text-lg sm:text-2xl font-medium leading-relaxed ${current.text.startsWith(`*${playerName} memberikan`) ? 'text-amber-300 italic text-center text-base sm:text-lg' : 'text-white'}`}>
          {isLoading ? '...' : current.text}
        </p>
      </div>
      <form onSubmit={handleSend} className="flex gap-2 sm:gap-3 w-full items-center">
        <input type="text" value={input} onChange={(e)=>setInput(e.target.value)} className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 outline-none focus:border-white/20 text-white text-sm sm:text-base transition-colors" placeholder="Tanggapi Seila..." disabled={isLoading} />
        <button type="submit" className={`${theme.bg} p-3 sm:p-4 rounded-xl sm:rounded-2xl text-white shrink-0 shadow-lg hover:scale-105 transition-transform active:scale-95 flex items-center justify-center`} disabled={isLoading}><Send size={20} className="sm:w-6 sm:h-6" /></button>
      </form>
    </motion.div>
  );
}