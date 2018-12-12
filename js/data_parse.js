// Class for JSON dataparsing & putting all the meetings
// Into the same file in the correct format.


function delayedHello(callback) {
  setTimeout(function() {
    console.log("Hello!");
    callback(null);
  }, 250);
}

//https://bl.ocks.org/mbostock/1696080
//https://github.com/d3/d3-queue
function parse_file(){

  var q = d3.queue();
  // q.defer(delayedHello);
  // q.defer(d3.text,'list_of_files');
  // q.wait for finish.
  // Process this text into al ist of files

  // For loop that iterates and creates new 'defer' items for each filename
  // Then we do awaitAll
  // Process that data into a data json variables
  // And then starT_program with that data.
  //
  q.defer(d3.json, 'data/real/radslag-gotland.json');
  q.defer(d3.json, 'data/real/regionalt-radslag-goteborg.json');
  q.defer(d3.json, 'data/real/radslag-1-fou.json');
  q.defer(d3.json, 'data/real/regionalt-radslag-skane.json');
  q.defer(d3.json, 'data/real/radslag-1-delmal-1-2.json');
  q.defer(d3.json, 'data/real/radslag-1-likvardig-tillgang-och-anvandning.json');
  q.defer(d3.json, 'data/real/regionalt-radslag-ostergotland.json');
  q.defer(d3.json, 'data/real/learning-forum-2018.json');
  q.defer(d3.json, 'data/real/regionalt-radslag-norrbotten.json');
  q.defer(d3.json, 'data/real/regionalt-radslag-vasterbotten.json');
  q.defer(d3.json, 'data/real/gymn18.json');
  q.defer(d3.json, 'data/real/radslag-orebro-lan.json');
  q.defer(d3.json, 'data/real/regionalt-radslag-jonkoping.json');
  q.defer(d3.json, 'data/real/radslag-orebro.json');
  q.defer(d3.json, 'data/real/radslag2-kompetens.json');
  // q.defer(d3.json, 'data/real/');


  q.defer(d3.json, 'data/real/q_o.json');
  q.defer(d3.json, 'data/real/meeting_info.json');

  // First we read

  q.awaitAll(function(error, data_list){
    if(error) throw error;
    // var fin_d = process_data(data_list[1]);
    for(var i = 1; i < data_list.length; i++){
      if(i == data_list.length-2){
        question_id_omrade = data_list[i];
        // console.log(question_id_omrade);
      } else if(i == data_list.length-1){
        for(var k = 0; k < meeting_information.length;k++){
          meeting_information[k].radslag_type = data_list[i][k].radslag_type;
        }
      } else {
        process_data(data_list[i]);
      }
    }
    // var list = [];
    // var text = "";
    // for(var k = 0; k < meeting_information.length; k++){
    //   var d = {};
    //   // console.log(meeting_information);
    //   d.uid = meeting_information[k].uid;
    //   d.title = meeting_information[k].title;
    //   d.radslag_type = 0;
    //   list.push(d);
    //   // console.log(d);
    //   // text += JSON.stringify(d);
    // }
    // $(".check_text").text(JSON.stringify(list));

    start_program(meeting_data, meeting_information, question_id_omrade);
  });
}

// Need 1 list for all Meeting Information
// Contains meeting objects
var meeting_information = [];
// 1 list for ALL proposals as per how it will be treated.
// List of proposal objects.
var meeting_data = [];
var actors = {};
var question_id_omrade = {};
//
//

var users = {};

function process_data(data){
  add_meeting(data);
  add_proposals(data);
  // console.log(users);
}
var c = 0;
function add_meeting(data){
  var d = {};
  // console.log(data);
  d.manifest = data.manifest;
  d.path = data.path;
  d.title = data.title;
  d.uid = data.uid;
  d.id = meeting_information.length;
  d.radslag_type = radslag_type(data.uid);
  var questions = [];
  var no_q = d.manifest.AgendaItem;
  // console.log(no_q);
  // console.log(d.contents);
  for(var i = 0; i < no_q; i++){
    var q = {};
    q.uid = data.contents[i].uid;
    q.path = data.contents[i].path;
    q.name = data.contents[i].title;
    q.manifest = data.contents[i].manifest;
    questions.push(q)
    // if(q.uid != undefined){
      // question_id_omrade[q.name] = 1;
      // question_id_omrade[q.uid] = 1;

      // console.log(question_id_omrade[q.uid]);
      // console.log((c+2) + " | " + q.name);
      // console.log(q.uid);
      // c++;
    // }
  }
  d.questions = questions;
  // console.log(no_q);
  // console.log(d);

  var participants = data.participants;
  for (var i = 0; i < participants.length; i++){
        if(users[participants[i]] == undefined){
          users[participants[i]] = 1;
        } else {
          users[participants[i]] += 1;
        }
  }

  meeting_information.push(d);
}

function add_proposals(data){
  var no_q = data.manifest.AgendaItem;
  // This is the proposal
  var manifest_id = data.uid;
  for(var i = 0; i < no_q; i++){
    var no_f = data.contents[i].manifest.Proposal;
    var q_id = data.contents[i].uid;
    for(var j = 0; j < no_f; j++){
      var d = {};
      d.meeting_id = manifest_id;

      // console.log(meeting_information[i]);
      d.question_id = q_id;
      d.proposal_id = data.contents[i].contents[j].uid;
      d.hashtag = data.contents[i].contents[j].aid;
      d.path = data.contents[i].contents[j].path;
      d.author = data.contents[i].contents[j].creator;
      d.tags = data.contents[i].contents[j].tags;
      d.text = data.contents[i].contents[j].text;
      d.type = 0;

      // console.log(d.tags);
      // console.log(actors[])

      // if(d.tags != undefined){
      //   for(var k = 0; k < d.tags.length-1; k++){
      //     if(actors[d.tags[k]] == undefined){
      //       actors[d.tags[k]] = 1;
      //
      //     } else {
      //       actors[d.tags[k]] += 1;
      //
      //     }
      //   }
      // }

      meeting_data.push(d);
    }
  }
  // console.log(mee)
}

function read_list_of_files(){
  d3.csv("data/names.csv",function(error, data){
    console.log(data);
  });
}

function radslag_type(uid){
  // Cross reference uid type with radslag_type list_of_files

  return 0;
}

parse_file();
