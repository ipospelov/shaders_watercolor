class LeafPainter{constructor(e,t,n,r,s,a,i){Object.assign(this,{x0:e,y0:t,x1:n,y1:r,n:s,colors:a,uniforms:i}),this.nCurrent=0}draw(){if(this.nCurrent>=this.n)return 0;if(outOfScene(this.x0,this.y0)&outOfScene(this.x1,this.y1))return 0;let[e,t]=this.colors,n={...this.uniforms,u_seed:fxrand()};return drawCurve(this.x0,this.y0,this.x1,this.y1,e,t,n),this.nCurrent++,1}}class LeafLinePainter extends NestedPainter{constructor(e,t,n,r,s,a,i,o){super();let d=e,u=t,[c,h]=getDecart(n,r);for(let e=0;e<s;e++){let e=d+c,t=u+h,n=new LeafPainter(d,u,e,t,a,i,o);this.painters.push(n),d=e,u=t}}}class LeafFlowerPainter extends NestedPainter{constructor(e,t,n,r,s,a,i,o,d,u={}){super(),n=degreeToRadian(n);let c=((r=degreeToRadian(r))-n)/max(1,a);for(let r=0;r<a;r++){let a=new LeafLinePainter(e,t,s,n+c*r,i,o,d,u);this.painters.push(a)}}}class LeafFlowerMarginPainter extends NestedPainter{constructor(e,t,n,r,s,a,i,o,d,u={}){super(),n=degreeToRadian(n);let c=((r=degreeToRadian(r))-n)/max(1,i);for(let r=0;r<i;r++){let i=s+fxRandRanged(.3*-s,.3*s),h=a+fxRandRanged(.3*-a,.3*a),l=n+c*r,[f,p]=getDecart(i,l),[x,L]=getDecart(i+h,l);f+=e,p+=t,x+=e,L+=t;let P=new LeafPainter(f,p,x,L,o,d,u);this.painters.push(P)}}}class LeafOnLinePainter extends NestedPainter{constructor(e,t,n,r,s){super(),this.painters.push(new LinePainter(e,t,e,n,r,s));let a=Math.abs(t-n),i=fxRandRanged(.1*a,.3*a);this.painters.push(new LeafPainter(e,n,e,n-i,17,r,s))}}class ManyLeafOnLinePainter extends NestedPainter{constructor(e,t,n,r,s,a,i){super();for(let o=0;o<a;o++){let a=e+symmetricalRand(r),o=n+symmetricalRand(s),d=randomFromRange(palettes[0]),u=new LeafOnLinePainter(a,t,o,d,i);this.painters.push(u)}}}