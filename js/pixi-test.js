var textureFactory = function(radius, color, alpha){
	var circle = new PIXI.Graphics();
	circle.beginFill( color, alpha );
	circle.drawCircle(3, 3, radius);
	return circle.generateTexture( 3*3, PIXI.SCALE_MODES.DEFAULT);
}

var dust_float = function (width, height){

	var dustPanel = new DustPanel(container, width, height, 1000);
	var container = dustPanel.container;
	var renderer = dustPanel.renderer;

	$("body").find(".dust-float").append( renderer.view ); 
	
	dustPanel.group.forEach( function(dust){
		container.addChild( dust );
	});
	
	// start animating
	requestAnimationFrame( animateDust.bind( dustPanel ) );
}

var DustPanel = function(container, width, height, total){

	var texture = textureFactory( 2, 0x555555, 1 );

	this.width = width;
	this.height = height;
	this.container = new PIXI.ParticleContainer();
	this.renderer = new PIXI.WebGLRenderer(width, height, { "transparent": true });
	this.total = total;
	this.group = [];

	for (var i = this.total - 1; i >= 0; i--) {
		var dust = new PIXI.Sprite( texture );
		dust.x = Math.random() * width;
		dust.y = Math.random() * height;
		this.group.push(dust);
	}
}

var animateDust = function(){

	var width = this.width;
	var height = this.height;

	var updateDustInform = function( dust ){
		var radius = randomRadius(8);
		dust.x += randomPosition();
		dust.y += randomPosition();
		CheckPosition( dust );
		dust.height = radius;
		dust.width = radius;
		dust.alpha = randomAlpha();
	}

	var CheckPosition = function( dust ){
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
			scale = Math.random() * 0.2;
		var num = Math.random() * scale;
		return Math.sin( num );
	}

	var randomAlpha = function(){
		var RANGE_OF_PI = Math.random() * 3.14;
		var NUM_OF_SIN = Math.sin( RANGE_OF_PI );
		return Math.abs( NUM_OF_SIN );
	}

	for( var i = this.total -1 ; i >= 0 ; i--  ){
		var dust = this.group[i];
		updateDustInform( dust );
	}

	this.renderer.render( this.container );
	requestAnimationFrame( animateDust.bind(this) );
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