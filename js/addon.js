// http://sebastien.drouyer.com/jquery.flowchart-demo/
/// https://github.com/sdrdis/jquery.flowchart
// https://gojs.net/latest/index.html

var config = {
  
}

$(document).ready(function() {
  var myDiv = null;
  var asignaturas = [];
  var prereqs = [];
  var loaded = false;
    $("#dropperBtn").click(function() {

      var url = "carreras/";

      loaded = true;
      url += $("#dropper").val(); 
      url += '.html';
      $.get(url, function(data){
        //console.log(data);
        var html = $.parseHTML( data );
        $(html).find(".btns").remove();

        if(myDiv != null) {
          $('#loader').empty();
        }
        $('.chart').empty();
        $("input").prop("disabled", false);
        $("textarea").prop("disabled", false);
        myDiv = $(html).find('.contPensum');
        //var myDiv = $(html).find('div');
        $('#loader').append(myDiv);
        $("#loadbtn").click(function () {
            $("#file1").trigger('click');
        });
        // FOR THE PURPOSE OF MAKING A BUTTON TO LOAD A CONFIGURATION
        $("#file1").change(function (){
          var files = $('#file1').prop('files');
          var fileReader = new FileReader();
          fileReader.onload = function () {
            var data = fileReader.result;  // data <-- in this var you have the file data in Base64 format
            var str = data.replace('data:text/plain;base64,', '')
            str = $.base64.decode(str);
            sList = str.split(",");
            var it = 0;
            $("table tr").each(function (i, row) {
              var truth = sList[it] == 1 ? true : false;
              var myid = $(this).children('td:first-child').text();
              myid = myid.trimStart().trimEnd();
              if(truth) {
                if(myid!="") {
                  $(this).children("input[type=checkbox]").attr("checked", true).trigger("change");
                } else {
                  $(this).children("input[type=checkbox]").attr("checked", true);
                }
              }
              it++;
            });
           $("#file1").val('');
          };
          fileReader.readAsDataURL(files[0]);
        });
        var sList = "";
        

        /////////////////
        // HEADER BITS //
        /////////////////


        function checkBoxMark(target) {
          $checked = $(target).attr("checked") == "checked" ? true : false;
          var id = $(':nth-child(1)', $(target).parent()).text().trimStart().trimEnd();
          // avoid redundancy
          if(asignaturas[id]['selected'] == $checked) return;

          if( $checked == false ) {
            $header = $(target).parent().parent().find(".headcheck");
            $header.children("input[type=checkbox]").attr("checked", false);
          }
          $(target).closest('tr').toggleClass('highlight');

          asignaturas[id]['selected'] = $checked;

          if(prereqs[id]) {
            $.each(prereqs[id], function (index, value) {
                if(asignaturas[value].disabled && $checked) {
                  var doContinue = true;
                  $(asignaturas[value]['prereq']).map(function(i, a) {
                      if(a != id && asignaturas[a]['selected'] == false) {
                        doContinue = false;
                      }
                  });
                  if(doContinue) {
                    asignaturas[value].disabled = false;
                    var htmlElem = asignaturas[value].htmlref;
                    $(htmlElem).append('<input class="chkAsg" type="checkbox"/>');
                    $(htmlElem).closest('tr').toggleClass('highlightRed');
                  }
                } else if(!asignaturas[value].disabled && !$checked) {
                    asignaturas[value].disabled = true;
                    var htmlElem = asignaturas[value].htmlref;
                    $(htmlElem).children(".chkAsg").attr("checked", false).trigger("change").remove();
                    $(htmlElem).closest('tr').toggleClass('highlightRed');
                }
            });
          }
        }

        function change_checkBoxMark(event) { // enable selection upon use
          checkBoxMark(event.target);
        }

        // FOR THE PURPOSE OF SAVING THE CONFIGURATION TO THE TEXT BOX
        // FOR THE PURPOSE OF DOWNLOADING TO A JSON [pending JSON]
        $("a#programatically").click(function() {
            sList = "";
    /*      $('input[type=checkbox]').each(function () {
              var sThisVal = (this.checked ? "1" : "0");
              sList += (sList=="" ? sThisVal : "," + sThisVal);
          });*/
          //console.log (sList);
          $("table tr").each(function (i, row) {
              $checked = $(this).children("input[type=checkbox]").attr("checked");
              var sThisVal = ($checked ? "1" : "0");
              sList += (sList=="" ? sThisVal : "," + sThisVal);
          });
          this.href = "data:text/plain;charset=UTF-8," + encodeURIComponent(sList);
        });
        

        ///////////////
        // BODY BITS //
        ///////////////
        
        // check this out for free hits:
        // https://html5-tutorial.net/Localization/LanguageStatus/es/

        // ADD CHECKBOXES TO DETERMINE CURRENT PROGRAMME DEVELOPMENT

        $("table tr").each(function (i, row) {
            $prereq = $(this).find("th:contains('Pre-Requisitos')");
    //            $checkedBoxes = $row.find('input:checked');
            
            // ASSIGN A CHECKBOX TO EACH TABLE ROW FOR CHOICES
            //
            if($prereq.length) { // does it have a header Column?
              $(this).toggleClass('headcheck');
              $(this).append('<input class="chkHead" type="checkbox"/>');
            } else { // otherwise it is a selectable course
              
              /////////////////////////////////////////
              // the making of a configuration array //
              /////////////////////////////////////////
              var texty = $(':nth-child(4)', this).text(); // § export dynamic table?

              var expresion = /[A-Z]{3}[0-9]{3}/gi;
              var patt = new RegExp(expresion);
              var res = patt.test(texty);
              var asignatura = [];
              asignatura['htmlref'] = this;

              var codigo = $(':nth-child(1)', this).text().trimStart().trimEnd();
              asignatura['label'] = $(':nth-child(2)', this).text().trimStart().trimEnd();
              asignatura['creditos'] = $(':nth-child(3)', this).text().trimStart().trimEnd();
              asignatura['selected'] = false;
              if(res) {
                $matches = texty.match(expresion);
                asignatura['prereq'] = $matches;
                $matches.map(function(i) {
                    if(!prereqs[i]) {
                      prereqs[i] = [];
                    }
                    prereqs[i].push(codigo);
                });
                asignatura['disabled'] = true;
                $(this).toggleClass('highlightRed');
              } else {
                /////////////////////////////////
                // the formation of a checkbox //
                /////////////////////////////////
                $checkbox = $(this).append('<input class="chkAsg" type="checkbox"/>');
              }
              asignaturas[codigo] = asignatura;
            }
        });
        $(".chkHead").change(
          function() { // enable all course select
            $checked = $(this).attr("checked") == "checked" ? true : false;
            $(this).parent().parent().children("tr:not(.headcheck)").each(        
              function () {
                $(this).children("input[type=checkbox]").attr("checked", $checked).trigger("change");
            });
          });
        $(document).on("change", '.chkAsg',  change_checkBoxMark);

        $("html").css("background", "none"); // default apec css sux
        //$("body").append(""); // req'd

        /////////////////
        // FOOTER BITS //
        /////////////////

        // begin configuration for Treant JS (flowchart/matrix/graph builder)

        var config = { // initial cfg for diagram
            container: "#custom-colored",

            nodeAlign: "BOTTOM",
            
            connectors: {
                type: 'step'
            },
            node: {
                HTMLclass: 'nodeExample1'
            }
        },
        main = { // programme identifier
                text: {
                    name: "Ingenieria de Software",
                    //title: "Chief executive officer",
                    //contact: "Tel: 01 213 123 134",
                },
                image: "img/unapec.png"
            };
        var chart_config = [config,
            main
        ];

        var myobj; // declare this for further use in recursion

        // also, byo recursive function
        function looper(object, callback) {
            for (var key in object) {
                if (object.hasOwnProperty(key)) {
                    if (false === callback.call(object[key], key, object[key])) {
                        break;
                    }
                }
            }
            return object;
        }

        $("#genebtn").click(function() {
          var cfgs = []; // i can has cfg?

            // recursive run in order to configure each diagram object
          looper(asignaturas, function(index, value){
              var parent = main; // all courses start from the programme identifier [PI]
              if(value['prereq'] && value['prereq'].length > 0) {
                // unless it should have pre-reqs,
                // from which it will choose the first
                parent = cfgs[value['prereq'][value['prereq'].length-1]];
              }

              // then, it will make individual object for each course
              myobj = {
                parent: parent,
                text:{
                    name: index, // having course id
                    label: value['label'], // having course description
                    creditos: "Creditos: " + value['creditos'] // and having course creds
                }
              };
              if(value['selected']==true) {
                myobj['HTMLclass']='highlight';
              }
              cfgs[index] = myobj;
              chart_config.push(myobj);
            //your code
          });

        // the making of a graphic diagram
        var treant = new Treant( chart_config, function() {
            for ( i = 0, len = treant.tree.nodeDB.db.length; i < len; i++ ) {
              node = treant.tree.nodeDB.get(i);
              if(asignaturas[node.text.name])
                asignaturas[node.text.name]['id'] = i;
            };

            // recursive run again to (inefficiently) add secondary/tertiary/... parent
            looper(asignaturas, function(index, value){
                if(value['prereq'] && value['prereq'].length > 1) {
                  for ( i = 0, len = value['prereq'].length-1; i < len; i++ ) {
                    var color = value['prereq'][i];
                    color = "#"+color.substr(3,1) +"0"+ color.substr(4,1) +"0"+ color.substr(5,1) +"0";

                    // debugging?
                    //console.log(color, value['prereq'][i]);

                    treant.tree.addConnectionToNode(treant.tree.nodeDB.get(value.id), false,treant.tree.nodeDB.get(asignaturas[value['prereq'][i]].id), color);
                  }
                }
            });
          });
        });
      });
    })
});