import React, {useEffect, useRef, useState} from 'react';

// Warp the existing artwork locally: the face stays still while nearby snakes ripple.
export default function MedusaPortrait() {
  const host = useRef(null), surface = useRef(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const canvas = surface.current, element = host.current;
    const gl = canvas.getContext('webgl', {alpha:true, antialias:false, premultipliedAlpha:false});
    if (!gl) return;
    const shader = (type, source) => {
      const value = gl.createShader(type);
      gl.shaderSource(value, source); gl.compileShader(value);
      if (!gl.getShaderParameter(value, gl.COMPILE_STATUS)) {gl.deleteShader(value); return null;}
      return value;
    };
    const vertex = shader(gl.VERTEX_SHADER, 'attribute vec2 p; varying vec2 uv; void main(){uv=p*.5+.5;gl_Position=vec4(p,0.,1.);}');
    const fragment = shader(gl.FRAGMENT_SHADER, `precision mediump float;
      varying vec2 uv; uniform sampler2D artwork;
      uniform vec2 fit; uniform vec2 pointer; uniform float time; uniform float energy;
      void main(){
        vec2 q=(uv-.5)/fit+.5;
        if(q.x<0.||q.x>1.||q.y<0.||q.y>1.){gl_FragColor=vec4(0.);return;}
        // Image-space face oval is excluded, with a broad feathered edge.
        float face=1.-smoothstep(.80,1.15,length((q-vec2(.53,.48))/vec2(.225,.30)));
        float hair=(1.-face)*smoothstep(.04,.22,q.y);
        float distanceToMouse=length(q-pointer);
        float influence=exp(-distanceToMouse*distanceToMouse*15.)*energy*hair;
        vec2 wave=vec2(sin(q.y*24.-time*3.8)+sin(q.x*17.+time*2.)*.45,
          cos(q.x*23.-time*3.1)+sin(q.y*14.+time*2.4)*.4);
        vec2 displaced=clamp(q+wave*influence*.022,vec2(.001),vec2(.999));
        vec4 color=texture2D(artwork,displaced);
        color.rgb+=vec3(.025,.065,.008)*influence;
        gl_FragColor=color;
      }`);
    if (!vertex || !fragment) return;
    const program=gl.createProgram(); gl.attachShader(program,vertex); gl.attachShader(program,fragment); gl.linkProgram(program);
    if (!gl.getProgramParameter(program,gl.LINK_STATUS)) return;
    gl.useProgram(program);
    const buffer=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
    const position=gl.getAttribLocation(program,'p'); gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
    const uniforms=Object.fromEntries(['fit','pointer','time','energy'].map(name=>[name,gl.getUniformLocation(program,name)]));
    const texture=gl.createTexture(); let frame=0, loaded=false, disposed=false, intensity=0, target=0;
    let mouse=[.5,.8], current=[.5,.8];
    const fit=()=>{const box=element.getBoundingClientRect(); const side=Math.min(box.width,box.height);return [side/box.width,side/box.height]};
    const draw=(now=0)=>{
      frame=0;if(!loaded||disposed)return;
      intensity+=(target-intensity)*.09;
      current=current.map((n,i)=>n+(mouse[i]-n)*.12);
      const box=element.getBoundingClientRect(), ratio=Math.min(devicePixelRatio||1,2);
      const w=Math.round(box.width*ratio),h=Math.round(box.height*ratio);
      if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h)}
      gl.uniform2fv(uniforms.fit,fit());gl.uniform2fv(uniforms.pointer,current);
      gl.uniform1f(uniforms.time,now*.001);gl.uniform1f(uniforms.energy,intensity);
      gl.drawArrays(gl.TRIANGLES,0,6);
      if(target||intensity>.001)frame=requestAnimationFrame(draw);
    };
    const wake=()=>{if(!frame)frame=requestAnimationFrame(draw)};
    const move=e=>{
      if(motion.matches||e.pointerType==='touch')return;
      const box=element.getBoundingClientRect(),f=fit();
      mouse=[((e.clientX-box.left)/box.width-.5)/f[0]+.5,(.5-(e.clientY-box.top)/box.height)/f[1]+.5];
      target=mouse.every(n=>n>=0&&n<=1)?1:0;wake();
    };
    const leave=()=>{target=0;wake()};
    const preference=()=>{if(motion.matches){target=0;intensity=0}wake()};
    const lost=e=>{e.preventDefault();setReady(false);cancelAnimationFrame(frame);frame=0};
    const picture=new Image();picture.onload=()=>{
      if(disposed)return;gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,picture);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      loaded=true;draw();setReady(true);
    };picture.src='/medusa.png';
    element.addEventListener('pointermove',move);element.addEventListener('pointerleave',leave);
    canvas.addEventListener('webglcontextlost',lost);motion.addEventListener('change',preference);
    const resize=new ResizeObserver(wake);resize.observe(element);
    return()=>{disposed=true;cancelAnimationFrame(frame);resize.disconnect();element.removeEventListener('pointermove',move);element.removeEventListener('pointerleave',leave);motion.removeEventListener('change',preference);canvas.removeEventListener('webglcontextlost',lost);gl.deleteTexture(texture);gl.deleteBuffer(buffer);gl.deleteProgram(program);gl.deleteShader(vertex);gl.deleteShader(fragment)};
  },[]);
  return <div ref={host} className="sculpture interactive-portrait" data-interactive={ready?'ready':'fallback'}>
    <img src="/medusa.png" alt="Black chrome Medusa with emerald eyes. Hover over her snake crown to awaken it." style={{opacity:ready?0:1}}/>
    <canvas ref={surface} aria-hidden="true" style={{opacity:ready?1:0}}/>
  </div>;
}
