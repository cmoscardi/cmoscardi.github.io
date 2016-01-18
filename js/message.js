var QueryParams = (function(a) {
    if (a == "") return {};
    var b = {};
    for (var i = 0; i < a.length; ++i)
    {
        var p=a[i].split('=', 2);
        if (p.length == 1)
            b[p[0]] = "";
        else
            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
    }
    return b;
})(window.location.search.substr(1).split('&'));

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

var nav_input_handler = function() {
  $(".option").show();
  $(".content").show();
  $("#cursor").addClass("flash");

  $("body").keydown( function(event) {
    if(event.keyCode==13){
      var choice = $("#input").text();
      window.location = $("#" + choice + " a").attr('href');
    }
    else {
      $("#input").text(String.fromCharCode(event.keyCode));
    }

    $("#input").text(String.fromCharCode(event.keyCode));
  });
  fix_backspace();
  $(".content").show();
  $(".content").css("display", "block");
}

$(function(){
  if($(".home").length > 0){
    $("#message").type({delay:500, maxInterval:50, callback:index_input_handler});
    return;
  }
  if($("#message").length > 0 && QueryParams['noType'] != 'true'){
    $("#message").type({delay:500, maxInterval:50, callback:nav_input_handler});
  }
  else {
    nav_input_handler();
  }
});
