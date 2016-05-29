var resize_canvas = function() {
  var canvas = $("canvas");
  canvas.width( window.innerWidth );
  canvas.height( window.innerHeight );
}

var opening_animation = function(){
	return setInterval(function(){
		if( images_index >= 20 ){
			$('#opening img').fadeOut(600);
			clearInterval(opening_id);
		}
		$("#opening img").attr("src", "images/opening/" + images_index + ".png");
		images_index += 1;
	}, 200);
}

opening_id = opening_animation();

$(document).ready(function(){
  	var $window = $(window);
  	var $animation_view = $('.content');
	var width = $(".page").width();
	var height = $(".page").height();
	var taiwan = d3.select("svg").append("g");
  	var info_box = d3.select("#info-box");
  	var dustTV = new DustAnimationControl(width, height);
	var mapCenter = [120, 24.5];
	
	var objectRange = function( obj ){
		var v = [];
		for( var key in obj ) v.push(obj[key]);
		return d3.extent(v);
	};

	var select_animation_type = function( position ){
		if( position >= 0 && position <= (height * 0.6) ){
			return "Float";
		}else if( position > (height * 0.6) && position <= 1.5 * height ){
			return "Circle";
		}else if( position > (height * 2.5) && position <= 3.5 * height ){
			return "Float";
		}else{
			console.log( position );
			return "Nothing";
		}
	};

	var check_in_view = function(){
		var window_height = $window.height();
		var window_top_position = $window.scrollTop();
		var window_bottom_position = (window_top_position + window_height);

		$.each($animation_view, function(){
			var $element = $(this);
			var element_half_height = $element.outerHeight() / 2;
		    var element_half_position = $element.offset().top + element_half_height;

		    if ( (element_half_position <= window_bottom_position) && (element_half_position >= window_top_position) ) {
		      $element.addClass('in-view');
		      var animation = $element.attr("animate");
		      var tween = dustTV.playing + "_To_" + animation;
		      // console.log(tween);
		      // var tween_animation = dustTV.tween_channel[tween];
		      // dustTV.setTween( tween_animation );
		      dustTV.start( animation );
		    } else {
		      $element.removeClass('in-view');
		    }

		});
	}

	// var scroll_listener = function(){
	// 	check_in_view();
	// 	if( dustTV.animate_type == "Nothing" ){
	// 		dustTV.start.call( dustTV, null);
	// 	} else if( dustTV.animate_type == "Float" ){
	// 		dustTV.start.call( dustTV, dustTV.float );
	// 	} else if( dustTV.animate_type == "Circle" ){
	// 		dustTV.start.call( dustTV, dustTV.circle );
	// 	}
	// }
	check_in_view();
	$(window).scroll( check_in_view );

	var purple_alert = ['#fff' ,'#505'];
	var color_range = ['#fef0d9' ,'#fdba57', '#fda38a', '#f24249', '#a7050e', '#760207'];
	var init_position = dustTV.dustPanel.circle_position(0);
	var circle_panel_width = 450;
	var scaleX = d3.scale.linear()
				 .range([0, circle_panel_width])
				 .domain([100, 0]);
	var axisX = d3.svg.axis()
      			.scale(scaleX)
				.orient("left")
      			.ticks(10);

    var circle_svg = d3.select('#circle-axis').append("svg")


    circle_svg.append('g')
    		  .call(axisX)
    		  .attr({
		        'fill':'none',
		        'stroke':'#000',
		        // 'transform':'translate(' + (width * 0.4 - 28) + ',' + (height * 0.2 + 20) + ')'
		        'transform':'translate(' + (init_position.x - 14) + ',' + (init_position.y - circle_panel_width + 14) + ')'
		      });
	circle_svg.append("text").text("pm2.5")
			  .attr({ 'transform':'translate(' + (init_position.x - 14) + ',' + (init_position.y + 28) + ')' });
	circle_svg.append("text").text("pm10")
			  .attr({ 'transform':'translate(' + (init_position.x - 14 + 70) + ',' + (init_position.y + 14) + ')' });
	circle_svg.append("text").text("花粉")
			  .attr({ 'transform':'translate(' + (init_position.x - 14 + 160) + ',' + (init_position.y ) + ')' });
	circle_svg.append("text").text("沙粒")
			  .attr({ 'transform':'translate(' + (init_position.x - 14 + 480) + ',' + (init_position.y) + ')' });

    var longChartSVG = d3.select('#long-chart')
    					 .append('g')
    					 .attr( 'transform', 'translate(' + width * 0.45 + ',' + height * 0.2 + ')');

    var object_range = objectRange( pm25 );
    var color = d3.scale.linear().domain( object_range ).range( purple_alert );

    d3.csv("data/pm2.5/2015pm2.5年均值.csv", function(data){
    	var rectMaxWidth = width * 0.4;
    	var valueMax = object_range[1];
    	var barGroup = longChartSVG.selectAll(".bar")
    			.data( data )
    			.enter().append("g");

    	barGroup.append("rect")
    			.attr("class", "bar")
    			.attr("x", 0)
    			.attr("y", function(d, i){ return i * 20; })
    			.attr("fill", function(d){ return color(d.pm) })
    			.attr("width", function(d){ return d.pm / valueMax * rectMaxWidth ; })
    			.attr("height", 10);

    	barGroup.append("text")
    			.attr("x", -54)
    			.attr("y", function(d, i){ return i * 20; })
    			.attr("dy", "0.75em")
    			.text(function(d){ return d.city; });
    })

	d3.json("data/county.json", function(topodata) {
		var features = topojson.feature(topodata, topodata.objects["County_MOI_1041215"]).features;
		
		// var color = d3.scale.quantize().domain( object_range ).range( color_range );
		var fisheye = d3.fisheye.circular().radius(100).distortion(2);
		var prj = function(v){
			 var ret = d3.geo.mercator().center( mapCenter ).scale(8000)(v);
			 var ret = fisheye({ x:ret[0], y:ret[1] });
			 return [ret.x, ret.y];
		};
		var path = d3.geo.path().projection( prj );

		for( var index = features.length - 1 ; index >= 0 ; index-- ){
			City = features[index].properties.C_Name;
			features[index].concentration = pm25[City];
		}

		taiwan.selectAll("path").data( features ).enter().append("path");

		var update = function(){
			taiwan.selectAll("path").attr({ "d": path,
				"fill": function(d){ return color( d.concentration ); }
			}).on("mouseover", function(d){ 
				info_box.select("h3").text(d.properties.C_Name);
				info_box.select("p").text(d.concentration);
				d3.select(this).attr({ "stroke": "white", "stroke-width": "4" });
			}).on("mouseleave", function(d){
				d3.select(this).attr("stroke", "none");
			});
		}

		d3.select("svg").on("mousemove", function(){
			fisheye.focus(d3.mouse(this));
	 	 	update();
		});

		update();

	});
});


