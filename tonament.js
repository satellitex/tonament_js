const WIDTH = 1200;
const HEIGHT = 900;
const L = 30;
const R = WIDTH - L;
const H = HEIGHT - 300;
const SH = 40;
const MOVEC = 20;

function readMember(){
    var value = document.getElementById('member').value.split(/\n/);
    console.log("readMember");
    for(var i = 0; i < value.length; i++ ){
        if( value[i] ){}
        else value[i] = 'ななし';
    }
    return value;
}

function Point(x,y){
    this.x = x;
    this.y = y;
    this.f = false;
    this.getX = function(){ return this.x; }
    this.getY = function(){ return this.y; }
}

function strT2Y(str){
    var ret = "";
    for( var i = 0; i < str.length; i+=2){
        ret += str[i];        
    }
    return ret;
}

function strY2T(str){
    var ret = "";
    for( var i = 0; i < str.length; i++){
        ret += str[i];
        ret += "\n";
    }
    return ret;
}

function shuffle(array) {
  var n = array.length, t, i;

  while (n) {
    i = Math.floor(Math.random() * n--);
    t = array[n];
    array[n] = array[i];
    array[i] = t;
  }

  return array;
}


function TonamentTable(member){
    this.num = member.length-1;
    this.n = 1;
    this.high = 1;
    while( this.n < this.num ) {
        this.n *= 2;
        this.high++;
    }
    this.members = [];
    this.pos = new Array(this.n*2);
    this.haba = H / this.high;
    
    this.init = function(l,r,h,y,id){
        var x = (l+r)/2;        
        this.pos[id] = new Point(x,y);
        if( h >= this.high ) return;
        this.init(l,(l+r)/2,h+1,y+this.haba,2*id+1);
        this.init((l+r)/2,r,h+1,y+this.haba,2*id+2);
    };
    this.init(L,R,1,SH,0);

    var ku = this.n - this.num;
    var ws = floor(this.n / ku);
    var kn = 0;

    this.calcX = function(postion){
        return postion.getX() - 10;
    }
    this.calcY = function(postion){
        return postion.getY()+this.haba;
    }

    shuffle( member );
    
    for( var i = 0,cnt = 0,kn = 0; cnt<this.n; cnt++){
        var x = this.calcX(this.pos[cnt+this.n-1]);
        var y = this.calcY(this.pos[cnt+this.n-1]);
        this.pos[cnt+this.n-1].f = true;
        console.log(x + " " + y);
        var mem;
        if( cnt % ws == 0 && kn < ku ) {
            mem = new MemberPlate(x,y,cnt,this.n,"seed");
            kn++;
        } else {
            mem = new MemberPlate(x,y,cnt,this.n,member[i]);
            i++;
        }
        this.members.push( mem );
    }

    //membes[i] を勝たせる
    this.win = function(i){
        var id = this.members[i].pos;
        id = floor((id-1)/2);
        this.pos[id].f = true;
        var x = this.calcX(this.pos[id]);
        var y = this.calcY(this.pos[id]);
        this.members[i].set(x,y);
        this.members[i].rankup();
        this.members[i].rankup();        
    }
    
    //相手がシードなら勝たせる
    if( this.n > 1 ){
        for( var i = 0; i < this.n; i+=2){
            var e = i + 1;
            console.log("i = " + i + " e = " + e);
            if( strT2Y(this.members[i].str) === "seed" ) {
                this.win(e);
            } else if( strT2Y(this.members[e].str) === "seed" ){
                this.win(i);
            }
        }
    }

    this.drawc = function(l,r,h,y,id){
        var x = (l+r)/2;
        var lx = (l + x) / 2;
        var rx = (r + x) / 2;
//        console.log( l + " " + r + " / 2 = " + x );
        line(x,y-this.haba,x,y);
        if( h >= this.high ) return;
        line(lx,y,rx,y);
        this.drawc(l,(l+r)/2,h+1,y+this.haba,2*id+1);
        this.drawc((l+r)/2,r,h+1,y+this.haba,2*id+2);
    };
    
    this.draw = function(){
        this.drawc(L,R,1,SH+this.haba,0);
        for(var i = 0; i < this.n; i++ ){
            this.members[i].draw();
        }
    }

    this.calc = function(){
        var winner = -1;
        for( var i = 0; i < this.n ; i++){
            //console.log("pos " + this.members[i].pos);
            if( this.members[i].pos == 0 ){
                winner = i;
            }
        }
        if( winner > -1 ){
            var pos = new Point((L+R)/2,SH);
            var x = this.calcX(pos);
            var y = pos.getY();
            //console.log( "winner " + winner + " x = "+ x + " y = " + y  );
            if( this.members[winner].mvf == 0 ){
                this.members[winner].rankup();
                this.members[winner].rankup();
                this.members[winner].rankup();
            }
            this.members[winner].set(x,y);
        }
        for( var i = 0; i < this.n ; i++){
            this.members[i].calc();
        }
    }

    this.touchMember = function(mx,my){
        //console.log( "mouse : " + mx + " , " + my );
        for( var i = 0; i < this.n; i++ ){
            if( this.members[i].checkP(mx,my) ){
                var ret = window.confirm( strT2Y(this.members[i].str) + " が勝ちましたか？" );
                if( ret ){
                    console.log(strT2Y(this.members[i].str) + " win!" );
                    var id = this.members[i].pos;
                    id = floor((id-1)/2);
                    if( this.pos[id].f ){
                        alert("すでに負けています。");
                    } else {
                        this.pos[id].f = true;
                        this.win(i);
                    }
                }
            }
        }
    }
    
}

function MemberPlate(x,y,id,nums,str){
    this.size = 16;
    this.w = 20;
    this.h = str.length*this.w;
    
    this.x = x;
    this.y = y;
    this.allnums = nums;
    this.id = id;
    this.pos = id + nums - 1;

    this.sx = x;
    this.sy = y;
    this.ex = x;
    this.ey = y;
    this.mvf = 0;
    this.count = 0;

    this.str = strY2T(str);

    this.set = function( x, y ){
        if( this.mvf == 1 ) return;
        this.ex = x; this.ey = y;
        this.count = 0;
        this.mvf = 1;
    }

    this.rankup = function(){
        this.x--;
        this.w++;
        this.size++;
        this.h = ( this.w + 7 )  * this.str.length;
    }

    this.calc = function() {
        if( this.mvf == 1 ){
            console.log("move " + this.ex + " , " + this.ey + " - " + this.x + " , " + this.y  );
            if( MOVEC/2 > this.count ){ 
                var h = (this.ey - this.sy);                
                // math.PI/2 : c = MOVEC/2 this.count
                var c = Math.PI * this.count / MOVEC;
                this.y = this.sy + h * sin(c);
            } else if( MOVEC > this.count ){
                var h = (this.ex - this.sx);       
                var c = Math.PI * (this.count-MOVEC/2) / MOVEC;
                this.y = this.ey;
                this.x = this.sx + h * sin(c);                
            } else {
                this.mvf = 0;
                this.sx = this.ex;
                this.sy = this.ey;
                this.x = this.ex;
                this.y = this.ey;
                if( this.pos == 0 ) this.pos = -1;
                this.pos = floor((this.pos-1)/2);
            }
            this.count++;
        }
    }
    
    this.draw = function() {        
        fill(255,255,255,255);
        rect( this.x, this.y, this.w, this.h);
        textSize(this.size);
        fill(0,0,0,255);
        textFont("Georgia");
        text( this.str, this.x+(this.w-this.size)/2, this.y, this.w , this.h);
    }

    this.checkP = function( mx, my ) {
        if( this.mvf == 1 ) return false;
        if( this.x < mx && mx < this.x + this.w &&
            this.y < my && my < this.y + this.h ) return true;
        return false;
    }    
}


var len;
var count;
var tonament;

function setup() {
    // uncomment this line to make the canvas the full size of the window
    createCanvas(WIDTH,HEIGHT);
    console.log(WIDTH+" "+HEIGHT);
    len = 0;
    count = 0;
}

function draw() {
    // draw stuff here
    // ellipse(width/2, height/2, 50, 50);
    rect(0,0,WIDTH-1,HEIGHT-1);
    
    var value = readMember();
    for( var i = 0; i < value.length; i ++ ){
//        console.log( value[i] );
    }
    if( len != value.length-1 ) {
        len = value.length-1;
        tonament = new TonamentTable(value);                
    }
    if( len > 0 ){
        tonament.calc();
        tonament.draw();        
    }
    count++;
}


function mousePressed(){
    if( len > 0 ){
        tonament.touchMember(mouseX,mouseY);
    }
}
