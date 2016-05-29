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
	this.alpha_angle = Math.random() * 3.14;
}

var DustFloat = function(width, height, total){
	var DEFAULT_CIRCLE_SIZE = 10;
	this.group = [];

	for (var i = 0; i < total ; i++) {
		var x = Math.random() * width;
		var y = Math.random() * height;
		var r = Math.random() * DEFAULT_CIRCLE_SIZE;
		var a = Math.random();
		var dust = new Dust(x, y, r, a);
		this.group.push( dust );
	}
}

var DustCircle = function(width, height, total){
	var DEFAULT_CIRCLE_SIZE = 10;
	var CIRCLE = circleGroup(width / 3, height * 0.7);
	this.group = [];

	for (var i = 0; i < total ; i++) {
		var circle = CIRCLE(i);
		var x = circle.x;
		var y = circle.y;
		var r = DEFAULT_CIRCLE_SIZE;
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
	this.renderer = new PIXI.CanvasRenderer(width, height, 
												{ transparent: true,
											 	  resolution: 1,
											 	  autoResize: true });
	this.group = [];
	this.origin_group = dust_float.group;
	this.update = function(){ instance.renderer.render(instance.container); }
	this.circleGroup = dust_circle;
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
	var tween_animation;
	var tween_step = 0;
	var animate = null;
	var pause = false;

	this.dustPanel = new DustPanel(width, height, 1481); 
	this.playing = "Nothing";
	this.type = "";
	this.id = null;

	var channel = { "Float": float_animation.bind(this.dustPanel),
					"Circle": float_to_circle_animation.bind(this.dustPanel),
					"Nothing": hide_container.bind(this.dustPanel) };
	this.tween_channel = { "Circle_To_Float": tween_cirlce_to_float,
						   "Float_To_Circle": null,
						   "Nothing_To_Float": show_container,
						   "Float_To_Nothing": hide_container,
						   "Nothing_To_Circle": show_container, 
						   "Circle_To_Nothin": hide_container }
	var playing_state_change = function( type ){
		return animation.playing != type;
	}
	
	this.play = function(){
		if( !pause && animate && 'function' == typeof(animate)){
			animate();
			animation.id = requestAnimationFrame(animation.play);
		}
	}

	this.start = function( type ){
		if( playing_state_change(type) ){
			var tmp = animation.playing + "_To_" + type;
			console.log(tmp);
			var tween_type = animation.tween_channel[ tmp ];
			animation.setTween(tween_type);
			animation.playing = type;
			animation.type = type;
			animate = channel[ type ];
			tween_animation && animation.tween();
			!tween_animation && animation.play(); 
		}
	}

	this.setTween = function( tween_type ){
		if( !tween_type )
			return null;
		tween_step = 30;
		tween_animation = tween_type.bind(animation.dustPanel);
	}

	this.tween = function(){
		tween_animation();
		if( tween_step-- <= 0){
			(tween_animation = null) && (tween_step = 0);
			animation.play();
			return null;
		}
		// animation.dustPanel.update();
		animation.id = requestAnimationFrame(animation.tween);
	}

	this.resume = function(){ pause = false; }
	this.pause = function(){ pause = true; }
	this.stop = function(){
		animation.id && cancelAnimationFrame(animation.id);
		animate = null;
	}

}