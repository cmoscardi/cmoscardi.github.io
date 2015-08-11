var fix_backspace = function() {

  $("body").keydown( function(event) {
    if(event.which==8){
      event.preventDefault();
      $("#input").text("");
    }
  });
}

var index_input_handler = function() {
  $("#cursor").addClass("flash");

  $("body").keydown( function(event) {
    if(event.keyCode==13 &&
      ($("#input").text().toLowerCase().indexOf("y")!=-1)){ 
          
        window.location="./home.html";
    }
    $("#input").text(String.fromCharCode(event.keyCode));
  });
  fix_backspace();
}

var hide_all = function() {
  $(".hidden").hide();
}

var homepage_input_handler = function() {
  $(".option").show();
  $("#cursor").addClass("flash");

  $("body").keydown( function(event) {
    if(event.keyCode==13){
      switch($("#input").text()){
        case "1":
          hide_all();
          $("#about").show();
          break;
        case "2": 
          hide_all();
          $("#links").show();
          break;
        case "3":
          hide_all();
          $("#projects").show();
          break;
        case "4":
          hide_all();
          $("#blog").show();
          break;
      }
      $("#input").text("");
    }

    $("#input").text(String.fromCharCode(event.keyCode));
  });
  fix_backspace();
}




