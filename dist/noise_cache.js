class NoiseCache{constructor(e=.005,t=0,s=1){this.step=e,this.percentilesCache=new Map,this.seedStep=t,this.coef=s,this.colorPercentiles=[],e=.1;for(var r=0;r<=1;r+=e)this.colorPercentiles.push([this.getPercentile(r),this.getPercentile(r+e)])}get(e,t){return noise(e*this.step+this.seedStep,t*this.step+this.seedStep)*this.coef}getPercentile(e){e>1?e=1:e<0&&(e=0);var t=this.percentilesCache.get(e);if(t)return t;for(var s=[],r=0;r<=xBufferSize;r+=10)for(var i=0;i<=yBufferSize;i+=10)s.push(this.get(r,i));s.sort((function(e,t){return e-t}));var h=s[Math.floor((s.length-1)*e)];return this.percentilesCache.set(e,h),h}}