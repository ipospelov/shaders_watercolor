let blobShader,curveShader,waveShader,paperShader;var buffer,myCanvas,xBufferSize=2e3,ratio=1.38,yBufferSize=xBufferSize*ratio;let pipelinePainter;function preload(){blobShader=loadShader("shaders/shader.vert","shaders/blob.frag"),curveShader=loadShader("shaders/shader.vert","shaders/curve.frag"),waveShader=loadShader("shaders/shader.vert","shaders/wave.frag"),paperShader=loadShader("shaders/shader.vert","shaders/paper.frag")}function setup(){var e,a;windowHeight/windowWidth>=ratio?(e=windowWidth,a=windowWidth*ratio):(e=windowHeight/ratio,a=windowHeight),(myCanvas=createCanvas(e,a)).id("mycanvas"),myCanvas.style("display","block"),buffer=createBuffer(e,a),frameRate(15),pipelinePainter=new PipelinePainter(buildPipeline())}function windowResized(){var e,a;windowHeight/windowWidth>=ratio?(e=windowWidth,a=windowWidth*ratio):(e=windowHeight/ratio,a=windowHeight),resizeCanvas(e,a),buffer.width=e,buffer.height=a,image(buffer,0,0)}function draw(){pipelinePainter.draw()}function keyTyped(){"s"===key&&save(buffer,"watercolor.png")}