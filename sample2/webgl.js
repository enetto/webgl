//グローバル変数
let c;

window.onload = () => {
  c = document.getElementById('canvas');
  c.width = 1500;
  c.height = 1000;

  const gl = c.getContext('webgl2');

  // 頂点シェーダとフラグメントシェーダの生成
  const v_shader = create_shader('vs');
  const f_shader = create_shader('fs');
  
  // プログラムオブジェクトの生成とリンク
  const prg = create_program(v_shader, f_shader);
  
  // attributeLocationの取得
  const attLocation = new Array(2);
  attLocation[0] = 0;
  attLocation[1] = 1;
  
  // attributeの要素数
  const attStride = new Array(2);
  attStride[0] = 3;
  attStride[1] = 4;
  
  // モデル(頂点)データ
  const vertex_position = [
       0.0, 1.0, 0.0,
       1.0, 0.0, 0.0,
      -1.0, 0.0, 0.0
  ];

  // 頂点の色情報を格納する配列
  const vertex_color = [
      1.0, 0.0, 0.0, 1.0,
      0.0, 1.0, 0.0, 1.0,
      0.0, 0.0, 1.0, 1.0
  ];

  //インデックス
  let index =[0, 1, 2];

  //VAOの生成
  const triangle_vao = create_vao([vertex_position, vertex_color], attStride, attLocation, index);

  //白い立方体の作成
  const white_cube = create_cube(-1.5, 3.0, 1.0, 1.0, 1.0, 1.0);
  const white_cube_vao = create_vao([white_cube.p, white_cube.c], attStride, attLocation, white_cube.i);

  // minMatrix.js を用いた行列関連処理
    // matIVオブジェクトを生成
    const m = new matIV();
    
    // 各種行列の生成と初期化
    let mMatrix = m.identity(m.create());
    let vMatrix = m.identity(m.create());
    let pMatrix = m.identity(m.create());
    let mvpMatrix = m.identity(m.create());
    let tmpMatrix = m.identity(m.create());
    
    // ビュー座標変換行列
    m.lookAt([0.0, 0.0, 20.0], [0, 0, 0], [0, 1, 0], vMatrix);
    
    // プロジェクション座標変換行列
    m.perspective(45, c.width / c.height, 0.1, 100, pMatrix);
    
    // 各行列を掛け合わせ座標変換行列を完成させる
    m.multiply(pMatrix, vMatrix, tmpMatrix);
    
    // uniformLocationの取得
    const uniLocation = gl.getUniformLocation(prg, 'mvpMatrix');

    let count = 0;

    const counter = () =>{

      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clearDepth(1.0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      count++;

      let rad = (count % 360) * Math.PI / 180;
      let tx = Math.cos(rad) * 7.5;
      let ty = 0;
      let tz = Math.sin(rad) * 7.5;

      //vaoの生成
      //gl.bindVertexArray(triangle_vao);
      gl.bindVertexArray(white_cube_vao);

      m.identity(mMatrix);
      m.rotate(mMatrix, -rad, [0, 1, 0], mMatrix);
      m.multiply(tmpMatrix, mMatrix, mvpMatrix);

      // uniformLocationへ座標変換行列を登録
      gl.uniformMatrix4fv(uniLocation, false, mvpMatrix);
    
      // モデルの描画
      gl.drawElements(gl.TRIANGLES, white_cube.i.length, gl.UNSIGNED_SHORT, 0);
    
      // コンテキストの再描画
      gl.flush();
      requestAnimationFrame(counter);
    }

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

  //vaoの生成
  function create_vao(data, attS, attL, ibodata){
    let vao, vbo, ibo, i;
    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    for(i in data){
      vbo = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data[i]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(attL[i]);
      gl.vertexAttribPointer(attL[i], attS[i], gl.FLOAT, false, 0, 0);
    }

    if(ibodata){
      ibo = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ibo);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(ibodata), gl.STATIC_DRAW);
    }

    gl.bindVertexArray(null);
    return vao;
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

};