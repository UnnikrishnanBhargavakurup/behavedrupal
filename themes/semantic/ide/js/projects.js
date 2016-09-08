"use strict";

(function($) {

  $(".dialog-open").on("click", ".delete_project", function(e) {
    e.preventDefault();
    e.stopPropagation();
    var col = $(this).parent();
    var pid = col.data("id"); 
    $.ajax({
      url : "/behave/delete/"+ pid +"?_format=json",
      method : "DELETE",
      beforeSend: function (request) {
        request.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        request.setRequestHeader("X-CSRF-Token", window.behave.csrf_token);
        $(".auto_save").show();
      },
      dataType: "json",
      error: function(data) {
      },
      success : function(data) {
        $(col).closest('tr').remove();
      }
    });
  });

  /**
   * download a build as zip file
   */
  $(".dialog-open").on("click", ".download_project", function(e) {
    e.preventDefault();
    e.stopPropagation();
    var pid = $(this).parent().data("id");
    $.ajax({
      url : "/behave/download/?_format=json",
      method : "POST",
      beforeSend: function (request) {
        request.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        request.setRequestHeader("X-CSRF-Token", window.behave.csrf_token);
      },
      dataType: "json",
      data : JSON.stringify({'id': pid}),
      error: function(response) {
      },
      success : function(response) {
        downloadFile(response.url);
      }
    });
  });

  /**
   * clear save project filed 
   * since we save to existing project.
   */
  $("#saved_projects").change(function(e) {
    if($(this).val() != "") {
      $("#save_project").val("");
    }
  });
  
  /**
   * clear saved project filed 
   * since this is a new project.
   */
  $("#save_project").keydown(function(e) {
    $("#saved_projects").val('');
  });

})(jQuery);