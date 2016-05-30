var opening_id;
var images_index = 2;
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

var add_description_on_circle = function(point){
	var circle_svg = d3.select('#circle-axis').append("svg")
    var circle_zero = { x: point.x, y: point.y };
	var circle_panel_width = 450;

	var append_circle_text = function(value, offset){
		var transition = transition_with_offset(circle_zero, offset);
		append_text.call(circle_svg, "PM10.5", transition);
	}
	append_y_axis.call(circle_svg, circle_zero, circle_panel_width);
	append_circle_text("PM2.5");
	append_circle_text("PM10", {x: 70});
	append_circle_text("花粉", {x: 150});
	append_circle_text("沙粒", {x: 470});
}

var append_y_axis = function(point, height){
	var scaleY = d3.scale.linear()
			 			 .range([0, height])
			 			 .domain([100, 0]);
	var axisY = d3.svg.axis().scale(scaleY)
					  .orient("left").ticks(10);
	axis_y_transition = transition_with_offset(point, {x: -5, y: -height});
	this.append('g').call(axisY)
    	.attr({ 'fill':'none', 'stroke':'#000',
		        'transform': axis_y_transition});
}

var append_text = function(name, transition){ 	
	this.append("text").text(name)
		  	  .attr({ 'transform': transition});
}

var transition_with_offset = function(point, offset={}){
	var x = point.x || 0;
	var y = point.y || 0;
	var offset_x = (offset.x - 14) || -14;
	var offset_y = (offset.y + 28) || 28;
	return 'translate(' + (x + offset_x) + ',' + (y + offset_y) + ')';
}