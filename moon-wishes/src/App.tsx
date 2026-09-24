import React, { Component, useEffect, useRef, useState } from 'react';

import { flushSync } from 'react-dom';
import { ArrowUpRight, ArrowRight, Check, Moon, Volume2, VolumeX, RotateCcw, X, Sparkles, MoveHorizontal } from 'lucide-react';
import Scene from './Scene';
import './style.css';

const colors=[{name:'Nắng thu',hex:'#ffbd6b'},{name:'Đỏ đoàn viên',hex:'#ec826b'},{name:'Xanh bình an',hex:'#82bfb1'}];
class SceneBoundary extends Component<{children:React.ReactNode},{failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return {failed:true}}render(){return this.state.failed?<div className="scene-fallback"><Moon size={100}/><p>Đêm trăng vẫn ở đây.</p><span>Thiết bị này chưa mở được cảnh 3D. Bạn vẫn có thể viết lời chúc bên dưới.</span></div>:this.props.children}}

export default function App(){
 const [color,setColor]=useState(0),[open,setOpen]=useState(false),[wish,setWish]=useState(''),[name,setName]=useState(''),[released,setReleased]=useState(0),[sent,setSent]=useState(false),[muted,setMuted]=useState(true),[reduced,setReduced]=useState(false);
 const dialog=useRef<HTMLDialogElement>(null), audio=useRef<AudioContext|null>(null),timer=useRef<number|undefined>(undefined),closeTimer=useRef<number|undefined>(undefined);
 useEffect(()=>{const media=matchMedia('(prefers-reduced-motion: reduce)');setReduced(media.matches);const update=()=>setReduced(media.matches);media.addEventListener('change',update);return()=>media.removeEventListener('change',update)},[]);
 useEffect(()=>{if(open)dialog.current?.showModal();else dialog.current?.close()},[open]);
 useEffect(()=>()=>{window.clearInterval(timer.current);window.clearTimeout(closeTimer.current);void audio.current?.close()},[]);
 useEffect(()=>{
  const context=(document as Document & {modelContext?:{registerTool:(tool:unknown,options:{signal:AbortSignal})=>void|Promise<void>}}).modelContext;
  if(!context?.registerTool)return;
  const lifecycle=new AbortController();
  const tool={name:'prepare_moon_wish',title:'Soạn điều ước Trung thu',description:'Chọn màu đèn và soạn điều ước trong hộp thoại để người dùng xem lại. Chưa thả đèn và không lưu hay gửi dữ liệu lên máy chủ.',inputSchema:{type:'object',properties:{wish:{type:'string',minLength:1,maxLength:240},name:{type:'string',maxLength:40},color:{type:'string',enum:colors.map(c=>c.name)}},required:['wish'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:true},execute:(input:unknown)=>{
   const value=input as {wish?:unknown;name?:unknown;color?:unknown};
   if(!value||typeof value.wish!=='string'||!value.wish.trim()||value.wish.length>240)throw new Error('Điều ước cần từ 1 đến 240 ký tự.');
   if(value.name!==undefined&&(typeof value.name!=='string'||value.name.length>40))throw new Error('Tên không được quá 40 ký tự.');
   const selected=value.color===undefined?0:colors.findIndex(c=>c.name===value.color);
   if(selected<0)throw new Error('Màu đèn không hợp lệ.');
   flushSync(()=>{setWish(value.wish as string);setName((value.name as string)??'');setColor(selected);setSent(false);setReleased(0);setOpen(true)});
   return {status:'prepared',color:colors[selected].name,awaitingUserRelease:true};
  }};
  try{void Promise.resolve(context.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{/* Optional browser capability. */}
  return()=>lifecycle.abort();
 },[]);
 const playNote=(ctx:AudioContext,freq:number,delay=0)=>{const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type='sine';osc.frequency.value=freq;gain.gain.setValueAtTime(0,ctx.currentTime+delay);gain.gain.linearRampToValueAtTime(.045,ctx.currentTime+delay+.04);gain.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+delay+3);osc.connect(gain);gain.connect(ctx.destination);osc.start(ctx.currentTime+delay);osc.stop(ctx.currentTime+delay+3.1)};
 const toggleSound=async()=>{if(!muted){window.clearInterval(timer.current);await audio.current?.suspend();setMuted(true);return;}const ctx=audio.current??new AudioContext();audio.current=ctx;await ctx.resume();[523.25,659.25,783.99].forEach((f,i)=>playNote(ctx,f,i*.5));timer.current=window.setInterval(()=>playNote(ctx,[261.63,329.63,392,523.25,659.25][Math.floor(Math.random()*5)]),1800);setMuted(false)};
 const release=()=>{if(!wish.trim())return;setOpen(false);setReleased(v=>v+1);setSent(true);if(audio.current&&!muted)[523.25,659.25,783.99,1046.5].forEach((f,i)=>playNote(audio.current!,f,i*.3));};
 const reset=()=>{setSent(false);setWish('');setName('');setReleased(0);setOpen(true)};
 return <main className="experience">
  <div className="ambient"/>
  <header><a className="brand" href="./" aria-label="Đêm rằm — Trang chủ"><span className="brand-mark"><Moon size={24}/></span><span>đêm rằm<span className="brand-caption">MỘT MÙA TRĂNG, VẠN ĐIỀU THƯƠNG</span></span></a><div className="header-right"><nav className="concept-links" aria-label="Các concept Trung thu"><a href="/tiem-banh/">Tiệm bánh</a><a href="/hai-nguoi/">Hai người</a></nav><span className="edition">TRUNG THU <span>2026</span></span><button className="sound-button" onClick={()=>void toggleSound()} aria-label={muted?'Bật âm thanh':'Tắt âm thanh'} aria-pressed={!muted}>{muted?<VolumeX size={18}/>:<Volume2 size={18}/>}<span>{muted?'Bật âm thanh':'Đang nghe'}</span></button></div></header>
  <div className="scene" aria-label="Sân vườn Trung thu 3D, có thể kéo để đổi góc nhìn"><SceneBoundary><Scene color={colors[color].hex} released={released} reduced={reduced}/></SceneBoundary></div>
  <section className="intro">
   <div className="eyebrow"><span/>ĐÊM RẰM THÁNG TÁM</div>
   <h1>Gửi trăng<br/>một <em>điều ước.</em></h1>
   <p className="intro-copy">Có những điều chưa kịp nói.<br/>Đêm nay, nhờ ánh trăng gửi hộ bạn.</p>
   <div className="choose"><span className="label">CHỌN SẮC ĐÈN CỦA BẠN</span><div className="color-row"><div className="swatches" role="group" aria-label="Màu đèn lồng">{colors.map((c,i)=><button key={c.name} className={`swatch ${color===i?'selected':''}`} style={{'--swatch':c.hex} as React.CSSProperties} onClick={()=>setColor(i)} aria-label={c.name} aria-pressed={color===i}>{color===i&&<Check size={17}/>}</button>)}</div><span className="color-name">{colors[color].name}</span></div></div>
   <button className="primary" onClick={()=>sent?reset():setOpen(true)}>{sent?'Gửi thêm một điều ước':'Viết điều ước của bạn'}{sent?<RotateCcw size={18}/>:<ArrowUpRight size={21}/>}</button>
   <p className="quiet-note">Một chiếc đèn nhỏ. Một tấm lòng thật lớn.</p>
  </section>
  <div className="scene-caption"><span className="caption-line"/><span>Chậm lại một chút.<br/><strong>Trăng vẫn đang chờ.</strong></span></div>
  <div className="orbit-hint"><MoveHorizontal size={17}/><span>Kéo nhẹ để ngắm đêm trăng</span></div>
  <footer><span className="footer-note">Dành cho những người ta thương.</span><div className="steps"><span className={!sent?'active':''}><b>01</b> Chọn đèn</span><i/><span className={open?'active':''}><b>02</b> Gửi lời thương</span><i/><span className={sent?'active':''}><b>03</b> Chạm tới trăng</span></div><span className="footer-moon">15 <span>/</span> 08 <Moon size={15}/></span></footer>
  <dialog ref={dialog} aria-labelledby="wish-title" onCancel={()=>setOpen(false)} onClick={e=>{if(e.target===dialog.current)setOpen(false)}} className="wish-dialog"><button className="close" onClick={()=>setOpen(false)} aria-label="Đóng"><X size={20}/></button><div className="dialog-icon"><Sparkles size={26}/></div><span className="eyebrow">MỘT LỜI NHẮN GỬI LÊN TRĂNG</span><h2 id="wish-title">Bạn đang ước điều gì?</h2><p>Cho bản thân, cho người thương, hay một người đang ở thật xa.</p><form onSubmit={e=>{e.preventDefault();release()}}><label htmlFor="sender">Tên của bạn <span>(không bắt buộc)</span></label><input id="sender" value={name} onChange={e=>setName(e.target.value)} placeholder="Để trăng biết bạn là ai" maxLength={40}/><label htmlFor="wish">Điều ước của bạn</label><textarea id="wish" autoFocus value={wish} onChange={e=>setWish(e.target.value)} placeholder="Mong rằng mùa trăng này…" maxLength={240} required rows={4}/><div className="field-foot"><span>Lời nhắn chỉ ở trong đêm trăng này.</span><span>{wish.length}/240</span></div><button className="primary" type="submit" disabled={!wish.trim()}>Thả đèn lên trăng <ArrowUpRight size={20}/></button></form></dialog>
  {sent&&<div className="sent-card" role="status"><div className="sent-label"><Check size={16}/> ĐIỀU ƯỚC ĐÃ THEO ĐÈN LÊN TRĂNG</div><p>“{wish}”</p><span>{name.trim()?`Từ ${name.trim()}, với thật nhiều thương.`:'Mong mọi điều dịu dàng sẽ đến với bạn.'}</span><button onClick={reset}>Thêm một lời thương <ArrowRight size={16}/></button></div>}
 </main>
}



