// var width = 960;
var width =  document.getElementById("bubbles_svg_area").clientWidth;
// var height = 540;
// var height = 400;
var height = document.getElementById("bubbles_svg_area").clientHeight;


var center = { x: width / 2, y: height / 2 };
var meet_info;

var omrade_titles = {
  0: "Digtal kompetens",
  1: "Likvärdig tillgång och användning",
  2: "Forskning och uppföljning"
};
var omradeCenters = {
  0: { x: width / 3, y: height / 2 },
  1: { x: width / 2, y: height / 2 },
  2: { x: 2 * width / 3, y: height / 2 }
};
var omrade_titles_x = {
    0: 200,
    1: 420,
    2: 670
};
var omrade_titles_y = {
  0: 100,
  1: 100,
  2: 70
};

var reg_titles = {
  0: "Regionala Rådslag",
  1: "Andra Rådslag",
};
var regCenters = {
  0: { x: width / 3, y: height / 2 },
  1: { x: width / 2, y: height / 2 },
};
var reg_titles_x = {
    0: 250,
    1: 500,
};
var reg_titles_y = {
  0: 70,
  1: 65,
};

var tid_titles = {
  0: "Kort",
  1: "Medel",
  2: "Lång",
  3: "N/A"
};
var tidCenters = {
  0: { x: width / 3, y: height / 2 },
  1: { x: width / 2, y: height / 2 },
  2: { x: 2 * width / 3, y: height / 2 },
  3:  { x: 0 , y: 0 }
};
var tid_titles_x = {
    0: 320,
    1: 520,
    2: 720,
    3: -40
};
var tid_titles_y = {
  0: 110,
  1: 110,
  2: 130,
  3: 90
};

var radslag_titles_x = {};
var radslag_titles_y = {};
var radslag_centers = {};

var question_omrade = {};
var ids_of_filtered = [];

// COLORS
var picked_color_set = 1;
var radslag_colors = {"f5494ed2-de82-4924-b074-caa57c48db12":"#1f77b4","d327c3e7-60ca-4b66-8330-b5df3ebe5611":"#aec7e8","4ffe534b-4072-43d4-98a0-6ea36de44292":"#ff7f0e","78eea2b5-519b-436f-837a-609cfd175874":"#ffbb78","05f2aa56-6abc-4f4c-bf70-279e702d1819":"#2ca02c","4c01d4e4-39ef-4d1b-81f5-393a3020820c":"#98df8a","97d511ac-1004-4c96-82b0-aff9e04b1b6e":"#d62728","f6923640-4d14-4d5e-b56b-f3e6a495a680":"#ff9896","a436c2d1-511f-4022-95c4-4e13f7ac6d90":"#9467bd","1380b7ff-5be8-4a19-898e-b7f211556e0f":"#c5b0d5","eb205a1f-7b14-46cc-8bfe-63af51114dfe":"#8c564b","be62399b-23bf-4eab-a7d0-46adb502772b":"#c49c94","b8849da1-10ea-40e1-a00f-615d5b7b2de7":"#e377c2","206fe9f4-24e6-40e4-9941-8194592b108d":"#f7b6d2"};
// var omrade_colors = {0 : "#90EE90", 1 : "#e9bd15", 2: "#6666ff", 3 : "#ff6666"};
// var omrade_colors = {0 : "#ec7079", 1 : "rgba(176,168,214,1)", 2: "#bedda1", 3 : "black"};
// Mjuka glass färger.
// var omrade_colors = {0 : "#a3e9c4", 1 : "#f1b3cf", 2: "#f2d7b2", 3 : "black"};
var omrade_colors = {0 : "#b49dc2", 2 : "#e6b87b", 1: "#3ab8a2", 3 : "black"};
var omrade_stroke_colors = {0:"#906EA5" , 2 : "#DA953B", 1 : "#287E6F", 3 : "black"};
// var omrade_colors = {0 : "#97ba4c", 2 : "#367d85", 1: "#edbd00", 3 : "black"};

// var omrade_colors = {0 : "#ec7079", 1 : "rgba(176,168,214,1)", 2: "#bedda1", 3 : "black"};
// var omrade_colors = {0 : "#ec7079", 1 : "rgba(176,168,214,1)", 2: "#bedda1", 3 : "black"};

var zoom = d3.zoom()
    .scaleExtent([.2, 20])
    .on("zoom", zoomed);

var svg = d3.select("svg")
          .attr("width",width)
          .attr("height",height);

var g = svg.append("g");

var tooltip_visible = 0;
var tooltip = d3.select("html").append("div")
    .attr("class", "tooltip_bubble")
    .attr("id","tooltip_bub")
    .style("opacity", 0);


var color = d3.scaleOrdinal(d3.schemeCategory20);

var view_option = 0;

// nodes and other variables.
var damper = 0.102;
// var damper = 0.5
// var damper = 5;
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
// var forceStrength = 0.010;
var simulation = d3.forceSimulation()
  .velocityDecay(0.2)
  // .velocityDecay(0.3)
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
      // radius: 10,
      radius : 20 * Math.random(),
      value: Math.random() * 10,
      tag: d.hashtag,
      author: d.author,
      message: d.text,
      meeting: d.meeting_id,
      omrade: convert_omrade(d.question_id),
      tid: convert_tid(d.tags),
      radslag_type : get_radslag_type(d.meeting_id),
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
  height = document.getElementById("bubbles_svg_area").clientHeight;
  var maxAmount = d3.max(rawData, function (d) { return +d.total_amount; });

  var radiusScale = d3.scalePow()
    .exponent(0.5)
    .range([2, 85])
    .domain([0, maxAmount]);
  nodes = createNewNodes(rawData);

  // Set the force's nodes to our newly created nodes array.

  // Bind nodes data to what will become DOM elements to represent them.
  // REPRESENT Discussion posts as actual polygons (hexagons) and link a radius to them.
  //https://codepen.io/cwmanning/pen/Hugye
  bubbles = g.selectAll('.bubble')
    .data(nodes, function (d) { return d.id; });

  var bubblesE = bubbles.enter().append('circle')
    .classed('bubble', true)
    .classed('no-filter',true)
    .attr('r', 0)
    // .style("stroke","black")
    .style("stroke",function(d){return mote_stroke_color(d);})
    .style("fill",function(d){ return mote_color(d);})
    .attr('stroke-width', 0.3)
    .on("click",handleClickCircle)
    .on('mouseover', handleMouseOverCircle)
    .on('mouseout', handleMouseOutCircle);

  bubbles = bubbles.merge(bubblesE);

  bubbles.transition("change_bigger")
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
  create_tid_titles();
  create_reg_titles();
  create_legend();

  d3.selectAll(".badge")
    .on("click",function(d){
      filter_badge(this);
    });

  d3.selectAll(".col-but")
    .on("click", function(){
      console.log(this);
      change_color(this);
    });

    //https://bl.ocks.org/pstuffa/3393ff2711a53975040077b7453781a9

};

function handleMouseOverCircle(d){
  var id = d.id;
  this.parentNode.appendChild(this);
  // d3.selectAll(".bubble")
  //   .filter(function(d){if(d.id==id){return false;}return true;})
  //   .transition()
  //     .style("opacity","0.3");

  var strok_s = 2;
  if(this === cur_bub){
    strok_s = 3;
  }
  d3.select(this)
    .transition("mouse-over-trans")
    .duration(100)
    .style('stroke-width',strok_s);

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
  tooltip_visible = 1;
  tooltip.transition().style("opacity", .9);
  tooltip.html("<b>"+meeting_name + "</b><br>" + question_t)
    .style("left", (d3.event.pageX) + "px")
    .style("top", (d3.event.pageY - 28) + "px")
    .style("max-width",  200 + "px");
}

function handleMouseOutCircle(d){
  tooltip_visible = 0;
  tooltip.transition().style("opacity", 0).style("display","initial");

  // if()
  d3.select(this)
    .filter(function(){
      if(this === cur_bub){
        return false;
      }
      return true;
    })
    .transition()
    .style('stroke-width',0.3);
}
var cur_bub;

function handleClickCircle(d){
  d3.select(cur_bub)
    .classed("clicked-bubble",false)
    .transition()
    .style('stroke',function(d){return mote_stroke_color(d)})
    .style('stroke-width',.3);

  cur_bub = this;
  d3.select(cur_bub)
    .classed("clicked-bubble",true)
    .transition()
    .style('stroke','black')

    .style('stroke-width',3);

  $("#info_box").css("display","initial");
  $("#card_header").html("<a href='https://skl.voteit.se"+d.path+"'>#"+d.tag+"</a>" + "</span>");
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
  if(d.tags != undefined){
    for(var i = 0; i < d.tags.length-1; i++){
      var s = d.tags[i];
      var t = s.charAt(0).toUpperCase() + s.substr(1);
      pill_string += "<span class='badge badge-pill badge-voteit'>"+t+"</span>\n";
    }
  }
  $("#pills").html(pill_string);
}

var filter_var_count = 0;
/** Attempt at Filtering and Redrawing **/
function redraw_bubbles(new_nodes){
  bubbles = g.selectAll('.bubble')
    .data(new_nodes, function (d) { return d.id; });

  bubbles.exit().transition(1000).attr('r',0).remove();
  filter_var_count++;
  var bubblesE = bubbles.enter().append('circle')
    .classed('bubble', true)
    .classed('no-filter',true)
    .attr('r', 0)
    // .style("stroke","black")
    .style("stroke",function(d){return mote_stroke_color(d);})

    .style("fill",function(d){ return mote_color(d);})
    .attr('stroke-width', 0.3)
    .on("click",handleClickCircle)
    .on('mouseover', handleMouseOverCircle)
    .on('mouseout', handleMouseOutCircle);
    bubbles = bubbles.merge(bubblesE);
    bubbles.transition("change_bigger" + filt_option)
      .duration(500)
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
  } else if (opt == 3){
    simulation.force('x', d3.forceX().strength(forceStrength).x(tid_view));
  } else if (opt == 4){
    simulation.force('x', d3.forceX().strength(forceStrength).x(reg_view));
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

function tid_view(d){
  return tidCenters[d.tid].x;
}

function radslag_view(d){
  return radslag_centers[d.meeting].x;
}

function reg_view(d){
  return regCenters[d.radslag_type].x;
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
var filters = [ 0,0,0,0,0,
                0,0,0,0,0,
                0,0,0,0,0,
                0,0,0,0,0,
                0,0,0,0];
var filt_option = 0;
var filtered_bubbles = [];
var option_words = ["Digital kompetens","Likvärdig tillgång / användning","Forskning och uppföljning","Annat","Kort","Medel","Lång","N/A",
"Departement","Forskare","Huvudman","Lärare","Kommunpolitiken","SKL","Lärarutbildningarna","Lärosäten","Regeringen","Regionen","Skolledning",
"Skolverket","Staten","Universitet och högskolerådet","Vinnova","Okategoriserad"];

function filter_badge(d){
  var element = $(d);

  var text = element.text();
  var _filter = -1;
  console.log(text);
  if(element.hasClass("badge_outline_voteit")){
    element.removeClass("badge_outline_voteit");
    element.addClass("badge-voteit");
  } else {
    element.removeClass("badge-voteit");
    element.addClass("badge_outline_voteit");
  }

  for(var tt = 0; tt < option_words.length; tt++){
    if(text.match(option_words[tt])){
      _filter = tt;
      tt = option_words;
      // console.log("wtf");
      break;
    }
  }
  filt_option = _filter;
  simulation.stop();

  for(var i = 0; i < nodes.length; i++){
    // Unfilter
    if(_filter == 0 && filters[0] == 1 && nodes[i].omrade == 0){
      if(ids_of_filtered[i] <= 0){
        ids_of_filtered[i] = 0;
      } else { ids_of_filtered[i] -= 1; }}
    if(_filter == 1 && filters[1] == 1 && nodes[i].omrade == 1){if(ids_of_filtered[i] <= 0){ids_of_filtered[i] = 0;} else { ids_of_filtered[i] -= 1; } }
    if(_filter == 2 && filters[2] == 1 && nodes[i].omrade == 2){if(ids_of_filtered[i] <= 0){ids_of_filtered[i] = 0;} else { ids_of_filtered[i] -= 1; } }
    unfilter_tags(_filter,4,nodes[i].tags,i,["kort","tidkort"]);
    unfilter_tags(_filter,5,nodes[i].tags,i,["medel","tidmedel","medeltid"]);
    unfilter_tags(_filter,6,nodes[i].tags,i,["lång","långtid","tidlång"]);
    if(_filter == 7 && filters[7] == 1){
      if(nodes[i].tags != undefined){
        var t_length = nodes[i].tags.length;
        // console.log(nodes[i].tags);
        if(t_length <= 0){
          if(ids_of_filtered[i] <= 0){
            ids_of_filtered[i] = 0;
          } else { ids_of_filtered[i] -= 1; }
        } else {
          var te = 0;
          for(var j = 0; j < t_length; j++){
            var tag = nodes[i].tags[j];
            if(tag.match("kort") || tag.match("tidkort") || tag.match("lång") || tag.match("långtid") || tag.match("tidlång") || tag.match("medel") || tag.match("tidmedel") || tag.match("medeltid")){
              te++;
            }
          }
          if(te == 0){
            if(ids_of_filtered[i] <= 0){
              ids_of_filtered[i] = 0;
            } else { ids_of_filtered[i] -= 1; }
          }
        }
      } else {
        if(ids_of_filtered[i] <= 0){
          ids_of_filtered[i] = 0;
        } else { ids_of_filtered[i] -= 1; }
      }
    }
    unfilter_tags(_filter,8,nodes[i].tags,i,["departement","departementet"]);
    unfilter_tags(_filter,9,nodes[i].tags,i,["forskare","forskningsaktörer","forskningsfinansiärer","forskningsinstitutioner","forskningsråd"]);
    unfilter_tags(_filter,10,nodes[i].tags,i,["huvudman","huvudmän","huvudmännen"]);
    unfilter_tags(_filter,11,nodes[i].tags,i,["lärare"]);
    unfilter_tags(_filter,12,nodes[i].tags,i,["kommunpolitiken","kommunpolitik"]);
    unfilter_tags(_filter,13,nodes[i].tags,i,["SKL"]);
    unfilter_tags(_filter,14,nodes[i].tags,i,["lärarutbildningar","lärarutbildningarna"]);
    unfilter_tags(_filter,15,nodes[i].tags,i,["lärosäten","lärosäte","lärosätesledningar"]);
    unfilter_tags(_filter,16,nodes[i].tags,i,["regeringen","regering","regeringskansliet"]);
    unfilter_tags(_filter,17,nodes[i].tags,i,["regionen","regering","regeringskansliet"]);
    unfilter_tags(_filter,18,nodes[i].tags,i,["skolledning","skolledare","skolhuvudman","skolhuvudmän"]);
    unfilter_tags(_filter,19,nodes[i].tags,i,["skolverket","solverket","skolveket"]);
    unfilter_tags(_filter,20,nodes[i].tags,i,["staten","statliga"]);
    unfilter_tags(_filter,21,nodes[i].tags,i,["universitet_och_högskolerådet","universiteten","universitet","universitetskanslersämbetet"]);
    unfilter_tags(_filter,22,nodes[i].tags,i,["vinnova"]);

    // function unfilter_tags(__filter,__no, _node_tags,_i,__keywords){

    // Filter
    if(_filter == 0 && filters[0] == 0 && nodes[i].omrade == 0){ids_of_filtered[i] += 1;}
    if(_filter == 1 && filters[1] == 0 && nodes[i].omrade == 1){ids_of_filtered[i] += 1;}
    if(_filter == 2 && filters[2] == 0 && nodes[i].omrade == 2){ids_of_filtered[i] += 1;}

    filter_tags(_filter,4,nodes[i].tags,i,["kort","tidkort"]);
    filter_tags(_filter,5,nodes[i].tags,i,["medel","tidmedel","medeltid"]);
    filter_tags(_filter,6,nodes[i].tags,i,["lång","långtid","tidlång"]);
    if(_filter == 7 && filters[7] == 0){
      if(nodes[i].tags != undefined){
        var t_length = nodes[i].tags.length;
        console.log(nodes[i].tags);
        if(t_length <= 0){
          ids_of_filtered[i] += 1;
        } else {
          var te = 0;
          for(var j = 0; j < t_length; j++){
            var tag = nodes[i].tags[j];
            if(tag.match("kort") || tag.match("tidkort") || tag.match("lång") || tag.match("långtid") || tag.match("tidlång") || tag.match("medel") || tag.match("tidmedel") || tag.match("medeltid")){
              te++;
            }
          }
          if(te == 0){
            ids_of_filtered[i] += 1;
          }
        }
      } else {
        ids_of_filtered[i] += 1;
      }
    }

    filter_tags(_filter,8,nodes[i].tags,i,["departement","departementet"]);
    filter_tags(_filter,9,nodes[i].tags,i,["forskare","forskningsaktörer","forskningsfinansiärer","forskningsinstitutioner","forskningsråd"]);
    filter_tags(_filter,10,nodes[i].tags,i,["huvudman","huvudmän","huvudmännen"]);
    filter_tags(_filter,11,nodes[i].tags,i,["lärare"]);
    filter_tags(_filter,12,nodes[i].tags,i,["kommunpolitiken","kommunpolitik"]);
    filter_tags(_filter,13,nodes[i].tags,i,["SKL"]);
    filter_tags(_filter,14,nodes[i].tags,i,["lärarutbildningar","lärarutbildningarna"]);
    filter_tags(_filter,15,nodes[i].tags,i,["lärosäten","lärosäte","lärosätesledningar"]);
    filter_tags(_filter,16,nodes[i].tags,i,["regeringen","regering","regeringskansliet"]);
    filter_tags(_filter,17,nodes[i].tags,i,["regionen","regering","regeringskansliet"]);
    filter_tags(_filter,18,nodes[i].tags,i,["skolledning","skolledare","skolhuvudman","skolhuvudmän"]);
    filter_tags(_filter,19,nodes[i].tags,i,["skolverket","solverket","skolveket"]);
    filter_tags(_filter,20,nodes[i].tags,i,["staten","statliga"]);
    filter_tags(_filter,21,nodes[i].tags,i,["universitet_och_högskolerådet","universiteten","universitet","universitetskanslersämbetet"]);
    filter_tags(_filter,22,nodes[i].tags,i,["vinnova"]);

    if(_filter == 23 && filters[23] == 0){

    }
  }

  var new_nodes = [];
  for(var i = 0; i < nodes.length; i++){
    if(ids_of_filtered[i] == 0){ new_nodes.push(nodes[i]); }
  }
  redraw_bubbles(new_nodes);
  filters[_filter] = 1 - filters[_filter];  // Activated Filters toggle
}

function filter_tags(__filter, __no, _node_tags,_i,__keywords){
  if(__filter == __no && filters[__no] == 0){
    if(_node_tags != undefined){
      var t_length = _node_tags.length;
      var k_length = __keywords.length;
      var filter_string = "("
      for(var i = 0; i < k_length; i++){
        if(i != __keywords.length-1){
          filter_string += ""+__keywords[i]+"|"
        } else {
          filter_string += ""+__keywords[i]+")";
        }
      }
      for(var i = 0; i < t_length; i++){
        var tag = _node_tags[i];
        if(tag.match(filter_string)){
          ids_of_filtered[_i] += 1;
        }
      }
    }
  }
}

function unfilter_tags(__filter,__no, _node_tags,_i,__keywords){
  if(__filter == __no && filters[__no] == 1){
    if(_node_tags != undefined){
      var t_length = _node_tags.length;
      var k_length = __keywords.length;
      var filter_string = "("
      for(var i = 0; i < k_length; i++){
        if(i != __keywords.length-1){
          filter_string += ""+__keywords[i]+"|"
        } else {
          filter_string += ""+__keywords[i]+")";
        }
      }
      for(var i = 0; i < t_length; i++){
        var tag = _node_tags[i];
        if(tag.match(filter_string)){
          ids_of_filtered[_i] -= 1; }
      }
    }
  }
}

function change_color(d){
  var element = $(d);
  var text = element.text();
  // console.log(element);
  // if(!element.hasClass("active")){
    // element.addClass("btn-outline-primary");
  // } else {
    // element.removeClass("btn-outline-primary");
  // }
  if(text.match("Fokusområde")){
    picked_color_set = 1;
  } else if (text.match("Rådslag")){
    picked_color_set = 0;
  }
  d3.selectAll(".bubble")
    .transition()
      .style("fill",function(d){ return mote_color(d);});

}

function mote_color(d){
  if(picked_color_set == 0){
    return radslag_colors[d.meeting];
  } else if (picked_color_set == 1){
    return omrade_colors[d.omrade];
  }
  // console.log(d);
  // radslag_colors[d.meeting] = color(d.meeting);
  // return color(d.meeting);
}

function mote_stroke_color(d){
  return omrade_stroke_colors[d.omrade];
}

function prepare_meetings(meeting_information){
  for(var i = 0; i < meeting_information.length; i++){
    // console.log(meeting_information[i].title);
    if(i > 6){
      radslag_centers[meeting_information[i].uid] = {x: ((meeting_information.length-i) * 200  ), y: (height/2)};
      radslag_titles_x[meeting_information[i].title] = (meeting_information.length-i) * 200;
    } else {
      radslag_centers[meeting_information[i].uid] = {x: ((meeting_information.length-i) * 200 +110 ), y: height/2};
      radslag_titles_x[meeting_information[i].title] = (meeting_information.length-i) * 200 + 150;
    }

    // Need some speciality here due to size and clashing.
    if(meeting_information[i].title.match('Rådslag 2 \\| Fokusområde Digital kompetens för alla i skolväsendet')){
      radslag_titles_y[meeting_information[i].title] = 150;
      radslag_titles_x[meeting_information[i].title] = (meeting_information.length-i) * 200 - 60;
    }else  if(meeting_information[i].title.match('Learning forum 2018')){
      radslag_titles_y[meeting_information[i].title] = 100;
      radslag_titles_x[meeting_information[i].title] = (meeting_information.length-i) * 200 + 100;
    } else if(meeting_information[i].title.match('Regionalt Rådslag \\| Östergötland')){
      radslag_titles_y[meeting_information[i].title] = 150;
      radslag_titles_x[meeting_information[i].title] = (meeting_information.length-i) * 200 + 150;
    } else if(meeting_information[i].title.match('Rådslag 1 \\| Fokusområde Digital kompetens för alla i skolväsendet')){
      radslag_titles_x[meeting_information[i].title] = (meeting_information.length-i) * 200 + 130;
      radslag_titles_y[meeting_information[i].title] = 120;

    }
     else {
      radslag_titles_y[meeting_information[i].title] = 170;
    }
  }
}

function convert_omrade(q_id){
  return question_omrade[q_id];
}

function convert_tid(tags){
  if(tags == undefined){
    return 3;
  }
  for(var i = 0; i < tags.length; i++){
    var key = tags[i];
    if(key.match("kort") || key.match("tidkort")){
      return 0;
    }
    if(key.match("medel") || key.match("tidmedel") || key.match("medeltid")){
      return 1;
    }
    if(key.match("lång") || key.match("långtid") || key.match("tidlång")){
      return 2;
    }
  }
  return 3;
}

function get_radslag_type(uid){
  for(var i = 0; i < meet_info.length; i++){
    var k = meet_info[i].uid;
    if(k.match(uid)){
      return meet_info[i].radslag_type;
    }
  }
  return 0;
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

function create_tid_titles(){
  var omradeData = d3.keys(tid_titles);
  var years = g.selectAll('.tidTitles')
  .data(omradeData);

years.enter().append('text')
  .attr('class', 'tidTitles')
  .attr('display','none')
  .attr('x', function (d) { return tid_titles_x[d]; })
  .attr('y', function(d){  return tid_titles_y[d];})
  .attr('text-anchor', 'middle')
  .text(function (d) { return tid_titles[d]; });
}

function create_reg_titles(){
  var omradeData = d3.keys(reg_titles);
  var years = g.selectAll('.regtitles')
  .data(omradeData);

years.enter().append('text')
  .attr('class', 'regTitles')
  .attr('display','none')
  .attr('x', function (d) { return reg_titles_x[d]; })
  .attr('y', function(d){  return reg_titles_y[d];})
  .attr('text-anchor', 'middle')
  .text(function (d) { return reg_titles[d]; });
}

function hide_infobox(){
  $("#info_box").css("display","none");
}

var about_showed = 1;
function toggle_about(a){
  if(a == 0){
    d3.select(".about_box")
      .style("display","initial");

    d3.select(".inner_content")
      // .transition()
      // .style('filter','blur(2px)');
      //     filter: blur(2px);

      .classed("blurredElement",true);
  } else if(a == 1) {
    d3.select(".about_box")
      .style("display","none");

    d3.select(".inner_content")
      .classed("blurredElement",false);
  }
  about_showed = a;
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
  if(view_option == 3){
    $(".tidTitles").css("display","initial");
  } else {
    $(".tidTitles").css("display","none");
  }
  if(view_option == 4){
    $(".regTitles").css("display","initial");
  } else {
    $(".regTitles").css("display","none");
  }
}


function create_legend(){

  var t = svg.append("g")
  .classed('legend','true')
  // .attr('x',50);
  var spec_height = height - 60;
  var width_s = 170
  var extra_width = 30;
  var xt = t.selectAll('.legend')
    .data(d3.keys(omrade_titles));

  xt.enter().append('rect')
    .attr('width','10')
    .attr('height','10')
    .attr("stroke","black")
    .attr("stroke-width",0.3)
    .attr('x',10)
    .attr('y',function(d){
      return d*15 + spec_height;
    })
    .attr('fill',function(d){
      return omrade_colors[d];
    })
    .classed('legend_rect','true');

  xt.enter().append('text')
    .attr("text-anchor","start")
    .attr('x', function(d){
      return 25;
    })
    .attr('y',function(d){
      return d*15 + spec_height + 8;
    })
    .text(function(d){
      return omrade_titles[d];
    });
}

function show_intro(){
  console.log('we show intro');
}

window.setInterval(function(){
  move_bubbles(view_option);
}, 5000);

window.addEventListener('click', function(e){
  if (document.getElementById('about_box').contains(e.target)){
    // Clicked in box
  } else{
    // Clicked outside the box
    if(!document.getElementById('about_tog').contains(e.target) && about_showed == 0){
      toggle_about(1);
    }
  }
  if(document.getElementById('bubbles_svg_area').contains(e.target)){
    // console.log(document.getElementById('bubbles_svg_area'));
    // var xta = document.getElementsByClassName("bubble");
    // console.log(xta);
    // for(var i = 0; i < xta.length; i++){
    //   if(xta[0].contains(e.target)){
    //     console.log(1);
    //     return;
    //   }
    // }
    // show_intro();
  } else {
    //
    // if(document.getEle)

  }
});

window.addEventListener("mousemove", function(e){
  // console.log(e);
  if(tooltip_visible == 1){
    var y = e.clientY+18;
    var x = e.clientX-80;
    var y_cap = document.getElementById("tooltip_bub").clientHeight;
    if(y > height-y_cap){
      y = height-y_cap;
    }
    if(x > 1200){
      x = 1200;
    }
    tooltip.style("left", x + "px")
        .style("top", y + "px");
  }
});
