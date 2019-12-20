//グローバル変数
let c;
let q = new qtnIV();
let qt = q.identity(q.create());

window.onload = () =>{
  
  //canvasの初期化
  c = document.getElementById("canvas");
  
  c.width  = 500;
  c.height = 300;
  
  const gl = c.getContext("webgl");
  
  c.addEventListener('mousemove', mouseMove, true);
  
  
  //シェーダオブジェクトの作成
  const v_shader = create_shader('vs');
  const f_shader = create_shader('fs');
  
  //頂点シェーダとフラグメントシェーダをリンク
  const prg = create_program(v_shader, f_shader);
  
  //AttribLocationの取得
  const attLocation = new Array(3);
  attLocation[0] = gl.getAttribLocation(prg, 'position');
  attLocation[1] = gl.getAttribLocation(prg, 'normal');
  attLocation[2] = gl.getAttribLocation(prg, 'color');
  
  
  //頂点属性の設定
  const attStride = new Array(3);
  attStride[0] = 3;
  attStride[1] = 3;
  attStride[2] = 4;
  
  
  //白い立方体作成(Position, Length, R, G, B, A)
  const white_cube = create_cube(-1.5, 3.0, 1.0, 1.0, 1.0, 1.0);
  
  //white_cbueのvboとibo生成
  const wpos_vbo = create_vbo(white_cube.p);
  const wnor_vbo = create_vbo(white_cube.n);
  const wcol_vbo = create_vbo(white_cube.c);
  const wVBOList = [wpos_vbo, wnor_vbo, wcol_vbo];
  const wibo = create_ibo(white_cube.i);
  
  
  //青い立方体を作成(以下ry)
  const blue_cube = create_cube(-1.0, 2.0, 0.0, 0.0, 1.0, 1.0);
  
  //blue_cubeのvboとiboの生成
  const bpos_vbo = create_vbo(blue_cube.p);
  const bnor_vbo = create_vbo(blue_cube.n);
  const bcol_vbo = create_vbo(blue_cube.c);
  const bVBOList = [bpos_vbo, bnor_vbo, bcol_vbo];
  const bibo = create_ibo(blue_cube.i);
  
  
  //赤い立方体を作成(ry
  const red_cube = create_cube(-1.0, 2.0, 1.0, 0.0, 0.0, 1.0);
  
  //red_cubeのvboとiboの作成
  const rpos_vbo = create_vbo(red_cube.p);
  const rnor_vbo = create_vbo(red_cube.n);
  const rcol_vbo = create_vbo(red_cube.c);
  const rVBOList = [rpos_vbo, rnor_vbo, rcol_vbo];
  const ribo = create_ibo(red_cube.i);
  
  //UniformLocationの取得
  const uniLocation = new Array();
  uniLocation[0] = gl.getUniformLocation(prg, 'mvpMatrix');
  uniLocation[1] = gl.getUniformLocation(prg, 'invMatrix');
  uniLocation[2] = gl.getUniformLocation(prg, 'lightDirection');
  uniLocation[3] = gl.getUniformLocation(prg, 'eyeDirection');
  uniLocation[4] = gl.getUniformLocation(prg, 'ambientColor');
  uniLocation[5] = gl.getUniformLocation(prg, 'vertexAlpha');
  uniLocation[6] = gl.getUniformLocation(prg, 'blender');
  
  const m = new matIV();
  
  //行列初期化
  let mMatrix = m.identity(m.create());
  let vMatrix = m.identity(m.create());
  let pMatrix = m.identity(m.create());
  let mvpMatrix = m.identity(m.create());
  let tmpMatrix = m.identity(m.create());
  let invMatrix = m.identity(m.create());
  
  //平行光源
  const lightDirection = [-1.5, 1.5, 1.5];

  //環境光
  const ambientColor = [0.1, 0.1, 0.1, 1.0];

  //視点ベクトル
  const eyeDirection = [0.0, 0.0, 20.0];
  
  const vertexAlpha = 0.3;
  
  //ビューとプロジェクション座標設定
  m.lookAt(eyeDirection, [0, 0, 0], [0, 1, 0], vMatrix);
  m.perspective(45, c.width / c.height, 0.1, 100, pMatrix);
  
  //初期の座標を設定
  m.multiply(pMatrix, vMatrix, tmpMatrix);
  
  //深度テスト有効
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  
  //カウンター初期化
  let count = 0;
  
  const userAgent = window.navigator.userAgent;
  
  //アニメーション用
  const counter = () => {
    
    blend_type(2);
    if(userAgent.indexOf('Firefox') != -1) {
      blend_type(2);
    }else{
      blend_type(0);
    }
    
    //画面の初期化
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  
    count++;
    
    let rad = (count % 360) * Math.PI / 180;
    let tx = Math.cos(rad) * 7.5;
    let ty = 0;
    let tz = Math.sin(rad) * 7.5;
    
    let qMatrix = m.identity(m.create());
    q.toMatIV(qt, qMatrix);
    
    //white_cubeのvboとiboをバッファに登録
    set_attribute(wVBOList, attLocation, attStride);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,wibo);
    
    m.identity(mMatrix);
    m.multiply(mMatrix, qMatrix, mMatrix);
    m.rotate(mMatrix, -rad, [0, 1, 0], mMatrix);
    m.multiply(tmpMatrix, mMatrix, mvpMatrix);
    m.inverse(mMatrix,invMatrix);
    
    gl.disable(gl.BLEND);
    
    gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
    gl.uniformMatrix4fv(uniLocation[1], false, invMatrix);
    gl.uniform3fv(uniLocation[2], lightDirection);
    gl.uniform3fv(uniLocation[3], eyeDirection);
    gl.uniform4fv(uniLocation[4], ambientColor);
    gl.uniform1i(uniLocation[6], false);
    gl.drawElements(gl.TRIANGLES,white_cube.i.length, gl.UNSIGNED_SHORT, 0);
    
    
    //blue_cubeのvboとiboをバッファに登録
    set_attribute(bVBOList, attLocation, attStride);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,bibo);
    
    m.identity(mMatrix);
    m.multiply(mMatrix, qMatrix, mMatrix);
    m.translate(mMatrix,[tx,ty,tz], mMatrix);
    m.multiply(tmpMatrix, mMatrix, mvpMatrix);
    m.inverse(mMatrix,invMatrix);
    
    gl.disable(gl.BLEND);
    
    gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
    gl.uniformMatrix4fv(uniLocation[1], false, invMatrix);
    gl.uniform1i(uniLocation[6], false);
    gl.drawElements(gl.TRIANGLES,blue_cube.i.length, gl.UNSIGNED_SHORT, 0);
    
    
    //red_cubeのvboとiboをバッファに登録
    set_attribute(rVBOList, attLocation, attStride);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ribo);

    m.identity(mMatrix);
    m.multiply(mMatrix, qMatrix, mMatrix);
    m.translate(mMatrix,[-tx,ty,-tz], mMatrix);
    m.multiply(tmpMatrix, mMatrix, mvpMatrix);

    gl.enable(gl.BLEND);

    gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
    gl.uniform1f(uniLocation[5], vertexAlpha);
    gl.uniform1i(uniLocation[6], true);
    gl.drawElements(gl.TRIANGLES,red_cube.i.length, gl.UNSIGNED_SHORT, 0);
    
    gl.flush();
    
    requestAnimationFrame(counter);
  };
  
  counter();

//シェーダ読み込み
function create_shader(id){
  let shader;
  
  const scriptElement = document.getElementById(id);
  
  if(!scriptElement){return;}
  
  switch(scriptElement.type){
    case 'x-shader/x-vertex':
      shader = gl.createShader(gl.VERTEX_SHADER);
      break;
      
    case 'x-shader/x-fragment':
      shader = gl.createShader(gl.FRAGMENT_SHADER);
      break;
      
    default :
      return;
         
  }
  
  gl.shaderSource(shader, scriptElement.text);
  
  gl.compileShader(shader);
  
  if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
    return shader;   
  }else {
    alert(gl.getShaderInfoLog(shader));
  }
}

//プログラムオブジェクトの生成
function create_program(vs, fs){
  let program = gl.createProgram();
  
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  
  if(gl.getProgramParameter(program,gl.LINK_STATUS)){
    
    gl.useProgram(program);
    return program;
  }else {
    alert(gl.getProgramInfoLog(program));
  }
}

//vboの生成
function create_vbo(data){
  const vbo = gl.createBuffer();
  
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  
  return vbo;
}

//iboの生成
function create_ibo(data){
  const ibo = gl.createBuffer();
  
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ibo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);
 
  return ibo;
}
  
//vboの登録
function set_attribute(vbo, attL, attS){
  for(let i in vbo){
    gl.bindBuffer(gl.ARRAY_BUFFER,vbo[i]);
    gl.enableVertexAttribArray(attL[i]);
    gl.vertexAttribPointer(attL[i], attS[i], gl.FLOAT, false, 0, 0);
  }
}

//立方体作成  
function create_cube(pos, l, r, g, b, a){
  const cPos = new Array(), cInd = new Array(), cCol = new Array(), cNor = new Array();
  let cx, cy, cz;
  
  //VBO生成
  for(let i=0; i<=5; i++){ 
    if(i == 0 || i == 1){  //front&back
      for(let j=0; j<=3; j++){
        if(j % 2 == 0){
          cx = pos; 
        }else {
          cx = pos + l;
        }
        
        if(j <= 1){
          cy = pos + l;
        }else{
          cy = pos;
        }
        
        if(i == 0){
          cz = pos + l;
        }else{
          cz = pos;
        }
        
        cPos.push(cx, cy, cz);
      }
        
    }else if(i == 2 || i == 3){  //top&bottom
      for(let j=0; j<=3; j++){
        if(j % 2 == 0){
          cx = pos;
        }else{
          cx = pos + l; 
        }
        
        if(i == 2){
          cy = pos + l;
        }else{
          cy = pos;
        }
        
        if(j <= 1){
          cz = pos + l;
        }else{
          cz = pos;
        }
        
        cPos.push(cx, cy, cz);
      }
      
    }else if(i == 4 || i == 5){  //right&left
      for(let j=0; j<=3; j++){
        if(i == 4){
          cx = pos + l;
        }else{
          cx = pos;
        }
        
        if(j % 2 == 0){
          cy = pos;
        }else{
          cy = pos + l; 
        }
        
        if(j <= 1){
          cz = pos;
        }else{
          cz = pos + l;
        }
        
        cPos.push(cx, cy, cz);
      }
    }
  }
  
  //カラーバッファ作成
  for(let i=0; i<=5; i++){
    for(let j=0; j<=3; j++){
      cCol.push(r, g, b, a);
    }
  }
  
  //法線座標生成
  for(let i=0; i<=5;i++){
    for(let j=0; j<=3;j++){
      if(i == 0){
        cNor.push((pos + (pos + l)) / 2, (pos + (pos + l)) / 2, pos + l);
      }else if(i == 1){
        cNor.push((pos + (pos + l)) / 2, (pos + (pos + l)) / 2, pos);
      }else if(i == 2){
        cNor.push((pos + (pos + l)) / 2, pos + l, (pos + (pos + l)) / 2);
      }else if(i == 3){
        cNor.push((pos + (pos + l)) / 2, pos, (pos + (pos + l)) / 2);
      }else if(i == 4){
        cNor.push(pos + l, (pos + (pos + l)) / 2, (pos + (pos + l)) / 2);
      }else if(i == 5){
        cNor.push(pos, (pos + (pos + l)) / 2, (pos + (pos + l)) / 2);
      }
    }
  }
  
  //index設定
  for(let i=0; i<=20; i+=4){
    cInd.push(i, i+1, i+2);
    cInd.push(i+1, i+2, i+3);
  }
  
  return {p : cPos, c : cCol, n : cNor, i : cInd};
}
  
  
function blend_type(prm){
  switch(prm){
    //透過処理
    case 0:
      gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.SRC_COLOR, gl.ONE_MINUS_SRC_COLOR);
      break;
    //加算合成
    case 1:
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      break;
    //透過処理(Firefox用)
    case 2:
      gl.blendFuncSeparate(gl.ONE_MINUS_SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE);
      break;
    default:
      break;
  }
}
  
};

const mouseMove = (e) =>{
  const cw = c.width;
  const ch = c.height;
  
  //canvasのx,y座標正規化
  const wh = 1 / Math.sqrt(cw * cw + ch * ch);
  
  let x = e.clientX - c.offsetLeft - cw * 0.5;
  let y = e.clientY - c.offsetTop  - ch * 0.5;
  
  //マウスのx,y座標正規化
  let sq = Math.sqrt(x * x + y * y);
  
  //ラジアン(クォータニオン用回転軸)取得
  let r = sq * 2.0 * Math.PI * wh;
  
  if(sq != 1){
    sq = 1 / sq;
    x *= sq;
    y *= sq;
  }
  q.rotate(r, [y, x, 0.0], qt);
}








