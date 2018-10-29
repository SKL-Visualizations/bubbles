var width = 960;
// var height = 540;
var height = 400;

var center = { x: width / 2, y: height / 2 };
var meet_info;
var omrade_titles = {
  0: "Digtal Kompetens",
  1: "Likvärdig Tillgång och Användning",
  2: "Forskning och Uppföljning",
  3: "Annat"
};
var omradeCenters = {
  0: { x: width / 3, y: height / 2 },
  1: { x: width / 2, y: height / 2 },
  2: { x: 2 * width / 3, y: height / 2 },
  3: { x:0, y:0},
  'filter' : {x: -10000, y:-10000}
};
var omrade_titles_x = {
    0: 200,
    1: 420,
    2: 670,
    3: -150
};
var omrade_titles_y = {
  0: -75,
  1: -75,
  2: -125,
  3:50
};
var radslag_titles_x = {};
var radslag_titles_y = {};
var radslag_centers = {};
var question_omrade = {};
var ids_of_filtered = [];

var clicked_bubble = -1;
var zoom = d3.zoom()
    .scaleExtent([.2, 20])
    .on("zoom", zoomed);

var svg = d3.select("svg")
          .attr("width",width)
          .attr("height",height);

var g = svg.append("g");

var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip_bubble")
    .style("opacity", 0);

var color = d3.scaleOrdinal(d3.schemeCategory20);

var view_option = 0;

// nodes and other variables.
var damper = 0.102;
var bubbles = null;
var nodes = [];



/** ZOOM Functions **/
svg.call(zoom);

function zoomed() {
  g.attr("transform", d3.event.transform);
}



/** SIMULATION / MOVEMENT functions **/
// Force Layout
//https://stackoverflow.com/questions/41341248/migrating-d3-v3-to-d3-v4-in-circle-force-layout-chart
// 0.03
var forceStrength = 0.025;
var simulation = d3.forceSimulation()
  .velocityDecay(0.2)
  .force('x', d3.forceX().strength(forceStrength).x(center.x))
  .force('y', d3.forceY().strength(forceStrength).y(center.y))
  .force('charge', d3.forceManyBody().strength(charge))
  .on('tick', ticked);

  simulation.stop();

// Moving
function charge(d) {
  // 2.15 works well
  return -Math.pow(d.radius, 2.0) * forceStrength;
}

function ticked() {
  bubbles
    .attr('cx', function (d) { return d.x; })
    .attr('cy', function (d) { return d.y; });
}

/** NODE Creation **/
function createNewNodes(rawData){
  var myNodes = rawData.map(function (d,i){
    return {
      id: (i+1),
      radius: 15,
      value: Math.random() * 10,
      tag: d.hashtag,
      author: d.author,
      message: d.text,
      meeting: d.meeting_id,
      omrade: convert_omrade(d.question_id),
      question: d.question_id,
      type: d.type,
      path: d.path,
      tags: d.tags,
      x: Math.random() * 900,
      y: Math.random() * 800
    };
  });
  myNodes.sort(function (a,b){ return b.value - a.value; });
  return myNodes;
}

//https://github.com/vlandham/bubble_chart_v4
//http://vallandingham.me//bubble_charts_with_d3v4.html
function chart(rawData,t) {
  var maxAmount = d3.max(rawData, function (d) { return +d.total_amount; });

  var radiusScale = d3.scalePow()
    .exponent(0.5)
    .range([2, 85])
    .domain([0, maxAmount]);
  nodes = createNewNodes(rawData);

  // Set the force's nodes to our newly created nodes array.

  // Bind nodes data to what will become DOM elements to represent them.
  bubbles = g.selectAll('.bubble')
    .data(nodes, function (d) { return d.id; });

  var bubblesE = bubbles.enter().append('circle')
    .classed('bubble', true)
    .classed('no-filter',true)
    .attr('r', 0)
    .style("stroke","black")
    .style("fill",function(d){ return mote_color(d);})
    .attr('stroke-width', 1)
    .on("click",handleClickCircle)
    .on('mouseover', handleMouseOverCircle)
    .on('mouseout', handleMouseOutCircle);

  bubbles = bubbles.merge(bubblesE);

  bubbles.transition()
    .duration(2000)
    .attr('r', function (d) { return d.radius; });

  // Start simulation
  simulation.nodes(nodes);
  move_bubbles(0);

  for(var i =0 ; i < nodes.length; i++){
    ids_of_filtered[i] = 0;
  }
  // Create the title elements
  create_radslag_titles();
  create_omrade_titles();

  d3.selectAll(".badge")
    .on("click",function(d){
      filter_badge(this);
    });

  d3.selectAll(".color-button")
    .on("click", function(){
      change_color(this);
    });

    //https://bl.ocks.org/pstuffa/3393ff2711a53975040077b7453781a9

};

function handleMouseOverCircle(d){
  var id = d.id;
  this.parentNode.appendChild(this);
  d3.selectAll(".bubble")
    .filter(function(d){if(d.id==id){return false;}return true;})
    .transition()
      .style("opacity","0.3");

  var meeting_name = ""
  var question_t = "";
  for(var i = 0; i < meet_info.length; i++){
    var u_id = meet_info[i].uid;
    var ta = d.meeting;
    if(u_id.match(ta)){
      meeting_name = meet_info[i].title;
      for(var j = 0; j < meet_info[i].questions.length; j++){
        if(meet_info[i].questions[j].uid.match(d.question)){
          question_t = meet_info[i].questions[j].name;
        }
      }
    }
  }
  tooltip.transition().style("opacity", .9);
  tooltip.html("<b>"+meeting_name + "</b><br>" + question_t)
    .style("left", (d3.event.pageX) + "px")
    .style("top", (d3.event.pageY - 28) + "px")
    .style("max-width",  200 + "px");
}

function handleMouseOutCircle(d){
  tooltip.transition().style("opacity", 0);
  d3.selectAll(".bubble")
    .transition()
      .style("opacity","1");
}

function handleClickCircle(d){
  // d3.select(d)
  var id = d.id;
  d3.selectAll(".bubble")
    .filter(function(d){
      if(d.id==id){
        return true;
      }
      return false;})
    .transition()
      .style("fill","black");
  if(clicked_bubble != -1){
    d3.selectAll(".bubble")
      .filter(function(d){
        if(d.id==clicked_bubble){
          return true;
        }
        return false;})
      .transition()
        .style("fill",function(d){ return mote_color(d);});
  }
  clicked_bubble = id;
  $("#info_box").css("display","initial");
  $("#card_header").html("<a href='https://skl.voteit.se"+d.path+"'>#"+d.tag+"</a>" + "<span style=\"float:right;cursor:pointer;\"><button type=\"button\" class=\"close\" aria-label=\"Close\"><span onclick=\"hide_infobox()\" aria-hidden=\"true\">&times;</span></button></span>");
  var meeting_name = ""
  var omrade_t = omrade_titles[d.omrade];
  var question_t = "";
  for(var i = 0; i < meet_info.length; i++){
    var u_id = meet_info[i].uid;
    var ta = d.meeting;
    if(u_id.match(ta)){
      meeting_name = meet_info[i].title;
      for(var j = 0; j < meet_info[i].questions.length; j++){
        if(meet_info[i].questions[j].uid.match(d.question)){
          question_t = meet_info[i].questions[j].name;
        }
      }
    }
  }
  // $("#card_meeting_tree").html(meeting_name + " &rarr;\n<br> "+omrade_t+" &rarr;\n<br><br> "+question_t);
  $("#card_meeting_tree").html(meeting_name + " <br>&rarr;\n<br> "+question_t);

  $("#card_description").text(d.message);
  // console.log(d.tags);
  var pill_string = "";
  for(var i = 0; i < d.tags.length-1; i++){
    var s = d.tags[i];
    var t = s.charAt(0).toUpperCase() + s.substr(1);
    pill_string += "<span class='badge badge-pill badge-primary'>"+t+"</span>\n";
  }
  $("#pills").html(pill_string);
}

/** Attempt at Filtering and Redrawing **/
function redraw_bubbles(new_nodes){
  // simulation.stop();

  bubbles = g.selectAll('.bubble')
    .data(new_nodes, function (d) { return d.id; });

  bubbles.exit().transition(1000).attr('r',0).remove();

  var bubblesE = bubbles.enter().append('circle')
    .classed('bubble', true)
    .classed('no-filter',true)
    .attr('r', 0)
    .style("stroke","black")
    .style("fill",function(d){ return mote_color(d);})
    .attr('stroke-width', 1)
    .on("click",handleClickCircle)
    .on('mouseover', handleMouseOverCircle)
    .on('mouseout', handleMouseOutCircle);
    bubbles = bubbles.merge(bubblesE);
    bubbles.transition()
      .duration(1000)
      .attr('r', function (d) { return d.radius; });
  restart_simulation(new_nodes);
}

function restart_simulation(new_nodes){
  simulation.nodes(new_nodes);
  simulation.alpha(1).restart();
  move_bubbles(view_option);
}

/** simulation moving **/
function move_bubbles(opt){
  if(opt == 0){
    simulation.force('x', d3.forceX().strength(forceStrength).x(center.x));
  } else if (opt == 1){
    simulation.force('x', d3.forceX().strength(forceStrength).x(omrade_view));
  } else if (opt == 2){
    simulation.force('x', d3.forceX().strength(forceStrength).x(radslag_view));
  }
  simulation.alpha(1).restart();
  toggle_title();
}

function change_view(option){
  $("#view_"+view_option).removeClass("active");
  $("#view_"+option).addClass("active");
  view_option = option;
  move_bubbles(option);
}

/** All the different views **/
function omrade_view(d){
  return omradeCenters[d.omrade].x;
}
function radslag_view(d){
  return radslag_centers[d.meeting].x;
}
function moveToCenter(alpha) {
  return function (d) {
    d.x = d.x + (center.x - d.x) * damper * alpha;
    d.y = d.y + (center.y - d.y) * damper * alpha;
  };
}
//http://bl.ocks.org/Rokotyan/0556f8facbaf344507cdc45dc3622177
// TODO: PNG EXPORT

// TODO: This should be a link to the data_parse eventually.
function start_program(d,t,o){
  question_omrade = o;
  meet_info = t;
  prepare_meetings(t);
  chart(d,t);
}

// Each int corresponds to an active/deactive filter.
var filters = [0,0,0,0,0,0];
var option = 0;
var filtered_bubbles = [];

function filter_badge(d){
  var element = $(d);
  var text = element.text();
  var _filter = 0;

  if(element.hasClass("badge_outline_primary")){
    element.removeClass("badge_outline_primary");
    $(d).addClass("badge-primary");
  } else {
    element.removeClass("badge-primary");
    $(d).addClass("badge_outline_primary");
  }

  if(text.match("Digital Kompetens")){ _filter = 0;
  } else if(text.match("Likvärdig Tillgång / Användning")){ _filter = 1;
  } else if(text.match("Forskning och Uppföljning")){ _filter = 2;
  } else if(text.match("Annat")){ _filter = 3;}

  simulation.stop();
  //Filter the 'nodes' object.
  for(var i = 0; i < nodes.length; i++){
    if(_filter == 0 && filters[0] == 0 && nodes[i].omrade == 0){ids_of_filtered[i] = 1;}
    else if(_filter == 0 && filters[0] == 1 && nodes[i].omrade == 0){ ids_of_filtered[i] = 0; }
    if(_filter == 1 && filters[1] == 0 && nodes[i].omrade == 1){ids_of_filtered[i] = 1;}
    else if(_filter == 1 && filters[1] == 1 && nodes[i].omrade == 1){ ids_of_filtered[i] = 0; }
    if(_filter == 2 && filters[2] == 0 && nodes[i].omrade == 2){ids_of_filtered[i] = 1;}
    else if(_filter == 2 && filters[2] == 1 && nodes[i].omrade == 2){ ids_of_filtered[i] = 0; }
    if(_filter == 3 && filters[3] == 0 && nodes[i].omrade == 3){ids_of_filtered[i] = 1;}
    else if(_filter == 3 && filters[3] == 1 && nodes[i].omrade == 3){ ids_of_filtered[i] = 0; }
  }
  // Call redraw_bubbles();
  var new_nodes = [];
  for(var i = 0; i < nodes.length; i++){
    if(ids_of_filtered[i] == 0){ new_nodes.push(nodes[i]); }
  }
  redraw_bubbles(new_nodes);
  // console.log(new_nodes);

  // var c = nodes.length;
  // for(var i = 0; i < c; i++){
  //   if(_filter == 0 && filters[0] == 0){
  //     console.log(i);
  //     var v = nodes[i];
  //     console.log(v);
  //     if(v.omrade == 0){
  //         filtered_bubbles.push(v);
  //         nodes.splice(i+1,1);
  //     }
  //   }
  // }
  //
  // console.log(filtered_bubbles.length);
  // c = filtered_bubbles.length;
  // for(var i = 0; i < c; i++){
  //   if(_filter == 0 && filters[0] == 1){
  //     if(filtered_bubbles[i] != undefined && filtered_bubbles[i].omrade == 0){
  //       nodes.push(filtered_bubbles[i]);
  //       filtered_bubbles.splice(i+1,1);
  //     }
  //   }
  // }
  // var all_b = nodes;
  // var bubblesE = g.selectAll("circle")
  //     .data(nodes, function(d,i) {
  //             if(_filter == 0 && filters[0] == 0){
  //               if(d.omrade == 0){
  //                   return;
  //               }
  //             }
  //       return d.id;
  //     });

    //   bubblesE.filter(function(d,i){
    //       if(_filter == 0 && filters[0] == 0){
    //         if(d.omrade == 0){
    //             return true;
    //         }
    //       }
    //       if(_filter == 1 && filters[1] == 0){
    //         if(d.omrade == 1){
    //             return true;
    //         }
    //       }
    //       if(_filter == 2 && filters[2] == 0){
    //         if(d.omrade == 2){
    //             return true;
    //         }
    //       }
    //       if(_filter == 3 && filters[3] == 0){
    //         if(d.omrade == 3){
    //             return true;
    //         }
    //       }
    //       return false;
    //   })
    //   .attr('display','none');
    //   // .transition()
    //   // .attr("transform","translate(-100,-100)");
    //
    // bubblesE.filter(function(d,i){
    //   if(_filter == 0 && filters[0] == 1){
    //     if(d.omrade == 0){
    //       return true;
    //     }
    //   }
    //   if(_filter == 1 && filters[1] == 1){
    //     if(d.omrade == 1){
    //       return true;
    //     }
    //   }
    //   if(_filter == 2 && filters[2] == 1){
    //     if(d.omrade == 2){
    //       return true;
    //     }
    //   }
    //   if(_filter == 3 && filters[3] == 1){
    //     if(d.omrade == 3){
    //       return true;
    //     }
    //   }
    //   return false;
    // })
    // .attr('display', 'inital');
      // .style('fill','blue');
  // bubbles = bubbles.merge(bubblesE);

  // bubblesE.exit().remove();
  // bubblesE.enter().append()
  //   .attr(r,15);

  // circle.enter();
  // nodes = all_b;
  filters[_filter] = 1 - filters[_filter];  // Activated Filters toggle

  // redraw_bubbles();

  // I think bubbles is the variable I have to modify.

  // This should eventually be removed
  // And the simulation should still only be done in
  // move_bubbles(view_option)
  // Only with new and updated bubbles.
  // simulation.force('x', d3.forceX().strength(forceStrength).x(filter_bubbles));
  // simulation.alpha(1).restart();
  // restart_simulation(new_nodes);
}

function change_color(d){
  var element = $(d);
  if(!element.hasClass("btn-outline-primary")){
    element.addClass("btn-outline-primary");
  } else {
    element.removeClass("btn-outline-primary");
  }
}

function mote_color(d){
  return color(d.meeting);
}

function prepare_meetings(meeting_information){
  for(var i = 0; i < meeting_information.length; i++){
    // console.log(meeting_information[i].title);
    if(i > 6){
      radslag_centers[meeting_information[i].uid] = {x: ((meeting_information.length-i) * 200 +60 ), y: height/2};
      radslag_titles_x[meeting_information[i].title] = (meeting_information.length-i) * 200;
    } else {
      radslag_centers[meeting_information[i].uid] = {x: ((meeting_information.length-i) * 200 +60 ), y: height/2};
      radslag_titles_x[meeting_information[i].title] = (meeting_information.length-i) * 200 + 150;
    }

    // Need some speciality here due to size and clashing.
    if(meeting_information[i].title.match('Rådslag 2 \\| Fokusområde Digital kompetens för alla i skolväsendet')){
      radslag_titles_y[meeting_information[i].title] = 30;
      radslag_titles_x[meeting_information[i].title] = (meeting_information.length-i) * 200 - 60;
    }else  if(meeting_information[i].title.match('Learning forum 2018')){
      radslag_titles_y[meeting_information[i].title] = -40;
      radslag_titles_x[meeting_information[i].title] = (meeting_information.length-i) * 200 + 75;
    } else if(meeting_information[i].title.match('Regionalt Rådslag \\| Östergötland')){
      radslag_titles_y[meeting_information[i].title] = 60;
      radslag_titles_x[meeting_information[i].title] = (meeting_information.length-i) * 200 + 150;
    } else if(meeting_information[i].title.match('Rådslag 1 \\| Fokusområde Digital kompetens för alla i skolväsendet')){
      radslag_titles_x[meeting_information[i].title] = (meeting_information.length-i) * 200 + 150;
      radslag_titles_y[meeting_information[i].title] = 60;

    }
     else {
      radslag_titles_y[meeting_information[i].title] = 20;
    }
  }
}

function convert_omrade(q_id){
  return question_omrade[q_id];
}

function create_radslag_titles(){
  var radslagData = d3.keys(radslag_titles_x);
  var years = g.selectAll('.radslagTitles')
  .data(radslagData);

years.enter().append('text')
  .attr('class', 'radslagTitles')
  .attr('display','none')
  .attr('x', function (d) { return radslag_titles_x[d]; })
  .attr('y', function(d){  return radslag_titles_y[d];})
  .attr('text-anchor', 'middle')
  .text(function (d) { return d; });
}

function create_omrade_titles(){
  var omradeData = d3.keys(omrade_titles);
  var years = g.selectAll('.omradeTitles')
  .data(omradeData);

years.enter().append('text')
  .attr('class', 'omradeTitles')
  .attr('display','none')
  .attr('x', function (d) { return omrade_titles_x[d]; })
  .attr('y', function(d){  return omrade_titles_y[d];})
  .attr('text-anchor', 'middle')
  .text(function (d) { return omrade_titles[d]; });
}

function hide_infobox(){
  $("#info_box").css("display","none");
}

function toggle_title(opt){
  if(view_option == 2){
    $(".radslagTitles").css("display","initial");
  } else {
    $(".radslagTitles").css("display","none");
  }
  if(view_option == 1){
    $(".omradeTitles").css("display","initial");
  } else {
    $(".omradeTitles").css("display","none");
  }
}
