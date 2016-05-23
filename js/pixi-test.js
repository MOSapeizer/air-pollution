var textureFactory = function(radius, color, alpha){
	var circle = new PIXI.Graphics();
	circle.beginFill( color, alpha );
	circle.drawCircle(0, 0, radius);
	return circle.generateTexture( 10*10, PIXI.SCALE_MODES.DEFAULT);
}

var bitmap = function( diameter ){

	var rectGenerator = function( length ){
		var rect = new Array( length );
		for( var i = 0 ; i < length ; i++  )
			rect[i] = new Array( length );
		return rect;
	}

	var Radius = function( x, y ){
		if( y === undefined )
			return Math.sqrt( x * x );
		return Math.sqrt( x * x + y * y );
	}

	var r = diameter / 2;
	var bitsRect = rectGenerator( diameter );

	for( var x = 0 ; x < diameter ; x++ ){
		for( var y = 0 ; y < diameter ; y++ ){
			// offset = 0.5;
			bitsRect[x][y] = (Radius(x + 0.5 - r, y + 0.5 - r) <= Radius( r ))? true : false;
		}
	}

	return bitsRect;
}

var circleFactory = function( radius, start, scale=1 ){

	var bitsRect = bitmap( radius );
	var points = [];

	for( var x = 0 ; x < radius ; x++ ){
		for( var y = 0 ; y < radius ; y++ ){
			if( bitsRect[x][y] )
				points.push({ "x": start.x + x * 10 * scale
							, "y": start.y + y * 10 * scale });
		}
	}

	var position = function(count, offset=0){
		return points[count - offset];
	}

	bitsRect = null;
	return position;
}

// circleGroup( 450, 600, 80 )
var circleGroup = function(x=450, y=600, scale=1){
	var point_size = 10 * scale;
	var PM2_5 = circleFactory( 1, { x: x, y: y }, scale );
	var PM10 = circleFactory( 4, { x: x + 2 * point_size , y: y - 5 * point_size }, scale ); 
	var hair = circleFactory( 24, { x: x + 4 * point_size, y: y - 28 * point_size }, scale ); 
	var sand = circleFactory( 36, {x: x + 30 * point_size , y: y - 40 * point_size}, scale );
	// var group = { "1" : PM2_5, "12": PM10, "448": hair, "1020": sand };

	var choice = function(index){
		if( index == 0 ) return [0, PM2_5];
		if( index == 1 ) return [1, PM10];
		if( index == 13 ) return [13, hair];
		if( index == 461 ) return [461, sand];
		return null;
	}
	return choice;
}

var dustAnimation = function( width, height ){

	var animate = null;
	var step = 100;

	var init_status = function(){
		if( this.animate_type == "Circle" && this.playing != "Nothing" ){
			save_old_status( this.dustPanel );
			init_circle( this.dustPanel );
		}
		if( this.animate_type == "Float" ){
			init_float( this.dustPanel );
		}
	}

	var save_old_status = function( dustPanel ){
		dustPanel.old_status = "saved";
		for( var i = dustPanel.total -1 ; i >= 0 ; i--  ){
			var dust = dustPanel.group[i];
			dust.OLD_X = dust.x;
			dust.OLD_Y = dust.y;
			dust.OLD_HEIGHT = dust.height;
			dust.OLD_WIDTH = dust.width;
			dust.OLD_ALPHA = dust.alpha;
		}
	}

	var init_circle = function( dustPanel ){
		for( var i = dustPanel.total -1 ; i >= 0 ; i--  ){
			var dust = dustPanel.group[i];
			dust.height = 5;
			dust.width = 5;
			dust.alpha = 1;
			dust.stepX = (dust.circleX - dust.x) / step;
			dust.stepY = (dust.circleY - dust.y) / step;
		}
	}

	var distanceRatio = function(circleX, circleY, x, y){
		circleR2 = circleX*circleX + circleY*circleY;
		r2 = x*x + y*y;
		var distanceX = circleX - x;
		var distanceY = circleY - y;
		var distanceR = Math.sqrt( distanceX*distanceX + distanceY*distanceY )
		if( circleR2 <= r2 )
			return  (distanceR / 100).toFixed() * -1;
		return (distanceR / 100).toFixed();
	}

	var init_float = function( dustPanel ){
		if( dustPanel.old_status == "saved" ){
			for( var i = dustPanel.total -1 ; i >= 0 ; i--  ){
				var dust = dustPanel.group[i];
				dust.height = dust.OLD_HEIGHT;
				dust.width = dust.OLD_WIDTH;
				dust.alpha = dust.OLD_ALPHA;
			}
		}
	}

	var playing_state_change = function(){
		return this.playing != this.animate_type;
	}

	this.dustPanel = new DustPanel(width, height, 1481); 
	this.float = floatDust.bind( this.dustPanel );
	this.circle = circlizeDust.bind( this.dustPanel );
	this.playing = "";
	this.animate_type = "";
	this.requestID = null;

	this.play = function(){
		if( animate != null && typeof(animate) === 'function' ){
			animate();
			this.requestID = requestAnimationFrame( this.play.bind(this) );
		}
	}

	this.start = function( animation ){
		if( this.playing != this.animate_type ){
			this.stop();
			init_status.call(this);
			animate = animation;
			if( this.playing == "Nothing" || this.animate_type == "Nothing" ){
				toggleHideContainer.call( this.dustPanel );
			}
			this.playing = this.animate_type;
			this.play.call(this); 
		}
	}

	this.hide = function(){
	}

	this.stop = function(){
		if( this.requestID )
			cancelAnimationFrame(this.requestId);
		animate = null;
	}

}

var DustPanel = function(width, height, total){

	var texture = textureFactory( 10, 0x303030, 0.5 );
	var circle = null;

	this.width = width;
	this.height = height;
	this.container = new PIXI.ParticleContainer(15000, {"scale" : true, "alpha" : true});
	this.renderer = new PIXI.autoDetectRenderer(width, height, { "transparent": true, "resolution": 1 });
	this.total = total;
	this.group = [];
	this.old_status = "unsaved";
	this.circleGroup = circleGroup(width * 0.4, height * 0.6, 0.7);
	this.circleSize = 10;
	
	for (var i = 0; i < this.total ; i++) {
		var dust = new PIXI.Sprite( texture );
		circle = this.circleGroup(i) || circle;
		dust.x = Math.random() * width;
		dust.y = Math.random() * height;
		dust.circleX = circle[1](i, circle[0]).x;
		dust.circleY = circle[1](i, circle[0]).y;
		dust.angle = Math.random() * 10;
		dust.default_radius = Math.random() * 10
		dust.width = dust.height = dust.default_radius;
		this.group.push(dust);
		this.container.addChild( dust );
	}

	circle = null;
	// this sholud be more flexible
	$("body").find(".dust-float").append( this.renderer.view ); 
}

var toggleHideContainer = function(){
	this.container.visible = !this.container.visible;
	this.renderer.render( this.container );
	return this.container.visible;
}

var circlizeDust = function(){

	var updateDustInform = function( dust ){
		approach_position(dust, dust.circleX, dust.circleY);
	}

	for( var i = this.total -1 ; i >= 0 ; i--  ){
		var dust = this.group[i];
		updateDustInform( dust );
	}

	this.renderer.render( this.container );
	
}

var approach_position = function( dust, endX, endY, scale=1 ){

	var isArrived = function( now, end ){
		return now.toFixed(2) == end.toFixed(2);
	}

	var isArround = function( now, end, step ){
		var base = 1;
		var blur = Math.abs( base*dust.stepY )
		var distance = Math.abs( end - now );
		return distance <= blur;
	}

	if( endX == null || endY == null )
		return true;

	if( !isArrived( dust.x, endX ) ){
		if( isArround( dust.x, endX, dust.stepX ) )
			dust.x = endX;
		else
			dust.x += dust.stepX * scale;
	}
	if( !isArrived( dust.y, endY ) ){
		if( isArround( dust.y, endY, dust.stepY ) )
			dust.y = endY;
		else
			dust.y += dust.stepY * scale;
	}
	return isArrived( dust.x, endX ) && isArrived( dust.y, endY );
}

var floatDust = function(){

	var width = this.width;
	var height = this.height;

	var updateDustInform = function( dust ){
		dust.x += randomPosition();
		dust.y += randomPosition();
		changeAlpha( dust );
		CheckOutBound( dust );
	}

	var changeScale = function( dust ){
		var scale = dust.angle * 50;
		dust.width += SinAlpha( scale );
		dust.height += SinAlpha( scale );
	}

	var changeAlpha = function( dust ){
		if( dust.alpha >= 1 )
			dust.alpha = 1;
		else if( dust.alpha <= 0.3 )
			dust.alpha = 0.3;
		dust.angle += 0.01;
		dust.alpha += SinAlpha( dust.angle );
	}

	var CheckOutBound = function( dust ){
		if( dust.x > width )
			dust.x = Math.random() * width;
		if( dust.y > height ){
			dust.y = Math.random() * height;
		}
	}

	var randomRadius = function( base ){
		return base * Math.random();
	}

	var randomPosition = function( scale ){
		if( scale === undefined )
			scale = Math.random() * 0.4;
		var num = Math.random() * scale;
		return Math.sin( num );
	}

	var SinAlpha = function( ANGLE ){
		var NUM_OF_SIN = Math.sin( ANGLE );
		return NUM_OF_SIN;
	}

	var step = 0;
	
	for( var i = this.total -1 ; i >= 0 ; i--  ){
		var dust = this.group[i];
		if( dust.OLD_X && dust.OLD_Y ){
			if( step == 80 || approach_position( dust, dust.OLD_X, dust.OLD_Y, 0.1 ))
				dust.OLD_X = dust.OLD_Y = null;
			step++;
		}
		if( !dust.OLD_X && !dust.OLD_Y )
			updateDustInform( dust );
	}

	this.renderer.render( this.container );
}


var flyingDust = function() {
	var dataset = [];
	for (var i = 0; i < 100; i++) {
	    dataset.push(Math.random() * ( width + 500));
	}

	d3.select('svg')
			.append("g")
    .selectAll("circle")
    .data( dataset )
    .enter()
    .append("circle")
    .style('opacity', 0)
    .attr("cx", function (d) { return d; })
    .attr({ 
    	"cy": function (d) { return (Math.random() * 800); },
      "r":  function (d) { return 2; },
      "fill": "black" })
    .transition("slide-in")
    .duration(2000)
    .style('opacity', 0.6)
    .transition("flying-out")
    .duration(function (d) { return 1000 * 25; })
    .attr("cx", width + 1000);
}