var Tween = function(start, end){
	var STEP_COUNT = 30;
	var NOT_ARRIVED = false;
	var diff_x = (end.x - start.x);
	var diff_y = (end.y - start.y);
	var step = {x: diff_x / STEP_COUNT, y: diff_y / STEP_COUNT };
	var instance = this;

	this.arround = function(){
		return STEP_COUNT == 0;
	}

	this.walk = function(){
		if( instance.arround() )
			return (start.x = end.x) && (start.y = end.y);
		(start.x += step.x) && (start.y += step.y) && STEP_COUNT--;
		return NOT_ARRIVED;
	}

	this.animate = function(){

	}
}
/*
var tween_group = function(){
	var origin_dust_group = this.origin_dust_group();
	var dust_group = this.group;
	var tween_group = [];
	for(var i=0 ; i < this.total ; i++ ){
		tween_group.push(new Tween( dust_group[i], origin_dust_group[i] ));
	}
	return tween_group;
}*/

var tween_cirlce_to_float = function(){
	var CIRCLE = this.circleGroup;
	var width = this.width;
	var height = this.height;

	var updateDustInform = function( start, end ){
		(typeof(start.tween) == 'undefined') && start.x != end.x && (start.tween = new Tween(start, end));
		start.tween && start.tween.walk() && (start.tween = undefined);
		start.width = end.r;
		start.height = end.r;
		start.alpha = end.alpha;
		start.alpha_angle = end.alpha_angle;

	}

	for( var i = this.total -1 ; i >= 0 ; i--  ){
		var dust = this.group[i];
		var origin_dust = this.origin_group[i];
		updateDustInform( dust, origin_dust );
	}

	this.renderer.render( this.container );
}

var float_to_circle_animation = function(){

	var CIRCLE = this.circleGroup;
	var width = this.width;
	var height = this.height;

	var updateDustInform = function( dust, circle ){
		(typeof(dust.tween) == 'undefined') && dust.x != circle.x && (dust.tween = new Tween(dust, circle));
		dust.tween && dust.tween.walk() && (dust.tween = undefined);
		dust.width = circle.r;
		dust.height = circle.r;
		dust.alpha = 1;
	}

	for( var i = this.total -1 ; i >= 0 ; i--  ){
		var dust = this.group[i];
		updateDustInform( dust, CIRCLE.group[i] );
	}

	this.renderer.render( this.container );
}

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
		(dust.x > width) && (dust.x = 0);
		(dust.y > height) && (dust.y = 0);
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