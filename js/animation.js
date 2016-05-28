var float_animation = function(){

	var width = this.width;
	var height = this.height;

	var updateDustInform = function( dust ){
		dust.x += randomDistance();
		dust.y += randomDistance();
		change_alpha( dust );
		check_if_out_of_bound( dust );
	}

	var change_alpha = function( dust ){
		if( dust.alpha >= 1 )
			dust.alpha = 1;
		else if( dust.alpha <= 0.3 )
			dust.alpha = 0.3;
		dust.alpha_angle += 0.01;
		dust.alpha = sin( dust.alpha_angle );
	}

	var changeScale = function( dust ){
		var scale = dust.alpha_angle * 50;
		dust.width += SinAlpha( scale );
		dust.height += SinAlpha( scale );
	}

	var check_if_out_of_bound = function( dust ){
		(dust.x > width) && (dust.x = Math.random() * width);
		(dust.y > height) && (dust.y = Math.random() * height);
		(dust.alpha_angle >= 3.14) && (dust.alpha_angle = 0);
	}

	var randomDistance = function( scale=0.4 ){
		scale = Math.random() * 0.4;
		var num = Math.random() * scale;
		return Math.sin( num );
	}

	var sin = function( ANGLE ){
		return Math.sin( ANGLE );
	}
	
	for( var i = this.total -1 ; i >= 0 ; i--  ){
		var dust = this.group[i];
		updateDustInform( dust );
	}

	this.renderer.render( this.container );
}