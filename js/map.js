//http://bl.ocks.org/lwhitaker3/9348e54d6d85d8e7a70d
//https://bl.ocks.org/ChumaA/385a269db46ae56444772b62f1ae82bf

//https://www.gps-coordinates.net/
var cities_map;
var width_map =  document.getElementById("bubbles_svg_area").clientWidth;
var height_map = document.getElementById("bubbles_svg_area").clientHeight;

var tooltip2_visible_map = 0;

var zoom_map = d3.zoom()
    .scaleExtent([1, 100])
    .on("zoom.foo", zoomed2_map)
    .on("zoom.bar", zoomed_map);

var projection_map = d3.geoMercator()
    .rotate([5,-1])
    // .scale(950)
    .scale(1000)
    .center([27,62]) // X,Y or 21
    // .center([15,58])
    .translate([width_map / 2, height_map / 2]);

var path_map = d3.geoPath()
    .projection(projection_map);

var svg_map = d3.select("#map_svg_area")
    .attr("width", "100%")
    .attr("height", height_map)
    .style('display','none')
    .call(zoom_map);

var g_map = svg_map.append("g");                              // The map itself
var cities_container_map = svg_map.append("g")
          .attr("class","circle_box");  // All corresponding circle_packings
var path_g_map = svg_map.append("g");
var projects_map = svg_map.append("g");
var projects_2_map = svg_map.append("g");

// var path__g;
var kommuner_color_map = {};
var project_circles_map;
var project2_circles_map;
var komm_map;

var tooltip2_map = d3.select("body").append("div")
    .attr("class", "tooltip2_bubble")
    .attr("id","tooltip2_bub")
    .style("opacity", 0);

var colors_map = {"exists" : "#a5d9a1", "clicked" : "#1f9389", "grey" : "#C0C0C0"};
var legend_titles_map = {
  0: "Exists",
  1: "Clicked",
  2: "Grey"
};
var legend_real_titles_map = {
  0: "Kommuner på rådslag",
  1: "Kommuner på klickat rådslag",
  2: "Ej delaktiga kommuner"
}
function zoomed_map() {
  g_map.attr("transform",  d3.event.transform);
  path_g_map.attr("transform",  d3.event.transform);

}

function zoomed2_map(){
  project_circles_map.attr("transform",project_transform_map(d3.event.transform));
  project2_circles_map.attr("transform",project_transform_map(d3.event.transform));
  // cities_circles.attr("r",circle_size_increase);
  project_circles_map.attr("r",project_size_increase_map);
}

function circle_size_increase_map(d){
  var i = d3.interpolateNumber(1, 20);
  var x = (d3.event.transform.y * -1)-2000;
  if(x > 0){
    var t = x/21776;
    return i(t);
  }
  return 1;
}

function project_size_increase_map(d){
  var i = d3.interpolateNumber(4, 70);
  var x = (d3.event.transform.y * -1)-1000;
  if(x > 0){
    var t = x/21776;
    return i(t);
  }
  return 5;
}

function circle_transform_map(t) {
  return function(d) {
    var c = [this.getAttribute('cx'), this.getAttribute('cy')];
    var r = t.apply(c);
    var x = [r[0] - c[0], r[1]-c[1]];
    return "translate(" + x + ")";
  };
}

function project_transform_map(t) {
  return function(d) {
    var r = [this.getAttribute('cx'), this.getAttribute('cy')];
    var x = t.apply(r);
    var a = [x[0] - r[0], x[1] - r[1]];
    return "translate(" + a + ")";
  };
}
var kommuner_col_map = {};
// kommuner.json will be påverkade kommuner.
// Lista

// Rådslag will contain sole info on where rådslag have happened.
function load_map_components_map(){
  var q = d3.queue();
  q.defer(d3.json, 'data/map/rådslag.json');
  q.defer(d3.json, "data/map/sweden_kommuner.topo.json");
  // q.defer(d3.csv, "data/real/all_proposals.csv");
  q.defer(d3.json, 'data/map/kommuner.json');
  // q.defer(d3.json, 'data/map/rådslag.json');

  q.awaitAll(function(error, data_list){
    if(error) throw error;
    // Organize colors first.
    // console.log(data_list[2]);
    // letsplay(data_list[2]);

    organize_kommuner_map(data_list[0]);
    create_map(data_list[1])
    create_regions_map(data_list[2]);
    create_projects_map(data_list[0]);
    create_legend_map();
  });
}


function create_regions_map(data){
   project2_circles_map = projects_2_map.selectAll("circle")
       .data(data).enter()
       .append("circle");

     project2_circles_map.attr("id",function(d){return "red-"+d.id})
     .attr("cx", function (d) { return projection_map([d.coordinates.x,d.coordinates.y])[0];})
     .attr("cy", function (d) { return projection_map([d.coordinates.x,d.coordinates.y])[1];})
     .attr("r", function(d){
       return 2;
     })
     .classed("bubble","true")
     .classed("sub-region","true")
     .style("stroke-width", .5)
     .style("stroke", "#000")
     .attr("fill", function(d){
       // if(kommuner_col[d.properties])
       return "#C8A2C8";
     })
     .on('mouseover', handleMouseOverCircle)
     .on('mouseout', handleMouseOutCircle);

     function handleMouseOverCircle(d){
       tooltip2_visible_map = 1;
       // var name = d.properties.KNNAMN;
       var name = d.namn;
       tooltip2_map.transition().style("opacity", .9);
       tooltip2_map.html("<b>"+name + "</b>")
         .style("left", (d3.event.pageX) + "px")
         .style("top", (d3.event.pageY - 28) + "px")
         .style("max-width",  200 + "px");
     }
     function handleMouseOutCircle(d){
       tooltip2_visible_map = 0;
       tooltip2_map.transition().style("opacity", 0).style("display","initial");
     }

  komm_map.attr("fill",function(d){
       var t = d.properties.KNNAMN;
       for(var j = 0; j < data.length; j++){
         var ob = data[j];
         for(var i = 0; i < ob.kommuner.length; i++){
           var oj = ob.kommuner[i];
           if(oj.match(t) && kommuner_col_map[t] != 1){
             kommuner_col_map[t] = 2;
             return colors_map["exists"];
           }
         }
       }
       if(kommuner_col_map[t] != 1){
         return colors_map["grey"];
       }
       return colors_map["exists"];
     });
}

var meetings_map = [
    {
      name:"Rådslag om Skolans Digitalisering under Almedalsveckan 2018",
      coordinates:{x:18.2910,y:57.6406}
    },
    {
      name:"Rådslag om Skolans Digitalisering",
      coordinates:{x:0,y:0}
    },
    {
      name:"Rådslag 1 \\| Fokusområde forskning och uppföljning",
      coordinates:{x:0,y:0}
    },
    {
      name:"Regionalt Rådslag \\| Skåne",
      coordinates:{x:13.0038,y:55.6050}
    },
    {
      name:"Rådslag 1 \\| Fokusområde Likvärdig tillgång och användning",
      coordinates:{x:0,y:0}
    },
    {
      name:"Rådslag 1 \\| Fokusområde Digital kompetens för alla i skolväsendet",
      coordinates:{x:0,y:0}
    },
    {
      name:"Regionalt Rådslag \\| Östergötland",
      coordinates:{x:15.6214,y:58.4108}
    },
    {
      name:"Regionalt Rådslag \\| Göteborg",
      coordinates:{x:11.9746,y:57.7089}
    },
    {
      name:"Learning forum 2018",
      coordinates:{x:12.9746,y:57.7089}
    },
    {
      name:"Regionalt Rådslag \\| Norrbotten",
      coordinates:{x : 22.1567,y : 65.5848}
    },
    {
      name:"Regionalt Rådslag \\| Västerbotten",
      coordinates:{x:20.9509,y:64.7502}
    },
    {
      name:"Rådslag Gymnasiekonferens 2018",
      coordinates:{x:0,y:0}
    },
    {
      name:"Rådslag #16 kommuner",
      coordinates:{x:18.0686,y:59.3293}
    },
    {
      name:"Rådslag Gymnasiekonferens 2018",
      coordinates:{x:0,y:0}
    },
    {
      name:"Regionalt Rådslag \\| Jönköping",
      coordinates:{x:14.1618,y:57.7826}
    },
    {
      name:"Regionalt Rådslag \\| Gotland",
      coordinates:{x:18.2948,y:57.6348}
    },
    {
      name:"Regionalt Rådslag \\| Örebro",
      coordinates:{x:15.2134,y:59.2753}
    },
    {
      name:"Rådslag 2 \\| Fokusområde Digital kompetens för alla i skolväsendet",
      coordinates:{x:0,y:0}
    },
    {
      name:"Rådslag 2 \\| Fokusområde forskning och uppföljning",
      coordinates:{x:0,y:0}
    },
    {
      name:"Det öppna rådslaget för handlingsplanens fortsatta arbete",
      coordinates:{x:0,y:0}
    },
    {
      name:"Regionalt Rådslag \\| Kronoberg",
      coordinates:{x:14.4115,y:56.7183}
    },
    {
      name:"Rådslag | Likvärdigt lärande",
      coordinates:{x:0,y:0}
    }
];

function letsplay_map(data){
  var test_array = [];
  for(var j = 0; j < meetings_map.length; j++){
    var obj = {};
    obj.namn = meetings_map[j].name;
    obj.id = j;
    obj.coordinates = meetings_map[j].coordinates;

    var list_of_t = [];
    // var l_o_t = {};
    for(var i = 0; i < data.length; i++){
      var d = data[i];
      var name = d.Möte;
      if(name.match(meetings_map[j].name)){
        var ko = d.Kommun;
        var bo = false;
        for(var k = 0; k < list_of_t.length; k++){
          if(ko.match(list_of_t[k])){
            bo = true;
          }
        }
        if(bo == false){
          list_of_t.push(d.Kommun);
        }
      }
    }
    obj.kommuner = list_of_t;
    test_array.push(obj);
  }

  $(".check_text").text(JSON.stringify(test_array));
}

function organize_kommuner_map(data){
  for(var i = 0; i < data.length; i++){
    var kom = data[i].kommuner;
    for(var j = 0; j < kom.length; j++){
      kommuner_col_map[kom[j]] = 1;
    }
  }
}
//http://bl.ocks.org/miroli/4280679f81d0006e3142
var old_k_map = [];
function create_projects_map(data){
  project_circles_map = projects_map.selectAll("circle")
       .data(data).enter()
       .append("circle");

    project_circles_map
       .attr("id",function(d){return"project-"+d.id})
       .attr("cx", function (d) { return projection_map([d.coordinates.x,d.coordinates.y])[0];})
       .attr("cy", function (d) { return projection_map([d.coordinates.x,d.coordinates.y])[1];})
       .attr("r", function(d){
         return 5;
       })
       .classed("bubble","true")
       .style("stroke-width", .5)
       .style("stroke", "#000")
       .attr("fill", function(d){
         // if(kommuner_col[d.properties])
         return "#EA9A00";
       })
       .on('mouseover', handleMouseOverCircle)
       .on('mouseout', handleMouseOutCircle)
       .on('click',clickedBubble);

       function handleMouseOverCircle(d){
         tooltip2_visible_map = 1;
         // var name = d.properties.KNNAMN;
         console.log(d);
         var name = d.namn;
         tooltip2_map.transition().style("opacity", .9);
         tooltip2_map.html("<b>"+name + "</b>")
           .style("left", (d3.event.pageX) + "px")
           .style("top", (d3.event.pageY - 28) + "px")
           .style("max-width",  200 + "px");
       }
       function handleMouseOutCircle(d){
         tooltip2_visible_map = 0;
         tooltip2_map.transition().style("opacity", 0).style("display","initial");
       }

       function clickedBubble(d){
         var kom = d.kommuner;
         komm_map.transition("phase-shift2")
            .attr("fill",function(d){
              var t = d.properties.KNNAMN;
              for(var i = 0; i < kom.length; i++){
                if(kom[i].match(t)){
                  return colors_map["clicked"];
                }
              }
              var n = d.properties.KNNAMN;
              if(kommuner_col_map[n] == 1){
                return colors_map["exists"];
              } else if(kommuner_col_map[n] == 2){
                return colors_map["exists"];
              }

              return colors_map["grey"];
            });
       }
}
var project_titles_map = {
  0: "Regionala rådslag",
  1: "Andra rådslag"
};

function create_legend_map(){
  var t = svg_map.append("g")
  .classed('legend_map','true')
  // .attr('x',50);
  var spec_height = height_map - 20;
  var width_s = 170
  var extra_width = 30;
  var xt = t.selectAll('.legend_map')
    .data(d3.keys(legend_titles_map));

  xt.enter().append('rect')
    .attr('width','15')
    .attr('height','15')
    .attr('stroke','black')
    .attr('stroke-width',0.5)
    .attr('x', 20)
    .attr('y',function(i,d){
      return i * 25 + 25;
    })
    .attr('fill',function(d){
      return colors_map[legend_titles_map[d].toLowerCase()];
    })
    .classed('legend_rect',true);

    xt.enter().append('text')
    .attr('x', function(d){
      return 40;
    })
    .attr('y',function(i,d){
      return i * 25 + 37;
    })
    .text(function(d){
      return legend_real_titles_map[d];
    });
  var tt = t.selectAll('.legend')
    .data(d3.keys(project_titles_map));

  tt.enter().append('circle')
    // .attr('cx',3)
    .attr('r', function(d){
      if(d == 1){
        return 3;
      }
      return 7.5;
    })
    .attr('cy', function(i,d){
      // var tx = i+4;
      // console.log(d);
      return (d+4)*22.5 + 40;
    })
    .attr('cx',27.5)
    .attr('stroke','black')
    .attr('stroke-width',0.5)
    .attr('fill',function(d){
      if(d == 0){
        return "#EA9A00";
      }
      if (d == 1){
        return '#C8A2C8';
      }
      return 'black';
    })
    .classed('legend_circle',true);


    tt.enter().append('text')
    .attr('x', function(d){
      return 40;
    })
    .attr('y',function(i,d){
      return (d+4) * 22.5 + 45;
    })
    .text(function(d){
      return project_titles_map[d];
    });
}

function create_map(sweden){
  komm_map = g_map.selectAll('.subunit')
            .data(topojson.feature(sweden, sweden.objects.kommuner).features)
            .enter().append("path")

  komm_map.attr("d", path_map)
        .attr("id", function(d){return d.properties.KNNAMN;})
        .attr("fill",function(d){
          var n = d.properties.KNNAMN;
          if(kommuner_col_map[n] == 1){
            return colors_map["exists"];
          }
          return colors_map["grey"];})
        .on('mouseover', handleMouseOverCircle)
        .on('mouseout', handleMouseOutCircle);
//https://bl.ocks.org/mbostock/4180634
  g_map.insert("path", ".graticule")
    .datum(topojson.mesh(sweden, sweden.objects.kommuner, function(a, b) { return a !== b; }))
    .attr("class", "boundary")
    .attr("d", path_map);

  function handleMouseOverCircle(d){
    tooltip2_visible_map = 1;
    var name = d.properties.KNNAMN;
    tooltip2_map.transition().style("opacity", .9);
    tooltip2_map.html("<b>"+name + "</b>")
      .style("left", (d3.event.pageX) + "px")
      .style("top", (d3.event.pageY - 28) + "px")
      .style("max-width",  200 + "px");
  }
  function handleMouseOutCircle(d){
    tooltip2_visible_map = 0;
    tooltip2_map.transition().style("opacity", 0).style("display","initial");
  }
}

window.addEventListener("mousemove", function(e){
  if(tooltip2_visible_map == 1){
    var y = e.clientY+18;
    var x = e.clientX-30;
    var y_cap = document.getElementById("tooltip2_bub").clientHeight;
    if(y > height-y_cap){
      y = height-y_cap;
    }
    if(x > 1200){
      x = 1200;
    }
    tooltip2_map.style("left", x + "px")
        .style("top", y + "px");
  }
});
