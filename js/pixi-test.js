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

var dustAnimation = function( width, height ){

	var animate = null;
	var step = 100;

	var init_status = function(){
		if( this.animate_type == "Circle" ){
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
			dust.height = 10;
			dust.width = 10;
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

	this.dustPanel = new DustPanel(width, height, 1481); 
	this.float = floatDust.bind( this.dustPanel );
	this.circle = circlizeDust.bind( this.dustPanel );
	this.playing = "";
	this.animate_type = "";

	this.play = function(){
		if( animate != null && typeof(animate) === 'function' ){
			animate();
			requestAnimationFrame( this.play.bind(this) );
		}
	}

	this.start = function( animation ){
		if( this.playing != this.animate_type ){
			init_status.call(this);
			animate = animation;
			this.playing = this.animate_type;
			this.play.call(this); 
		}
	}

	this.stop = function(){
		animate = null;
	}

}

var DustPanel = function(width, height, total){

	var texture = textureFactory( 10, 0x303030, 0.5 );
	var sand = bitmap( 36 );
	var hair = bitmap( 24 );
	var PM10 = bitmap( 4 );
	var PM2_5 = bitmap( 1 )

	var add_circle_position = function( bitsRect, count, start ){
		for( var x = 0 ; x < bitsRect.length ; x++ ){
			for( var y = 0 ; y < bitsRect[x].length ; y++ ){
				if( bitsRect[x][y] ){
					var dust = this.group[count++];
					dust.circleX = start.x + x * 10;
					dust.circleY = start.y + y * 10;
				}
			}
		}
		return count;
	}

	this.width = width;
	this.height = height;
	this.container = new PIXI.ParticleContainer(15000, {"scale" : true, "alpha" : true});
	this.renderer = new PIXI.WebGLRenderer(width, height, { "transparent": true });
	this.total = total;
	this.group = [];
	this.old_status = "unsaved"

	for (var i = this.total - 1; i >= 0; i--) {
		var dust = new PIXI.Sprite( texture );
		dust.x = Math.random() * width;
		dust.y = Math.random() * height;
		dust.circleX = dust.circleY = 0;
		dust.angle = Math.random() * 10;
		dust.default_radius = Math.random() * 10
		dust.width = dust.height = dust.default_radius;
		this.group.push(dust);
		this.container.addChild( dust );
	}

	// this sholud be more flexible
	var index = 0;
	var baseX = 450;
	var baseY = 500;
	var gate = 100;
	index = add_circle_position.call(this, PM2_5, index, { x: baseX, y: 500 } );
	index = add_circle_position.call(this, PM10, index, { x: baseX + 1 * gate + 4 * 10 , y: baseY - 3 * 10 } );
	index = add_circle_position.call(this, hair, index, { x: baseX + 2 * gate + 8 * 10, y: baseY - 23 * 10 } );
	index = add_circle_position.call(this, sand, index, {x: baseX + 3 * gate + 32 * 10 , y: baseY - 35 * 10} );

	// this sholud be more flexible
	$("body").find(".dust-float").append( this.renderer.view ); 
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
		return now.toFixed(2) != end.toFixed(2);
	}

	var isArround = function( now, end, step ){
		var base = 1;
		var blur = Math.abs( base*dust.stepY )
		var distance = Math.abs( end - now );
		return distance <= blur;
	}

	if( endX == null || endY == null )
		return true;

	if( isArrived( dust.x, endX ) ){
		if( isArround( dust.x, endX, dust.stepX ) )
			dust.x = endX;
		else
			dust.x += dust.stepX * scale;
	}
	if( isArrived( dust.y, endY ) ){
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
		// changeScale( dust );
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
			dust.x = 0;
		if( dust.y > height ){
			dust.y = 0;
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

	for( var i = this.total -1 ; i >= 0 ; i--  ){
		var dust = this.group[i];
		if( approach_position( dust, dust.OLD_X, dust.OLD_Y, 0.1 ) );
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