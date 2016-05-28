var textureFactory = function(radius, color, alpha){
	var circle = new PIXI.Graphics();
	circle.beginFill( color, alpha );
	circle.drawCircle(0, 0, radius);
	return circle.generateTexture( 10*10, PIXI.SCALE_MODES.DEFAULT);
}

var Dust = function(x, y, r, alpha=1){
	this.x = x;
	this.y = y;
	this.r = r;
	this.alpha = alpha;
}

var DustFloat = function(width, height, total){
	var DEFAULT_CIRCLE_SIZE = 10;
	this.group = [];

	for (var i = 0; i < total ; i++) {
		var x = Math.random() * width;
		var y = Math.random() * height;
		var r = Math.random() * DEFAULT_CIRCLE_SIZE;
		var dust = new Dust(x, y, r);
		this.group.push( dust );
	}
}

var DustCircle = function(width, height, total){
	var DEFAULT_CIRCLE_SIZE = 10;
	var CIRCLE = circleGroup();
	this.group = [];

	for (var i = 0; i < total ; i++) {
		var circle = CIRCLE(i);
		var x = circle.x;
		var y = circle.y;
		var r = Math.random() * DEFAULT_CIRCLE_SIZE;
		var dust = new Dust(x, y, r);
		this.group.push( dust );
	}
}

var DustPanel = function(width, height, total){
	// var texture_color = 0x303030;
	var texture = textureFactory( 10, 0x303030, 0.5 );
	var dust_float = new DustFloat(width, height, total);
	var dust_circle = new DustCircle(width, height, total);
	var instance = this;

	this.total = total;
	this.width = width;
	this.height = height;
	this.container = new PIXI.Container(15000, {"scale" : true, "alpha" : true});
	this.renderer = new PIXI.autoDetectRenderer(width, height, { transparent: true, resolution: 1 });
	this.group = [];
	this.circleGroup = circleGroup( width * 0.4, 
									height * 0.6, 0.7);
	this.circleSize = 10;
	
	for (var i = 0; i < this.total ; i++) {
		var dust = new PIXI.Sprite( texture );
		var r = dust_float.group[i].r;
		dust.x = dust_float.group[i].x;
		dust.y = dust_float.group[i].y;
		dust.width = r;
		dust.height = r;
		dust.alpha_angle = Math.random() * 3.14;
		dust.alpha = Math.sin(dust.alpha_angle);
		this.group.push(dust);
		this.container.addChild( dust );
	}

	$("body").find(".dust-float").append( this.renderer.view );

}

var DustAnimationControl = function( width, height ){

	var animation = this;
	var animate = null;
	var pause = false;

	this.dustPanel = new DustPanel(width, height, 1481); 
	this.playing = "Nothing";
	this.type = "";
	this.id = null;

	var channel = {"Float": float_animation.bind(this.dustPanel) };
	var playing_state_change = function(){
		return animation.playing != animation.type;
	}
	
	this.play = function(){
		if( !pause && animate && 'function' == typeof(animate)){
			animate();
			animation.id = requestAnimationFrame(animation.play);
		}
	}

	this.start = function( type ){
		if( playing_state_change() ){
			animation.playing = type;
			animation.type = type
			animate = channel[ type ];
			animation.play(); 
		}
	}

	this.resume = function(){ pause = false; }
	this.pause = function(){ pause = true; }
	this.stop = function(){
		animation.id && cancelAnimationFrame(animation.id);
		animate = null;
	}

}