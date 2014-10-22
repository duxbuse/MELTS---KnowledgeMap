var width = document.getElementById('graph1').offsetWidth;

	
var B = document.body,
    H = document.documentElement,
    height;

	function findPos(id) {
    var node = document.getElementById(id); 	
    var curtop = 0;
    var curtopscroll = 0;
    if (node.offsetParent) {
        do {
            curtop += node.offsetTop;
            curtopscroll += node.offsetParent ? node.offsetParent.scrollTop : 0;
        } while (node = node.offsetParent);

        return(curtop - curtopscroll);
    }
}	
	
	
if (typeof document.height !== 'undefined') {
    height = document.height // For webkit browsers
} else {
    height = 0.9* (Math.max( B.scrollHeight, B.offsetHeight,H.clientHeight, H.scrollHeight, H.offsetHeight ) - findPos('graph1'));
}	

var unitView = false;	

var color = d3.scale.category20();

var svg = d3.selectAll(".graph").append("svg")
    .attr("width", width)
    .attr("height", height)
	.attr("class","svg")
	.call(d3.behavior.zoom()
		.scaleExtent([0.1,1.5])//max and min zoom levels
		.on("zoom", redraw))
	.on("dblclick.zoom", null);

		// build the arrow.
svg.append("svg:defs").selectAll("marker")
    .data(["start"])      // Different link/path types can be defined here
  .enter().append("svg:marker")    // This section adds in the arrows
    .attr("id", String)
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 27.0)
    .attr("refY", 0)
    .attr("markerWidth", 8)
    .attr("markerHeight", 8)
    .attr("orient", "auto")
  .append("svg:path")
    .attr("d", "M0,-5L10,0L0,5");//3 lines of a triangle
		
		
var vis = svg.append('g');	
	
function redraw() {
  vis.attr("transform",
      "translate(" + d3.event.translate + ")"
      + " scale(" + d3.event.scale + ")");
}	
	//add nodes by clicking
	//this is also worth adding later http://bl.ocks.org/mbostock/929623
	
	
var force = d3.layout.force()
	.gravity(.1)
    .distance(function(d) { return 5*Math.max(d.source.title.length,d.target.title.length) + 15;})//make the links long enough for the relevant amount of text
	.linkStrength(0.3)//strength of the rigidity
    .charge(function(d) { return -150*(d.title.length);})
    .size([width, height]);
	 
function generate (error, json) {
 var links = [], info = [];
	
	var ClusterHash = {};
var ClusterArray = [];
	
	vis.remove();
	vis = svg.append('g');	
	
	var jsonData = JSON.parse(json);
	//console.log(json);
	
	jsonData.forEach(function(element, index, array){//each node
		info.push(element.data);
		element.links.forEach(function(e, i, a){//each link
			var targetNode = null;
			jsonData.forEach(function(ele, ind, arr){//needs to have a node from info
				if(ele.data.title == e.target){
					targetNode = ele.data;
				}
			});
			if(targetNode !== null){
				links.push({source: targetNode, target: element.data});
			}
		});
	});
	
	info.forEach(function(e,i,a){//create hash of unique units
		if (!ClusterHash.hasOwnProperty(e.unit)){
			ClusterHash[e.unit] = e;
		}
	});
	
	for ( var k in ClusterHash){//convert hash to array for colour reasons
		ClusterArray.push(ClusterHash[k]);
	}
	
  force 
      .nodes(info)//add new element to the list
      .links(links)
	  .on( 'end', function(d) {//once settled make all nodes fixed so they don't continue to move
			d3.selectAll(".node").each( function(d) {
				d.fixed = true;
			})
		})
      .start();	
	
  var link = vis.selectAll(".link")
	  .remove()
      .data(links)
      .enter().append("line")
      .attr("class", "link")
	  .attr("marker-end", "url(#start)")
	  .style("stroke-width", 1.5);

  var node = vis.selectAll(".node")
	  .remove()
      .data(info)
      .enter().append("g")
      .attr("class", "node")
      .call(force.drag().on("dragstart",function() {d3.event.sourceEvent.stopPropagation(); } ));//make nodes dragable and disable panning whilst that is happening
	  
	  
  node.append("circle")
      .attr("class", "node")
      .attr("r", 20)
      .style("fill", function(d) {//make the colour based off the unit
	  
			for ( var k in ClusterArray){ 
				if(d.unit == ClusterArray[k].unit){
					return color(k);
				}
			}
		})
		.on("dblclick", function(d) { 
			d3.event.preventDefault();
			query("`"+d.title);
		});
	  
  node.append("svg:title")//if mousing over a node display the unit title
      .text(function(d) { return d.unit; });  
	  
	  
  node.append("svg:text")//put the titles next to the nodes
      .attr("dx", 0)
      .attr("dy", 4)//28
	  .attr("text-anchor", "middle")
      .text(function(d) { return d.title });

  vis.style("opacity", 1e-6)//as you zoom the opacity changes
    .transition()
      .duration(1000)
      .style("opacity", 1);
	  
	  
  force.on("tick", function(e) {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

	if(unitView ){
	    var k = .7 * e.alpha;
 
	  // Push nodes toward their designated focus.
	  info.forEach(function(o, i) {
		if(!o.fixed){//so they don't move when the sim has finished
				var centerNode;
			  
				ClusterArray.forEach(function(e,i,a){
					if(o.unit == e.unit){
						centerNode = e;
					}
				});
			  
				o.y += (centerNode.y - o.y) * k;
				o.x += (centerNode.x - o.x) * k;
		}
	});
}
	
	node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
  });
  

  
  }
  /* 
 * Switch between views
 */
  function toggleView(){
	unitView = !unitView;
	if(unitView){
		document.getElementById("mode").innerHTML = "Unit Clumping - On";
	
		force.alpha(0.1)
		.linkStrength(0.01)//strength of the rigidity
		.charge(function(d) { return -50*(d.title.length);});
	}else{
		document.getElementById("mode").innerHTML = "Unit Clumping - Off";
	
		force.alpha(0.8)
		.linkStrength(0.3)//strength of the rigidity
		.charge(function(d) { return -150*(d.title.length);});
	}
	d3.selectAll(".node").each( function(d) {
				d.fixed = false;
	})
  } 
  
  
  /* 
 * Attach a context menu to a D3 element
 */
 
 contextMenuShowing = false;
  
  d3.select("body").on('contextmenu',function (d,i) {
    if(contextMenuShowing) {
        d3.event.preventDefault();
        d3.select(".popup").remove();
        contextMenuShowing = false;
	} else {
        d3_target = d3.select(d3.event.target);
        if (d3_target.classed("node")) {
            d3.event.preventDefault();
            contextMenuShowing = true;
            d = d3_target.datum();
			
			// Build the popup
			canvas = d3.select(".graph");
            mousePosition = d3.mouse(canvas.node());
			
			 popup = canvas.append("div")
                .attr("class", "popup")
                .style("left", mousePosition[0] + "px")
                .style("top", mousePosition[1] + "px");
            popup.append("h2").text("Info");
            popup.append("p").text(d.title + " found in unit " + d.unit)
            popup.append("p")
            .append("a")
            .attr("href","http://en.wikipedia.org/wiki/" + d.title.replace(/ /g,"_").toLowerCase())
            .text("Wikipedia Entry for " + d.title)
			popup.append("p")
            .append("a")
            .attr("href","http://www.monash.edu.au/pubs/2014handbooks/units/" + d.unit + ".html")
            .text("Handbook Entry for " + d.unit)
			; 
			
			 canvasSize = [
                canvas.node().offsetWidth,
                canvas.node().offsetHeight
            ];
            
            popupSize = [ 
                popup.node().offsetWidth,
                popup.node().offsetHeight
            ];
            
            if (popupSize[0] + mousePosition[0] > canvasSize[0]) {
                popup.style("left","auto");
                popup.style("right",0);
            }
            
            if (popupSize[1] + mousePosition[1] > canvasSize[1]) {
                popup.style("top","auto");
                popup.style("bottom",0);
            }
        }
    }
});