import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowUpRight, RotateCcw, Volume2, VolumeX, X } from 'lucide-react';
import WishWorld from './WishWorld';
import { releaseLantern } from './lanternFlights';
import type { LanternFlight } from './lanternFlights';
import './wish.css';

type Blessing = { title: string; message: string };
export default function WishExperience() {
  const [blessing, setBlessing] = useState<Blessing | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [wish, setWish] = useState('');
  const [lanterns, setLanterns] = useState<LanternFlight[]>([{ id: 1, releasedAt: null, wish: '' }]);
  const nextLanternId = useRef(2);
  const [releasedCount, setReleasedCount] = useState(0);
  const [followId, setFollowId] = useState<number | null>(null);
  const [homeRevision, setHomeRevision] = useState(0);
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [introStage, setIntroStage] = useState<'open' | 'leaving' | 'closed'>('open');
  const [sceneReady, setSceneReady] = useState(false);
  const [fontsReady, setFontsReady] = useState(false);
  const [sceneEntry, setSceneEntry] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [muted, setMuted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const introTitle = useRef<HTMLHeadingElement>(null);
  const intro = useRef<HTMLDialogElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const introOpen = introStage !== 'closed';
  const onReady = useCallback(() => setSceneReady(true), []);
  const retireLantern = useCallback((id: number) => {
    setLanterns(current => current.filter(lantern => lantern.id !== id));
  }, []);
  const returnHome = useCallback(() => { setFollowId(null); setHomeRevision(value => value + 1); }, []);
  const fadeIn = useCallback((audio: HTMLAudioElement, targetVolume = 0.45, duration = 1500) => {
    audio.loop = true;
    audio.volume = 0.05;
    audio.play().then(() => {
      setPlaying(true);
      const startTime = performance.now();
      const timer = window.setInterval(() => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(1, elapsed / duration);
        audio.volume = Math.max(0.05, progress * targetVolume);
        if (progress >= 1) window.clearInterval(timer);
      }, 50);
    }).catch(() => {});
  }, []);
  const toggleSound = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (muted || audio.paused) {
      setMuted(false);
      fadeIn(audio, 0.45, 800);
    } else {
      setMuted(true);
      setPlaying(false);
      audio.pause();
    }
  }, [muted, fadeIn]);
  const openWish = useCallback(() => {
    setBlessing(null); setFollowId(null); setHomeRevision(value => value + 1); setWish('');
    // Allocate a fresh object and id. Existing flights retain their original timestamps.
    const fresh: LanternFlight = { id: nextLanternId.current++, releasedAt: null, wish: '' };
    setLanterns(current => current.some(lantern => lantern.releasedAt === null) ? current : [...current, fresh]);
    setDialogOpen(true);
  }, []);
  const leaveIntro = () => {
    if (introStage !== 'open') return;
    setIntroStage('leaving');
    setSceneEntry(value => value + 1);
    if (!muted && audioRef.current) {
      fadeIn(audioRef.current, 0.45, 2000);
    }
  };
  useEffect(() => {
    let active = true;
    const ready = () => { if (active) setFontsReady(true); };
    const timeout = window.setTimeout(ready, 1500);
    void document.fonts.ready.then(ready);
    return () => { active = false; window.clearTimeout(timeout); };
  }, []);
  useEffect(() => {
    if (introStage === 'open') { intro.current?.showModal(); introTitle.current?.focus({ preventScroll: true }); }
    if (introStage === 'closed') intro.current?.close();
    if (introStage !== 'leaving') return;
    const timer = window.setTimeout(() => {
      intro.current?.close(); setIntroStage('closed');
    }, reduced ? 0 : 850);
    return () => window.clearTimeout(timer);
  }, [introStage, reduced]);
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    update(); media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (dialogOpen) { dialog.current?.showModal(); dialog.current?.querySelector('textarea')?.focus(); }
    else dialog.current?.close();
  }, [dialogOpen]);
  const send = (event: FormEvent) => {
    event.preventDefault();
    const held = lanterns.find(lantern => lantern.releasedAt === null);
    if (!wish.trim() || !held) return;
    const now = performance.now() / 1000;
    setLanterns(current => releaseLantern(current, held.id, wish.trim(), now));
    setDialogOpen(false); setBlessing(null); setReleasedCount(value => value + 1); setFollowId(held.id);
  };
  return <main className="wish-page">
    <div className="wish-canvas" aria-label="Cây đa trên cung trăng. Kéo để xoay, chạm đèn lồng để mở lời chúc, chạm đèn cô gái đang nâng để viết điều ước.">
      <WishWorld onRead={setBlessing} onWrite={openWish} lanterns={lanterns} followId={followId} homeRevision={homeRevision} onRetire={retireLantern} onReady={onReady} entry={sceneEntry} reduced={reduced} showerTrigger={releasedCount}/>
    </div>
    <dialog ref={intro} className={`moon-intro${sceneReady && fontsReady ? ' is-ready' : ''}${introStage === 'leaving' ? ' is-leaving' : ''}`} aria-labelledby="intro-title" onCancel={e => { e.preventDefault(); leaveIntro(); }}>
      <div className="intro-content">
        <div className="intro-moon" aria-hidden="true"/>
        <p className="intro-eyebrow">MỘT ĐÊM TRĂNG TRÒN</p>
        <h1 ref={introTitle} tabIndex={-1} id="intro-title">Có một mùa trăng,<br/>để nhớ về nhau.</h1>
        <p className="intro-meaning">Trung thu là lúc ta hướng về gia đình,<br className="intro-break"/> tìm lại niềm vui sum vầy và gửi trao yêu thương.</p>
        <p className="intro-invitation">Hãy viết một điều ước cho mình, cho người thương.<br className="intro-break"/> Để ánh đèn mang những mong lành lên trời.</p>
        <div className="intro-actions">
          <button className="intro-start" onClick={leaveIntro} disabled={introStage === 'leaving'}>Ngắm trăng <ArrowUpRight size={18}/></button>
        </div>
      </div>
    </dialog>
    {blessing && <aside className="blessing-card" role="status">
      <button className="icon-close" onClick={() => setBlessing(null)} aria-label="Đóng lời chúc"><X size={20}/></button>
      <h2>{blessing.title}</h2><p>{blessing.message}</p>
    </aside>}
    <dialog ref={dialog} className="wish-dialog" aria-labelledby="wish-title" onCancel={() => setDialogOpen(false)} onClick={e => { if(e.target === dialog.current) setDialogOpen(false); }}>
      <button className="icon-close" onClick={() => setDialogOpen(false)} aria-label="Đóng"><X size={20}/></button>
      <h2 id="wish-title">Điều ước của bạn</h2>
      <form onSubmit={send}>
        <label className="sr-only" htmlFor="wish-text">Viết điều ước</label>
        <textarea id="wish-text" value={wish} onChange={e => setWish(e.target.value)} maxLength={220} required rows={4} placeholder="Mong rằng…"/>
        <button className="release-button" type="submit" disabled={!wish.trim()}>Thả đèn <ArrowUpRight size={20}/></button>
      </form>
    </dialog>
    {!introOpen && releasedCount > 0 && !dialogOpen && !blessing && <div className="wish-actions">
      <button className="another-lantern" onClick={openWish}>Thả thêm lồng đèn <ArrowUpRight size={18}/></button>
      {followId !== null && <button className="reset-view" onClick={returnHome} aria-label="Trở lại cây đa"><RotateCcw size={20}/></button>}
    </div>}
    <audio ref={audioRef} src="/audio/bgm.mp3" loop preload="auto" />
    <button
      className="sound-toggle"
      onClick={toggleSound}
      aria-label={muted || !playing ? 'Bật nhạc nền' : 'Tắt nhạc nền'}
      aria-pressed={!muted && playing}
    >
      {muted || !playing ? <VolumeX size={18}/> : <Volume2 size={18}/>}
      <span className="sound-label">{muted || !playing ? 'Bật nhạc' : 'Nhạc nền'}</span>
    </button>
    <div className="sr-only" role="status">{releasedCount > 0 ? `Đã thả ${releasedCount} chiếc đèn. Mỗi chiếc đang mang một điều ước bay lên trời.` : ''}</div>
  </main>;
}
