(function(){
  var ctx, lenis, tick, started = false, offs = [];

  function init(){
    if (started) return; started = true;
    gsap.registerPlugin(ScrollTrigger);
    var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    var $ = function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));};

    if (window.Lenis && !reduce){
      lenis = new Lenis({lerp:.1});
      lenis.on('scroll', ScrollTrigger.update);
      tick = function(t){ lenis.raf(t*1000); };
      gsap.ticker.add(tick); gsap.ticker.lagSmoothing(0);
    }

    // everything below is scoped to one context so destroy() can revert it
    ctx = gsap.context(function(){
      // pause decorative loops while they are off-screen so the GPU only works on what you can see
      function gate(tw,trig){
        if(!tw||reduce) return tw;
        tw.pause();
        ScrollTrigger.create({trigger:trig,start:'top bottom',end:'bottom top',onToggle:function(s){s.isActive?tw.resume():tw.pause();},onRefresh:function(s){s.isActive?tw.resume():tw.pause();}});
        return tw;
      }
      // bubbles
      var box = document.getElementById('bubbles');
      for (var i=0;i<12;i++){
        var b = document.createElement('span'), s = gsap.utils.random(8,34);
        b.className='bubble'; b.style.cssText='width:'+s+'px;height:'+s+'px;left:'+gsap.utils.random(2,96)+'%;top:'+gsap.utils.random(5,95)+'%;opacity:'+gsap.utils.random(.25,.7);
        box.appendChild(b);
        if(!reduce) gsap.to(b,{y:gsap.utils.random(-50,-120),x:gsap.utils.random(-18,18),duration:gsap.utils.random(3,6),ease:'sine.inOut',yoyo:true,repeat:-1,delay:Math.random()*3});
      }
      if(!reduce){
        // floating creatures & icons
        $('[data-float]').forEach(function(el){
          gate(gsap.to(el,{y:'+='+el.dataset.float,rotation:el.classList.contains('creature')?1.2:0,duration:gsap.utils.random(2.4,3.6),ease:'sine.inOut',yoyo:true,repeat:-1}),el);
        });
        // wave drift
        $('[data-wave]').forEach(function(w){
          gate(gsap.to(w,{xPercent:(w.getAttribute('data-wave')==='-1'?1:-1)*-25,duration:9,ease:'none',repeat:-1,yoyo:true}),'#hero');
        });
      }

      // depth gradient: sunlit turquoise -> abyss across the whole page
      gsap.timeline({scrollTrigger:{trigger:document.body,start:'top top',end:'bottom bottom',scrub:1}})
        .to('#depth .d1',{opacity:1,ease:'none',duration:1})
        .to('#depth .d2',{opacity:1,ease:'none',duration:1})
        .to('#depth .d3',{opacity:1,ease:'none',duration:1});

      // parallax: creatures drift at their own speed (yPercent is separate from the float's y)
      if(!reduce) $('.creature').forEach(function(el){
        gsap.to(el,{yPercent:parseFloat(el.dataset.speed)*-2,ease:'none',scrollTrigger:{trigger:el.parentElement,start:'top bottom',end:'bottom top',scrub:true}});
      });
      if(!reduce) gsap.to('#hero .wrap',{yPercent:-12,opacity:.2,ease:'none',scrollTrigger:{trigger:'#hero',start:'top top',end:'bottom top',scrub:true}});

      // staggered reveals
      ScrollTrigger.batch('.reveal',{start:'top 88%',onEnter:function(els){gsap.fromTo(els,{y:50,opacity:0},{y:0,opacity:1,duration:.9,stagger:.12,ease:'power3.out',overwrite:true});},onLeaveBack:function(els){gsap.to(els,{y:50,opacity:0,duration:.4,overwrite:true});}});
      gsap.set('.reveal',{opacity:0,y:50});

      // counters (set the three data-count values on the Our work stats to your real totals)
      $('[data-count]').forEach(function(el){
        var o={v:0},end=parseFloat(el.dataset.count),dec=+(el.dataset.dec||0),suf=el.dataset.suffix||'';
        ScrollTrigger.create({trigger:el,start:'top 85%',once:true,onEnter:function(){
          gsap.to(o,{v:end,duration:2,ease:'power2.out',onUpdate:function(){el.textContent=o.v.toLocaleString(undefined,{minimumFractionDigits:dec,maximumFractionDigits:dec})+suf;}});
        }});
      });
      // marine life cards drift at different speeds
      if(!reduce) $('[data-drift]').forEach(function(el){
        gsap.to(el,{y:parseFloat(el.dataset.drift),ease:'none',scrollTrigger:{trigger:'#wildlife',start:'top bottom',end:'bottom top',scrub:true}});
      });

      // ===== nine sites map (data is placeholder where marked; edit the SITES array) =====
      // t = tons removed per year [2021..2026]; c / sp = 2026 crews / species rescued (scaled for earlier years)
      var SITES=[
        {n:'Manila Bay',loc:'Metro Manila, Luzon',g:'Luzon',f:'Plastic removal',s:'Active',x:.443,y:.318,t:[120,190,330,455,540,612],c:18,sp:9},
        {n:'Verde Island Passage',loc:'Batangas, Luzon',g:'Luzon',f:'Reef restoration',s:'Active',x:.452,y:.384,t:[60,90,130,180,215,248],c:8,sp:4},
        {n:'Albay Gulf',loc:'Albay, Luzon',g:'Luzon',f:'Wildlife rescue',s:'Monitoring',x:.794,y:.424,t:[25,40,62,85,105,121],c:4,sp:12},
        {n:'Puerto Princesa',loc:'Palawan',g:'Palawan',f:'Wildlife rescue',s:'Active',x:.166,y:.684,t:[35,55,85,115,142,164],c:5,sp:14},
        {n:'Iloilo Strait',loc:'Iloilo, Panay',g:'Visayas',f:'Plastic removal',s:'Active',x:.655,y:.614,t:[40,62,95,140,175,205],c:8,sp:3},
        {n:'Cebu Strait',loc:'Cebu, Visayas',g:'Visayas',f:'Plastic removal',s:'Active',x:.829,y:.641,t:[30,48,80,112,140,158],c:6,sp:5},
        {n:'Leyte Gulf',loc:'Leyte, Visayas',g:'Visayas',f:'Reef restoration',s:'Active',x:.963,y:.568,t:[30,48,72,100,122,142],c:3,sp:3},
        {n:'Zamboanga Coast',loc:'Zamboanga, Mindanao',g:'Mindanao',f:'Wildlife rescue',s:'Monitoring',x:.582,y:.899,t:[22,35,52,72,90,103],c:3,sp:8},
        {n:'Davao Gulf',loc:'Davao, Mindanao',g:'Mindanao',f:'Plastic removal',s:'Active',x:.985,y:.89,t:[42,65,98,135,165,189],c:7,sp:4}
      ];
      var CF=[.45,.55,.65,.75,.88,1];
      // each year places the circles at slightly different spots (2026 = the reference positions)
      function jit(n,yr,k){var h=0,s=n+yr+k;for(var i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))%1000;return (h/1000-.5)*.07;}
      function pos(s,yr){return yr===2026?{x:s.x,y:s.y}:{x:gsap.utils.clamp(.04,.985,s.x+jit(s.n,yr,'x')),y:gsap.utils.clamp(.03,.97,s.y+jit(s.n,yr,'y'))};}
      var pz=document.getElementById('pz'),stage=document.getElementById('stage'),mw=document.getElementById('mapwrap'),det=document.getElementById('details'),card=document.getElementById('scard');
      var st={s:1,x:0,y:0},lastS=1;
      function on(el,ev,fn,o){el.addEventListener(ev,fn,o);offs.push(function(){el.removeEventListener(ev,fn,o);});}
      function yv(site,yr){var i=yr-2021;return{t:site.t[i],c:yr===2026?site.c:Math.max(1,Math.round(site.c*CF[i])),sp:yr===2026?site.sp:Math.max(1,Math.round(site.sp*CF[i]))};}
      function fmt(n){return n.toLocaleString();}
      function showCard(btn,site,yr){
        var d=yv(site,yr);
        card.className='scard'+(site.s==='Active'?' act':'');card.innerHTML='<h4>'+site.n+'</h4><div class="sub">'+site.loc+'</div><div class="row"><span>Focus</span><b>'+site.f+'</b></div><div class="row"><span>Plastic removed</span><b>'+fmt(d.t)+' t</b></div><div class="row"><span>Active crews</span><b>'+d.c+'</b></div><div class="row"><span>Species rescued</span><b>'+d.sp+'</b></div><div class="row"><span>Status</span><b>'+site.s+'</b></div><div class="bar"></div>';
        card.style.display='block';
        var r=btn.getBoundingClientRect(),m=mw.getBoundingClientRect(),w=card.offsetWidth,h=card.offsetHeight;
        var x=r.left-m.left+r.width+10,y=r.top-m.top-h-10;
        if(x+w>m.width-10)x=r.left-m.left-w-10;
        if(y<10)y=r.top-m.top+r.height+10;
        if(y+h>m.height-10)y=m.height-h-10;
        card.style.left=Math.max(10,x)+'px';card.style.top=Math.max(10,y)+'px';
      }
      function showGroup(el,g,a,yr){
        var t=0,c=0,sp=0,ac=0;a.forEach(function(s){var d=yv(s,yr);t+=d.t;c+=d.c;sp+=d.sp;if(s.s==='Active')ac++;});
        card.className='scard'+(ac===a.length?' act':'');
        card.innerHTML='<h4>'+g+'</h4><div class="sub">'+a.length+(a.length>1?' sites':' site')+' in this group</div><div class="row"><span>Plastic removed</span><b>'+fmt(t)+' t</b></div><div class="row"><span>Active crews</span><b>'+c+'</b></div><div class="row"><span>Species rescued</span><b>'+sp+'</b></div><div class="row"><span>Status</span><b>'+ac+' Active'+(ac<a.length?', '+(a.length-ac)+' Monitoring':'')+'</b></div><div class="bar"></div>';
        card.style.display='block';
        var r=el.getBoundingClientRect(),m=mw.getBoundingClientRect(),w=card.offsetWidth,h=card.offsetHeight;
        var x=r.left-m.left+r.width+10,y=r.top-m.top-h-10;
        if(x+w>m.width-10)x=r.left-m.left-w-10;
        if(y<10)y=r.top-m.top+r.height+10;
        if(y+h>m.height-10)y=m.height-h-10;
        card.style.left=Math.max(10,x)+'px';card.style.top=Math.max(10,y)+'px';
      }
      function hideCard(){card.style.display='none';}
      function render(){
        var yr=+document.getElementById('fYear').value,fo=document.getElementById('fFocus').value,sa=document.getElementById('fStatus').value;
        var list=SITES.filter(function(s){return (fo==='All'||s.f===fo)&&(sa==='All'||s.s===sa);});
        var tons=0,crews=0;list.forEach(function(s){var d=yv(s,yr);tons+=d.t;crews+=d.c;});
        document.getElementById('mstat').textContent=list.length+' of '+SITES.length+' sites, '+fmt(tons)+' t removed in '+yr+', '+crews+' crews';
        hideCard();
        $('.site,.cluster',pz).forEach(function(n){n.remove();});
        var maxT=Math.max.apply(null,SITES.map(function(s){return yv(s,yr).t;}));
        list.forEach(function(s){
          var b=document.createElement('button'),sz=12+8*yv(s,yr).t/maxT;
          b.className='site'+(s.s==='Active'?' act':'');b.type='button';b.setAttribute('aria-label',s.n);
          var p=pos(s,yr);b.style.cssText='left:'+p.x*100+'%;top:'+p.y*100+'%;width:'+sz+'px;height:'+sz+'px';
          b.addEventListener('mouseenter',function(){showCard(b,s,yr);});
          b.addEventListener('focus',function(){showCard(b,s,yr);});
          b.addEventListener('click',function(){showCard(b,s,yr);});
          b.addEventListener('mouseleave',hideCard);b.addEventListener('blur',hideCard);
          pz.appendChild(b);
        });
        var gr={};list.forEach(function(s){(gr[s.g]=gr[s.g]||[]).push(s);});
        Object.keys(gr).forEach(function(g){
          var a=gr[g],cx=a.reduce(function(m,s){return m+pos(s,yr).x;},0)/a.length,cy=a.reduce(function(m,s){return m+pos(s,yr).y;},0)/a.length,sz=24+a.length*5;
          var c=document.createElement('div');c.className='cluster'+(a.every(function(s){return s.s==='Active';})?' lime':'');c.style.cssText='left:'+cx*100+'%;top:'+cy*100+'%;width:'+sz+'px;height:'+sz+'px';c.textContent=a.length;
          c.addEventListener('mouseenter',function(){showGroup(c,g,a,yr);});c.addEventListener('mouseleave',hideCard);
          pz.appendChild(c);
        });
        det.innerHTML=list.map(function(s){return '<div class="dr"><span>'+s.n+'</span><span>'+s.g+'</span><span>'+s.f+'</span><span>'+fmt(yv(s,yr).t)+' t</span><span><span class="st'+(s.s==='Active'?' act':'')+'">'+s.s+'</span></span></div>';}).join('')||'<div class="dr"><span>No sites match these filters.</span></div>';
        if(!reduce) gsap.fromTo($('.site,.cluster',pz),{opacity:0},{opacity:1,duration:.5,stagger:.05,ease:'power2.out'});
        pz.style.setProperty('--inv',1/st.s);
      }
      ['fYear','fFocus','fStatus'].forEach(function(id){on(document.getElementById(id),'change',render);});
      render();
      function apply(anim){
        var lim=stage.offsetWidth*.6*st.s;st.x=gsap.utils.clamp(-lim,lim,st.x);st.y=gsap.utils.clamp(-lim,lim,st.y);
        if(lastS!==st.s){lastS=st.s;pz.style.setProperty('--inv',1/st.s);}hideCard();
        (anim?gsap.to:gsap.set)(pz,anim?{x:st.x,y:st.y,scale:st.s,duration:.45,ease:'power3.out',overwrite:true}:{x:st.x,y:st.y,scale:st.s});
      }
      function zoom(f){st.s=gsap.utils.clamp(1,4,st.s*f);if(st.s===1){st.x=st.y=0;}apply(true);}
      on(document.getElementById('zin'),'click',function(){zoom(1.4);});
      on(document.getElementById('zout'),'click',function(){zoom(1/1.4);});
      on(document.getElementById('zreset'),'click',function(){st={s:1,x:0,y:0};apply(true);});
      on(stage,'dblclick',function(){zoom(1.6);});
      on(stage,'wheel',function(e){e.preventDefault();zoom(e.deltaY<0?1.15:1/1.15);},{passive:false});
      var drag=null;
      on(stage,'pointerdown',function(e){drag={x:e.clientX-st.x,y:e.clientY-st.y};});
      on(window,'pointermove',function(e){if(!drag)return;st.x=e.clientX-drag.x;st.y=e.clientY-drag.y;apply(false);});
      on(window,'pointerup',function(){drag=null;});
      function mode(cl){mw.classList.toggle('cl',cl);document.getElementById('bcl').classList.toggle('on',cl);document.getElementById('bsi').classList.toggle('on',!cl);hideCard();}
      on(document.getElementById('bcl'),'click',function(){mode(true);});
      on(document.getElementById('bsi'),'click',function(){mode(false);});
      on(document.getElementById('detbtn'),'click',function(){var o=document.getElementById('dtable').classList.toggle('open');mw.classList.toggle('det',o);this.classList.toggle('open',o);this.textContent=o?'Hide location details':'Show location details';});

      // ===== animal cards: swim animation + video modal =====
      if(!reduce) $('.aimg').forEach(function(el,i){
        el._swim=gate(gsap.to(el,{x:-8,y:-6,rotation:-1.5,duration:gsap.utils.random(2.4,3.4),ease:'sine.inOut',yoyo:true,repeat:-1,delay:i*.3}),el.closest('.acard'));
      });
      if(!reduce) $('.athumb .bb').forEach(function(el){
        gate(gsap.fromTo(el,{y:0,opacity:.8},{y:-70,opacity:0,duration:gsap.utils.random(3,5),ease:'none',repeat:-1,delay:Math.random()*3}),'#wildlife');
      });
      // underwater scene behind each animal card (light rays, seabed, swaying seagrass and coral)
      var SCENE={whale:['#0b4a5e'],thresher:['#0b4a5e'],turtle:['#0b4a5e'],manta:['#0b4a5e']};
      $('.acard').forEach(function(c){
        var th=c.querySelector('.athumb'),col=SCENE[c.dataset.id],s=document.createElement('div');
        th.style.background=col[0];
        s.className='scene';
        s.innerHTML='<i class="caus c1"></i><i class="caus c2"></i><i class="caus c3"></i><svg class="wv" viewBox="0 0 600 40" preserveAspectRatio="none"><path d="M0 20c50-20 100-20 150 0s100 20 150 0 100-20 150 0 100 20 150 0V40H0z"/></svg><svg class="wv wv2" viewBox="0 0 600 40" preserveAspectRatio="none"><path d="M0 20c50-20 100-20 150 0s100 20 150 0 100-20 150 0 100 20 150 0V40H0z"/></svg><svg viewBox="0 0 300 210" preserveAspectRatio="xMidYMax slice" fill="none" stroke-linecap="round"><path d="M0 210V190C70 178 130 198 200 188S275 182 300 190V210Z" fill="rgba(3,20,28,.55)"/><g class="sg"><path d="M26 200C18 178 34 166 26 140" stroke="#2DD4BF" stroke-width="4" opacity=".7"/></g><g class="sg"><path d="M40 202C48 182 34 170 44 148" stroke="#5eead4" stroke-width="3" opacity=".6"/></g><g class="sg"><path d="M14 203V176M14 190L4 174M14 184L24 168" stroke="#fb7185" stroke-width="5" opacity=".85"/></g><g class="sg"><path d="M274 202C266 184 282 172 274 150" stroke="#2DD4BF" stroke-width="4" opacity=".55"/></g><g class="sg"><path d="M214 198V176M214 186L206 172M214 182L224 168" stroke="#a78bfa" stroke-width="5" opacity=".65"/></g></svg>';
        th.insertBefore(s,th.firstChild);
        if(!reduce){
          var img=c.querySelector('.aimg'), swim=img&&img._swim;
          c.addEventListener('mouseenter',function(){
            if(swim) swim.timeScale(2.2);
            if(img) gsap.to(img,{scale:1.12,xPercent:-4,duration:.45,ease:'power2.out',overwrite:'auto'});
            gsap.to(th,{filter:'brightness(1.08) saturate(1.15)',duration:.35});
          });
          c.addEventListener('mouseleave',function(){
            if(swim) swim.timeScale(1);
            if(img) gsap.to(img,{scale:1,xPercent:0,duration:.6,ease:'power2.out',overwrite:'auto'});
            gsap.to(th,{filter:'brightness(1) saturate(1)',duration:.4});
          });
        }
      });

      // Paste YouTube video IDs here (the part after v= in the link). Empty = shows a "Watch on YouTube" search link instead.
      var ANIMALS={
        whale:{video:'Xqlfh_MYm8I',bullets:['Grows over 12 meters long.','Light spots and stripes cover its body.','Feeds on plankton.','Best places to see it are Donsol Bay and Oslob. It also passes through Tubbataha Reef now and then.'],src:'Source: Solitude World, Marine Life in the Philippines. Sightings vary with season and conditions.'},
        thresher:{video:'sTlMuWFamzs',bullets:['A shy deep-water shark.','Stuns its prey with a long, whip-like tail.','Best place to see it is Malapascua Island.'],src:'Sightings vary with season and conditions.'},
        turtle:{video:'DHp5UkP_eKQ',bullets:['Two species, green and hawksbill, share Philippine reefs.','Both are threatened by plastic.','Best places to see them are Tubbataha Reef and the Verde Island Passage.'],src:'Sightings vary with season and conditions.'},
        manta:{video:'eTqCPxbvL8w',bullets:['A graceful filter feeder.','Has huge wing-like fins.','Best places to see it are Tubbataha Reef and Anilao.'],src:'Sightings vary with season and conditions.'}
      };
      var modal=document.getElementById('modal'),mvid=document.getElementById('mvid'),lastBtn=null;
      function openM(card){
        var d=ANIMALS[card.dataset.id],title=card.querySelector('h3').textContent;
        document.getElementById('mtag').textContent=card.querySelector('.tag').textContent;
        document.getElementById('mtitle').textContent=title;
        document.getElementById('mwhere').textContent=card.querySelector('.where').textContent.replace('Where:','Where to look:');
        document.getElementById('mlist').innerHTML=d.bullets.map(function(b){return '<li>'+b+'</li>';}).join('');
        document.getElementById('msrc').textContent=d.src;
        mvid.innerHTML=d.video?'<iframe src="https://www.youtube-nocookie.com/embed/'+d.video+'?autoplay=1&rel=0&playsinline=1" title="'+title+' video" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>':'<div><p style="color:var(--ice);font-weight:700">Video coming soon</p><a class="btn" target="_blank" rel="noopener" href="https://www.youtube.com/results?search_query='+encodeURIComponent(title+' Philippines')+'">Watch on YouTube</a></div>';
        document.getElementById('mwatch').href=d.video?'https://www.youtube.com/watch?v='+d.video:'https://www.youtube.com/results?search_query='+encodeURIComponent(title+' Philippines');
        modal.classList.add('open');lastBtn=card.querySelector('.play');if(lenis)lenis.stop();document.getElementById('mclose').focus();
      }
      function closeM(){modal.classList.remove('open');mvid.innerHTML='';if(lenis)lenis.start();if(lastBtn)lastBtn.focus();}
      $('.acard').forEach(function(c){on(c.querySelector('.athumb'),'click',function(){openM(c);});});
      on(document.getElementById('mclose'),'click',closeM);
      on(modal,'click',function(e){if(e.target===modal)closeM();});
      on(document,'keydown',function(e){if(e.key==='Escape'&&modal.classList.contains('open'))closeM();});
      offs.push(function(){if(modal.classList.contains('open'))closeM();});

      // ripple cursor: a soft water ring follows the mouse, bigger double ripple on click/tap
      var rip=document.getElementById('ripples'),lastR=0;
      function ripple(x,y,big){
        for(var i=0;i<(big?2:1);i++){
          var d=document.createElement('i');d.className='rip';d.style.left=x+'px';d.style.top=y+'px';rip.appendChild(d);
          gsap.fromTo(d,{scale:.2,opacity:.8},{scale:big?9+i*4:5,opacity:0,duration:big?1.3:.9,delay:i*.12,ease:'power2.out',onComplete:function(){this.targets()[0].remove();}});
        }
      }
      if(!reduce){
        on(window,'pointermove',function(e){var now=performance.now();if(e.pointerType!=='mouse'||now-lastR<90)return;lastR=now;ripple(e.clientX,e.clientY,false);});
        on(window,'pointerdown',function(e){ripple(e.clientX,e.clientY,true);});
      }
      offs.push(function(){rip.innerHTML='';});

      // coral reef: sway, bubbles, and a rise-into-view parallax that sells the depth
      if(!reduce){
        $('.reef .sway').forEach(function(el,i){
          gsap.set(el,{transformOrigin:'50% 100%'});
          gate(gsap.to(el,{rotation:gsap.utils.random(2.5,5)*(i%2?1:-1),duration:gsap.utils.random(2.2,3.8),ease:'sine.inOut',yoyo:true,repeat:-1,delay:Math.random()*2}),'.reef');
        });
        gsap.fromTo('.reef-back',{y:70},{y:0,ease:'none',scrollTrigger:{trigger:'.reef',start:'top bottom',end:'bottom bottom',scrub:true}});
        gsap.fromTo('.reef-front',{y:130},{y:0,ease:'none',scrollTrigger:{trigger:'.reef',start:'top bottom',end:'bottom bottom',scrub:true}});
        gsap.fromTo('.reef-label',{opacity:0,y:20},{opacity:1,y:0,ease:'none',scrollTrigger:{trigger:'.reef',start:'top 85%',end:'top 45%',scrub:true}});
      }

      // preloader -> hero intro
      var pre = document.getElementById('preloader'), cnt = document.getElementById('count'), n={v:0};
      gsap.set('.hero-in',{y:40,opacity:0});
      if(lenis) lenis.stop();
      var tl = gsap.timeline({onComplete:function(){ pre.style.display='none'; if(lenis) lenis.start(); ScrollTrigger.refresh(); }});
      tl.to('#fill',{yPercent:0,y:0,duration:reduce?.3:2.4,ease:'power1.inOut',startAt:{yPercent:100}},0)
        .to('#fill .pw1',{xPercent:-50,duration:2.4,ease:'none'},0).fromTo('#fill .pw2',{xPercent:-50},{xPercent:0,duration:2.4,ease:'none'},0).to('#fill .pw3',{xPercent:-50,duration:2.4,ease:'power1.inOut'},0)
        .to('.pl-inner',{opacity:0,duration:.4},'+=.15')
        .to(pre,{opacity:0,duration:.9,ease:'power2.out'},'<.1')
        .to('.hero-in',{y:0,opacity:1,duration:.9,stagger:.14,ease:'power3.out'},'-=.35');
    });
  }

  // call destroy() when the page is torn down (or from a framework's unmount hook)
  function destroy(){
    if(!started) return; started=false;
    if(ctx) ctx.revert();               // kills tweens, timelines and ScrollTriggers made in the context
    offs.forEach(function(f){f();}); offs=[];
    if(tick) gsap.ticker.remove(tick);
    if(lenis) lenis.destroy();
    var box=document.getElementById('bubbles'); if(box) box.innerHTML='';
    ctx=lenis=tick=null;
  }

  window.AquaSave={init:init,destroy:destroy};
  if(document.readyState==='complete') init(); else window.addEventListener('load',init);
  window.addEventListener('pagehide',destroy);
})();
