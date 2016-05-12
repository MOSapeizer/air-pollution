d3.json("data/county.json", function(topodata) {
  var features = topojson.feature(topodata, topodata.objects["County_MOI_1041215"]).features;
  var path = d3.geo.path().projection(
    d3.geo.mercator().center([121,24]).scale(8000)
  );
  	d3.select("svg").selectAll("path").data( features )
  		.enter().append("path").attr("d", path);
});