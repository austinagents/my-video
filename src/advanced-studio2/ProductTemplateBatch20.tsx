import React from "react";
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from "remotion";
import type {ProductVideoProps} from "./ProductVideo";
import {getProductTemplate} from "./product-templates";

const clamp={extrapolateLeft:"clamp",extrapolateRight:"clamp"} as const;
const ease=(f:number,a:number[],b:number[])=>interpolate(f,a,b,{...clamp,easing:t=>t*t*(3-2*t)});
export const batch20Ids=["stone-seam","marble-shutter","slate-horizon","brass-eclipse","concrete-canyon","granite-bridge","sandstone-veil","steel-lightwell","terrazzo-terrace","basalt-monolith","porcelain-vault","metal-lens","quarry-threshold","stone-cradle","marble-sundial","slate-proscenium","brass-axis","concrete-gallery","granite-canopy","sandstone-alcove"] as const;
type Id=(typeof batch20Ids)[number];
const fallback:Record<string,string>={
  dark_rock_02:"dark_rock_02-492ae574844fa49cba63aee89ef226d1.jpg",
  marble_01:"marble_01-4eeefea16242cecb3b429ac0c8f88740.jpg",
  slate_floor_03:"slate_floor_03-08553293b689ec359c8c70c9453dad18.jpg",
  metal_plate:"metal_plate-91b841e7e619e55588f0183a703fb644.jpg",
  concrete:"concrete-8ddd1a273bbde0e4095cba8647c79b96.jpg",
  granite_tile_04:"granite_tile_04-697337cdfe1302253da449acb2984db1.jpg",
  sandstone_cracks:"sandstone_cracks-bc08fe111536bf9b12fa89b43ae90561.jpg",
  terrazzo_tiles:"terrazzo_tiles-b4bfb01525c22e611d9a0651f372ae91.jpg",
};
const clip=(index:number,p:number)=>{
  const x=p*100,inv=(1-p)*100;
  switch(index){
    case 0:return `polygon(0 0,${50-x/2}% 0,${50-x/2}% 100%,0 100%,0 0,100% 0,100% 100%,${50+x/2}% 100%,${50+x/2}% 0)`;
    case 1:return `inset(${x/2}% ${x/2}% round ${p*48}px)`;
    case 2:return `polygon(0 0,100% 0,100% ${50-x/2}%,0 ${50-x/2}%,0 ${50+x/2}%,100% ${50+x/2}%,100% 100%,0 100%)`;
    case 3:return `circle(${70-p*70}% at 50% 50%)`;
    case 4:return `polygon(0 0,${100-x}% 0,${55-x/2}% 100%,0 100%)`;
    case 5:return `polygon(0 0,100% 0,100% ${100-x}%,${x}% 100%,0 ${100-x}%)`;
    case 6:return `inset(0 ${x/2}% 0 ${x/2}%)`;
    case 7:return `polygon(0 0,${50-x/2}% 0,${50-x/2}% 100%,0 100%,${50+x/2}% 100%,${50+x/2}% 0,100% 0,100% 100%,0 100%)`;
    case 8:return `ellipse(${70-p*70}% ${70-p*70}% at 50% 50%)`;
    case 9:return `polygon(0 0,100% 0,100% ${inv}%,0 ${inv}%)`;
    case 10:return `polygon(0 0,${inv}% 0,0 ${inv}%,0 0,100% 0,100% 100%,${x}% 100%,100% ${x}%)`;
    case 11:return `inset(${x}% 0 0 0 round ${p*80}px ${p*80}px 0 0)`;
    case 12:return `polygon(0 0,100% 0,100% 100%,${x}% 100%,${x}% ${x}%,0 ${x}%)`;
    case 13:return `polygon(0 0,${inv}% 0,${inv}% 45%,100% 45%,100% 100%,${x}% 100%,${x}% 55%,0 55%)`;
    case 14:return `polygon(0 0,100% 0,100% ${50-x/2}%,50% ${50-x/2}%,50% ${50+x/2}%,0 ${50+x/2}%)`;
    case 15:return `inset(${x/2}% 0 ${x/2}% 0 round 0 0 ${p*100}px ${p*100}px)`;
    case 16:return `polygon(0 0,${50-x/2}% 0,50% ${50-x/2}%,${50+x/2}% 0,100% 0,100% 100%,${50+x/2}% 100%,50% ${50+x/2}%,${50-x/2}% 100%,0 100%)`;
    case 17:return `polygon(0 0,100% 0,100% ${inv}%,${inv}% ${inv}%,${inv}% 100%,0 100%)`;
    case 18:return `polygon(0 0,${inv}% 0,${inv}% ${inv}%,0 ${inv}%,0 0,100% 0,100% 100%,${x}% 100%,${x}% ${x}%,0 ${x}%)`;
    default:return `inset(0 0 ${x}% 0 round 0 0 ${p*120}px ${p*120}px)`;
  }
};
export const ProductTemplateBatch20:React.FC<ProductVideoProps>=(props)=>{
  const frame=useCurrentFrame(),{height,width}=useVideoConfig(),id=props.templateId as Id;if(!batch20Ids.includes(id))return null;
  const i=batch20Ids.indexOf(id),template=getProductTemplate(id),tall=height/width>1.55;
  const open=ease(frame,[50,154],[0,1]),land=ease(frame,[105,172],[0,1]),copy=ease(frame,[214,246],[0,1]);
  const file=fallback[template.polyHavenDefaultAssetId||"dark_rock_02"],src=props.polyHavenTexture?.localSrc||`advanced-studio2-assets/polyhaven/${file}`;
  const zoom=1.45-ease(frame,[0,170],[0,.45]),rotation=(i%5-2)*(1-open)*4;
  return <AbsoluteFill style={{background:template.background,color:template.foreground,overflow:"hidden",fontFamily:'Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'}}>
    <Img src={staticFile(src.replace(/^\/+/,""))} style={{position:"absolute",inset:"-8%",width:"116%",height:"116%",objectFit:"cover",transform:`scale(${zoom}) rotate(${rotation}deg)`,filter:`brightness(${.34+open*.12}) saturate(${.58+open*.12}) contrast(1.12)`}}/>
    <div style={{position:"absolute",inset:0,background:`radial-gradient(circle at 50% 48%,${template.accent}22 0,transparent 36%),linear-gradient(180deg,#0003,#0008)`}}/>
    <div style={{position:"absolute",inset:"-2%",clipPath:clip(i,open),background:template.background,boxShadow:`inset 0 0 100px #000`,filter:"drop-shadow(0 0 22px #000c)"}}>
      <Img src={staticFile(src.replace(/^\/+/,""))} style={{width:"100%",height:"100%",objectFit:"cover",filter:"brightness(.48) contrast(1.18) saturate(.65)"}}/>
    </div>
    <div style={{position:"absolute",left:"50%",top:tall?"52%":"53%",width:tall?"58%":"47%",height:tall?"51%":"58%",transform:`translate(-50%,-50%) translateY(${(1-land)*80}px) scale(${.72+land*.28})`,opacity:land,display:"grid",placeItems:"end center",filter:"drop-shadow(0 30px 24px #0009)"}}>
      <div style={{position:"absolute",bottom:"-.5%",width:"62%",height:"5.5%",borderRadius:"50%",background:"#0009",filter:"blur(10px)"}}/>
      {props.imageSrc?<Img src={props.imageSrc} style={{position:"relative",maxWidth:"100%",maxHeight:"100%",objectFit:"contain",objectPosition:"center bottom"}}/>:<div style={{width:"48%",height:"88%",borderRadius:28,background:"linear-gradient(100deg,#666,#f0eee8 35%,#bbc0bb 68%,#4b4e4c)",display:"grid",placeItems:"center",color:"#222",fontWeight:800,letterSpacing:2,writingMode:"vertical-rl"}}>{props.productName}</div>}
    </div>
    <div style={{position:"absolute",left:"7%",right:"7%",top:"6%",opacity:copy,textShadow:"0 2px 20px #000d"}}><div style={{fontSize:15,fontWeight:850,letterSpacing:4,color:props.accent||template.accent}}>{props.eyebrow||template.eyebrow}</div><div style={{fontSize:tall?66:56,lineHeight:.92,fontWeight:850,letterSpacing:-3,maxWidth:"72%",marginTop:14}}>{props.headline||template.headline}</div><div style={{fontSize:17,opacity:.78,maxWidth:"58%",marginTop:18}}>{props.subheadline||template.subheadline}</div></div>
  </AbsoluteFill>;
};
