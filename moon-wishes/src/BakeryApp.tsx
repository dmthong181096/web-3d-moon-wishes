import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { ArrowLeft, ArrowRight, Check, ChefHat, Flame, Moon, RotateCcw, Sparkles, Stamp, X } from 'lucide-react';
import BakeryScene from './BakeryScene';
import './bakery.css';

const fillings=[{name:'Đậu đỏ',description:'Bùi thơm, ngọt dịu',color:'#bd725a'},{name:'Trà xanh',description:'Thanh mát đầu thu',color:'#819271'},{name:'Sen tím',description:'Thoảng hương hoa sen',color:'#987189'}];
function CakeFallback(){return <div className="cake-fallback"><Moon size={56}/><span>Đêm nay, lò vẫn ấm.</span></div>}
export default function BakeryApp(){
 const [filling,setFilling]=useState(0),[stamp,setStamp]=useState('hoa'),[stage,setStage]=useState(0),[busy,setBusy]=useState(false);const time=useRef<number|undefined>(undefined);
 useEffect(()=>()=>window.clearTimeout(time.current),[]);
 useEffect(()=>{
  document.title='Tiệm bánh trên cung trăng · Đêm rằm';
  const meta=document.querySelector('meta[name="description"]');meta?.setAttribute('content','Cùng thỏ ngọc chọn nhân, đóng khuôn và nướng một chiếc bánh Trung thu dưới vầng trăng.');
  const context=(document as Document & {modelContext?:{registerTool:(tool:unknown,options:{signal:AbortSignal})=>void|Promise<void>}}).modelContext;
  if(!context?.registerTool)return;
  const lifecycle=new AbortController();
  const tool={name:'prepare_mooncake_recipe',title:'Soạn công thức bánh Trung thu',description:'Chọn nhân và dấu khuôn trong giao diện tiệm bánh. Người dùng bấm nút để nướng; công thức không được gửi lên máy chủ.',inputSchema:{type:'object',properties:{filling:{type:'string',enum:fillings.map(f=>f.name)},stamp:{type:'string',enum:['hoa sen','vầng trăng']}},required:['filling','stamp'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:(input:unknown)=>{
   const value=input as {filling?:unknown;stamp?:unknown};
   const selected=fillings.findIndex(f=>f.name===value.filling);if(selected<0)throw new Error('Vị nhân chưa hợp lệ.');
   if(value.stamp!=='hoa sen'&&value.stamp!=='vầng trăng')throw new Error('Dấu khuôn chưa hợp lệ.');
   flushSync(()=>{setFilling(selected);setStamp(value.stamp==='hoa sen'?'hoa':'trang');setStage(0);setBusy(false)});
   return {status:'recipe_prepared',filling:fillings[selected].name,stamp:value.stamp,awaitingUserBake:true};
  }};
  try{void Promise.resolve(context.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{/* Optional browser capability. */}
  return()=>lifecycle.abort();
 },[]);
 const bake=()=>{if(busy)return;setStage(1);setBusy(true);time.current=window.setTimeout(()=>{setStage(2);setBusy(false)},3200)};
 const reset=()=>{window.clearTimeout(time.current);setStage(0);setBusy(false)};
 const next=()=>{if(stage===0)setStage(1);else if(stage===1)bake()};
 return <main className="bakery">
   <header className="bakery-head"><a className="bakery-back" href="/" aria-label="Về concept Gửi trăng một điều ước"><ArrowLeft size={17}/><span>Đêm rằm</span></a><a className="bakery-brand" href="/tiem-banh/" aria-label="Tiệm bánh cung trăng"><span className="bakery-emblem"><Moon size={23}/></span><span>tiệm bánh<span className="bakery-brand-sub">TRÊN CUNG TRĂNG</span></span></a><nav className="bakery-nav" aria-label="Các concept Trung thu"><a href="/">Gửi trăng</a><a href="/hai-nguoi/">Hai người</a></nav></header>
   <section className="bakery-title"><span className="bakery-kicker"><span/> CA ĐÊM CỦA THỎ NGỌC</span><h1>Một chiếc bánh,<br/><em>một lời thương.</em></h1><p>Chọn nhân, đóng khuôn, rồi gửi chút ngọt ngào về nhà.</p></section>
   <div className="bakery-scene" aria-label="Tiệm bánh Trung thu ba chiều cùng thỏ ngọc, lò nướng và bánh có thể đổi theo lựa chọn"><BakeryScene filling={filling} stage={stage} stamp={stamp}/></div>
   <aside className="recipe" aria-label="Bảng chọn công thức">
    <div className="recipe-top"><div><span className="recipe-no">CÔNG THỨC SỐ 08</span><h2>{stage===2?'Bánh đã chín!':stage===1?'Cho bánh vào lò':'Chọn vị bánh'}</h2></div><span className="recipe-icon"><ChefHat size={19}/></span></div>
    {stage<2?<>
     <div className="step-indicator"><span className={stage===0?'here':''}>01 <i>Chọn nhân</i></span><b/><span className={stage===1?'here':''}>02 <i>Đóng khuôn</i></span><b/><span>03 <i>Nướng bánh</i></span></div>
     {stage===0&&<><p className="recipe-label">NHÂN BÁNH CỦA BẠN</p><div className="fillings">{fillings.map((f,i)=><button key={f.name} className={`filling ${filling===i?'picked':''}`} onClick={()=>setFilling(i)} aria-pressed={filling===i}><span className="filling-dot" style={{'--filling':f.color} as React.CSSProperties}>{filling===i&&<Check size={13}/>}</span><span><strong>{f.name}</strong><small>{f.description}</small></span><span className="filling-price">♡</span></button>)}</div>
      <p className="recipe-label stamp-label">DẤU KHUÔN</p><div className="stamp-options"><button className={stamp==='hoa'?'stamp-picked':''} onClick={()=>setStamp('hoa')} aria-pressed={stamp==='hoa'}><span>✿</span> Hoa sen</button><button className={stamp==='trang'?'stamp-picked':''} onClick={()=>setStamp('trang')} aria-pressed={stamp==='trang'}><span>☾</span> Vầng trăng</button></div></>}
     {stage===1&&<div className="oven-copy"><div className={busy?'flame-icon glowing':'flame-icon'}><Flame size={24}/></div><p>{busy?'Lò đang reo khe khẽ…':'Khuôn bánh đã sẵn sàng.'}</p><span>{busy?'Thỏ Ngọc canh bánh thật khéo.':'Nhấn nướng bánh để làm thơm gian bếp.'}</span></div>}
     <div className="recipe-bottom"><button className="recipe-action" onClick={next} disabled={busy}>{stage===0?<><Stamp size={17}/> Đóng khuôn bánh <ArrowRight size={17}/></>:<><Flame size={17}/> Nướng bánh thôi <ArrowRight size={17}/></>}</button><span>Thỏ Ngọc để dành chiếc bánh này cho bạn.</span></div>
    </>:<div className="ready-note"><div className="ready-seal"><Check size={26}/></div><h3>Vừa vặn một lời thương.</h3><p>Bánh <strong>{fillings[filling].name.toLowerCase()}</strong> với dấu <strong>{stamp==='hoa'?'hoa sen':'vầng trăng'}</strong>, còn ấm như bếp nhà.</p><div className="wish-note">“Mong nhà mình luôn có một chỗ ngồi chờ nhau.”</div><button className="recipe-action" onClick={reset}><RotateCcw size={17}/> Làm một chiếc nữa <ArrowRight size={17}/></button><button className="back-to-menu" onClick={()=>location.assign('/')}>Ghé đêm trăng <ArrowLeft size={15}/></button></div>}
   </aside>
   <div className="scene-tip"><span/>Kéo nhẹ để ngắm tiệm bánh dưới trăng</div>
  <footer className="bakery-footer"><span>Gói ghém bằng tay, gửi bằng thương.</span><div><span className={stage===0?'done':''}><b>01</b> Chọn vị</span><i/><span className={stage===1?'done':''}><b>02</b> Đóng khuôn</span><i/><span className={stage===2?'done':''}><b>03</b> Chia bánh</span></div><Moon size={16}/></footer>
   <div className="sr-only" aria-live="polite">{stage===2?'Bánh đã chín và sẵn sàng để chia sẻ.':''}</div>
 </main>
}
