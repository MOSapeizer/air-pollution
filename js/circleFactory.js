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
			bitsRect[x][y] && points.push({ x: start.x + x * 10 * scale
										  , y: start.y + y * 10 * scale });
		}
	}

	var position = function(count, offset=0){
		return points[count - offset];
	}

	bitsRect = null;
	return position;
}

var circleGroup = function(x=450, y=600, scale=1){
	var point_size = 10 * scale;
	var PM2_5 = circleFactory( 1, { x: x, y: y }, scale );
	var PM10 = circleFactory( 4, { x: x + 2 * point_size , y: y - 5 * point_size }, scale ); 
	var hair = circleFactory( 24, { x: x + 4 * point_size, y: y - 28 * point_size }, scale ); 
	var sand = circleFactory( 36, {x: x + 30 * point_size , y: y - 40 * point_size}, scale );
	// var group = { "1" : PM2_5, "12": PM10, "448": hair, "1020": sand };

	var choice = function(index){
		if( index >= 0 && index < 1 ) return PM2_5(index - 0);
		if( index >= 1 && index < 13 ) return PM10(index - 1);
		if( index >= 13 && index < 461 ) return hair(index - 13);
		if( index >= 461 ) return sand(index - 461);
	}
	return choice;
}