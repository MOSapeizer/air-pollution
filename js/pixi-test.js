var textureFactory = function(color){
	var circle = new PIXI.Graphics();
	circle.beginFill( color );
	circle.drawCircle(3, 3, 2);
	return circle.generateTexture( 3*3, PIXI.SCALE_MODES.DEFAULT);
}

var dust_float = function (width, height){

	var container = new PIXI.ParticleContainer();
	var renderer = new PIXI.WebGLRenderer(width, height, { "transparent": true });
	var dustGroup = [];
	var texture = textureFactory( 0x555555 );
	var dust_total = 1000;
	var count = 0;

	$("body").find(".dust-float").append( renderer.view ); 
		
	for (var i = dust_total - 1; i >= 0; i--) {
		
		var dust = new PIXI.Sprite( texture );
		dust.x = Math.random() * width;
		dust.y = Math.random() * height;

		dustGroup.push(dust);
		container.addChild( dust );
	}


	var animate = function(){
		var CheckPosition = function( dust ){
			if( dust.x > width )
				dust.x = 0;
		}
		for( var i = dust_total -1 ; i >= 0 ; i--  ){
			var dust = dustGroup[i];
			dust.x += Math.sin( Math.random() * 0.1 );
			CheckPosition(dust);
		}
		renderer.render( container );
		requestAnimationFrame(animate);
	}

	// start animating
	requestAnimationFrame( animate );
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