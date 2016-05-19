var resize_canvas = function() {
  var canvas = $("canvas");
  canvas.width( window.innerWidth );
  canvas.height( window.innerHeight );
}

$(document).ready(function(){
	var width = $(".page").width();
	var height = $(".page").height();
	var taiwan = d3.select("svg").append("g");
  	var info_box = d3.select("#info-box");

	var pm25 = {
		"雲林縣": 32.3,
		"嘉義市": 30.5,
		"嘉義縣": 29.4,
		"臺南市": 27.9,
		"南投縣": 27.8,
		"高雄市": 27.3,
		"彰化縣": 26.4,
		"臺中市": 24.6,
		"連江縣": 24.2,
		"苗栗縣": 21.8,
		"桃園市": 21.2,
		"新北市": 21,
		"新竹市": 20.5,
		"屏東縣": 19.7,
		"臺北市": 18.6,
		"新竹縣": 18.7,
		"基隆市": 17.8,
		"宜蘭縣": 15.2,
		"花蓮縣": 12.5,
		"臺東縣": 10.4
	};

	var mapCenter = [120, 24.5];

	var objectRange = function( obj ){
		var v = [];
		for( var key in obj ) v.push(obj[key]);
		return d3.extent(v);
	};

	var select_animation_type = function( position ){
		if( position >= 0 && position <= (height * 0.6) ){
			if( position >= (height * 0.3) && position <= (height * 0.6) ){
				var range = height * 0.1;
				var distance = position - height * 0.3;
				var ration = distance / range;
				$(".content").css("opacity", 1 - ration);
			}
			return "Float";
		}else if( position > (height * 0.6) && position <= height ){
			return "Circle";
		}else {
			return "Nothing";
		}
	};

	dustTV = new dustAnimation(width, height);
	dustTV.animate_type = "Float";
	dustTV.start( dustTV.float );

	$(window).scroll(function(){
		var position = $(window).scrollTop();

		dustTV.animate_type = select_animation_type( position );

		if( dustTV.animate_type == "Nothing" )
			dustTV.stop();
		else if( dustTV.animate_type == "Float" ){
			dustTV.start.call( dustTV, dustTV.float );
		}
		else if( dustTV.animate_type == "Circle" ){
			dustTV.start.call( dustTV, dustTV.circle );
		}
	});

	var purple_alert = ['#fff' ,'#505'];
	var color_range = ['#fef0d9' ,'#fdba57', '#fda38a', '#f24249', '#a7050e', '#760207'];

	d3.json("data/county.json", function(topodata) {
		var features = topojson.feature(topodata, topodata.objects["County_MOI_1041215"]).features;
		var object_range = objectRange( pm25 );
		var color = d3.scale.linear().domain( object_range ).range( purple_alert );
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

		// $("canvas").on("mousemove", function(event){
		// 	fisheye.focus([event.pageX, event.pageY]);
		// 	console.log(event.pageX);
		//   	update.call(d3.select("svg"));
		// });

		update();

	});
});


