d3.json("data/county.json", function(topodata) {
  var features = topojson.feature(topodata, topodata.objects["County_MOI_1041215"]).features;
});