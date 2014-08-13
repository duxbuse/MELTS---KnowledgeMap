var width = "100%",
    height = "400";
	
var color = d3.scale.category20();

var svg = d3.selectAll(".graph").append("svg")
    .attr("width", width)
    .attr("height", height)
	.style("fill", "purple");

	
var force = d3.layout.force()
	.gravity(.01)
    .distance(60)
    .charge(-200)
    .size([width, height]);

d3.json("/smdux1/api/map", function(error, json) {
	
	var links = [], info = [];
	
	json.forEach(function(element, index, array){//each node
		info.push(element.data);
		element.links.forEach(function(e, i, a){//each link
			links.push(e);
		});
	});
	
	info.forEach(function(e){
		e.x = 100;
		e.px = 100;
	});
	
  force //somewhere here there is an issue with the importing of the json and hence things like d.group and d.name arnt loading hence nothing is being displayed.
      .nodes(info)
      .links(links)
      .start();

  var link = svg.selectAll(".link")
      .data(links)
    .enter().append("line")
      .attr("class", "link")
	  .style("stroke-width", 1);

  var node = svg.selectAll(".node")
      .data(info)
    .enter().append("g")
      .attr("class", "node")
      .call(force.drag);

  /*node.append("image")
      .attr("xlink:href", "https://github.com/favicon.ico")
      .attr("x", -8)
      .attr("y", -8)
      .attr("width", 16)
      .attr("height", 16);*/

  node.append("circle")
      .attr("class", "node")
      .attr("r", 5)
      //.style("fill", function(d) { return color(d.group); })
	  
	  
  node.append("text")
      .attr("dx", 12)
      .attr("dy", ".35em")
      .text(function(d) { return d.title });


  force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
  });
});
