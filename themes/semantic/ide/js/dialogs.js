
/**
 * Dialogs used in the workarea and functionalities associated ot it.
 */

"use strict";

(function($) {
  var dialog_scenario = document.querySelector('.dialog_add-scenario');

  var showDialogButton = document.querySelector('.add-scenario');

  if (!dialog_scenario.showModal) {
    dialogPolyfill.registerDialog(dialog_scenario);
  }
  // for adding a scenario.
  showDialogButton.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    if($(".feature-item").length == 0) {
      Workspace.showMessage('\
      <span>Please add a feature before adding scenarios</span>\
      <div class="clearfix"> </div>\
      <div class="clearfix"> </div>\
      <div style="display:block;overflow:hidden;">\
        <a style="margin-top: 9px;display: inline-block;" class="help-txt help-link" data-index="1" href="#">Help?</a>\
        <button id="add_feature" style="float:right;" type="button" class="mdl-button mdl-js-button mdl-button--primary">Ok</button>\
      </div>');
      return;
    }
    $(".feature-name").text(Workspace.getActiveChild().name);
    dialog_scenario.show();
  });

  dialog_scenario.querySelector('.close').addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    dialog_scenario.close();
  });

  dialog_scenario.querySelector('.btn_add-scenario').addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    var scenario_name = $("#scenario-name").val().trim();
    if(scenario_name != "") {
      var scenario = new Scenario(scenario_name);
      Workspace.getActiveChild().addUniqueChild(scenario);
      $("#scenario-name").val('');
    }
    dialog_scenario.close();
  });

  var dialog_feature = document.querySelector('.dialog_add-feature');
  var showDialogButton_feature = document.querySelector('.add-feature');
  if (!dialog_feature.showModal) {
    dialogPolyfill.registerDialog(dialog_feature);
  }
  // for adding a scenario.
  showDialogButton_feature.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    Feature.add();
  });

  dialog_feature.querySelector('.close').addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    dialog_feature.close();
  });

  dialog_feature.querySelector('.btn_add-feature').addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    var feature_name = $("#feature-name").val().trim();
    var feature_description = $("#feature-description").val().trim();
    if(feature_name != "") {
        var fetaure = new Feature(feature_name, feature_description);
        Workspace.addUniqueChild(fetaure);
      $("#feature-name").val('');
      $("#feature-description").val('');
    }
    dialog_feature.close();
  });

  /**
   * Show the add feature dialog from here.
   */
  Feature.add = function() {
    dialog_feature.show();
  }

  var dialog_login = document.querySelector('.dialog_login');

  var showDialogButton_login = document.querySelector('#login');
  if (!dialog_login.showModal) {
    dialogPolyfill.registerDialog(dialog_login);
  }
  // for adding a scenario.
  showDialogButton_login.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    $(".dialog_auth").addClass('dialog_login').removeClass('dialog_reg dialog_password_reset');
    dialog_login.show();
  });
  dialog_login.querySelector('.close').addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    dialog_login.close();
  });

  /**
   * Show the add feature dialog from here.
   */
  Workspace.login = function() {
    dialog_login.show();
  }

  /**
   * Login the user 
   */
  dialog_login.querySelector('.auth_ok').addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    $(".dialog_auth .auth_error").html("");
    $(".profile_details .mdl-spinner").addClass('is-active');
    //  user registraction.
    if($(".dialog_auth").hasClass('dialog_reg')) {
      var email = $("#reg_email").val().trim();
      var password = $("#reg_userpass").val();
      var confirm_password = $("#reg_confirm_pass").val();
      if(email != "" && password != "" && password == confirm_password) {
        $.ajax({
          url : "/behave/register?_format=json",
          method : "POST",
          beforeSend: function (request) {
            request.setRequestHeader("Content-Type", "application/json");
          },
          dataType: "json",
          data : JSON.stringify({
            "email" : email, 
            "pass" : password, 
            "confirm_pass" : confirm_password
          }),
          error: function(data) {
            Workspace.isLoggedin = 0;
          },
          success : function(data) {
            if(data.hasOwnProperty('error')) {
              showAuthError(data.error);
              return;
            }
            $("#user_pic").css("background-image", "url("+ data.pic +")");
            $("#user_name").html(data.name + "<span>&nbsp;</span>");
            $("#login").hide();
            $(".usr-profile").show();
              //success code
            Workspace.isLoggedin = 1;
            dialog_login.close();
          }
        });
      }
      else {
        if(email == "" || password == "") {
          $(".dialog_auth .auth_error").html("Please enter all the fields.");
          $(".profile_details .mdl-spinner").removeClass('is-active');
        }
      }
    }
    // user login form.
    if($(".dialog_auth").hasClass('dialog_login')) {
      var user_name = $("#username").val().trim();
      var user_pass = $("#userpass").val();
      if(user_name != "" && user_pass != "") {
        $.ajax({
          url : "/behave/login?_format=json",
          method : "POST",
          beforeSend: function (request) {
            request.setRequestHeader("Content-Type", "application/json");
          },
          dataType: "json",
          data : JSON.stringify({"name" : user_name, "pass" : user_pass}),
          error: function(data) {
            $(".profile_details .mdl-spinner").removeClass('is-active');
            Workspace.isLoggedin = 0;
          },
          success : function(data) {
            if(data.hasOwnProperty('error')) {
              showAuthError(data.error);
              return;
            }
            $(".profile_details .mdl-spinner").removeClass('is-active');
            $("#user_pic").css("background-image", "url("+ data.pic +")");
            $("#profile_pic").attr("src", data.pic);
            $("#user_name").html(data.name + "<span>&nbsp;</span>");
            $("#login").hide();
            $(".usr-profile").show();
            window.behave.csrf_token = data.csr_token;
            if(data.saved_data.length > 0) {
              for(var i = 0; i <  data.saved_data.length; i++) {
                updateProjectData(data.saved_data[i]);
              }
            }
            Workspace.getAutoSave();
            Workspace.isLoggedin = 1;
            //success code
            dialog_login.close();
          }
        });
      }
      else {
        $(".dialog_auth .auth_error").html("Please enter registerd email and password.");
        $(".profile_details .mdl-spinner").removeClass('is-active');
      }
    }
    // password reset form.
    if($(".dialog_auth").hasClass('dialog_password_reset')) {
      var email = $("#reset_email").val().trim();
      if(email != "") {
        $.ajax({
          url : "/behave/reset-password?_format=json",
          method : "POST",
          beforeSend: function (request) {
            request.setRequestHeader("Content-Type", "application/json");
          },
          dataType: "json",
          data : JSON.stringify({
            "mail" : email
          }),
          error: function(data) {
          },
          success : function(data) {
            if(data.hasOwnProperty('error')) {
              showAuthError(data.error);
              return;
            }
            $(".profile_details .mdl-spinner").removeClass('is-active');
            dialog_login.close();
          }
        });
      }
      else {
        $(".dialog_auth .auth_error").html("Please enter registerd email.");
        $(".profile_details .mdl-spinner").removeClass('is-active');
      }
    }
    //https://codepen.io/sevilayha/pen/IdGKH
  });

  /**
   * show all auth related error.
   */ 
  function showAuthError(error) {
    if(typeof error === 'object' && error.hasOwnProperty('name')) {
      if(error.name.indexOf("Unrecognized username") === 0) {
        $(".dialog_auth .auth_error").html("Unrecognized username or password.");
      }
      if(error.name.indexOf("is already taken") > 0) {
        $(".dialog_auth .auth_error").html("This email already taken did you <a href='#' class='forgot-password-link'>forgot your password?</a>");
      }
      if(error.name.indexOf("is not recognized as a username") > 0) {
        $(".dialog_auth .auth_error").html("User does not exist");
      }
      if(error.name.indexOf("more than 5 failed login attempts") > 0) {
        $(".dialog_auth .auth_error").html("So many faild login attempt for this account.");
      }
      if(error.name.indexOf("is not recognized as a username or an email") > 0) {
        $(".dialog_auth .auth_error").html("Account dosen't exist.");
      }
      $(".profile_details .mdl-spinner").removeClass('is-active');
      return;
    }

    if(error.indexOf("invalid email") === 0) {
      $(".dialog_auth .error-msg").html("Invalid email address.");
    }
    if(error.indexOf("not matching") === 0) {
      $(".dialog_auth .error-msg").html("Password not matching.");
    }
    if(error.indexOf("Missing data") === 0) {
      $(".dialog_auth .error-msg").html("Something went wrong please refresh the page and try agaian.");
    }
    if(error.indexOf("captcha") === 0) {
      $(".dialog_auth .auth_error").html("Wrong captcha.");
    }
    $(".profile_details .mdl-spinner").removeClass('is-active');
  }
  
  $(".dialog_auth input").focusin(function(e) {
    $(".dialog_auth .auth_error").html("");
  });

  /**
   * Logout here
   */
  $("#logout").click(function(e) {
    e.preventDefault();
    e.stopPropagation();
    $(".profile_details .mdl-spinner").addClass('is-active');
    $.get( "/user/logout", function(data) {
      Workspace.logout();
    });
  });


  /*
  var dialog_feedback = document.querySelector('.feedback-dialog');
  var showDialogButton_feedback = document.querySelector('#feedback');
  if (!dialog_feedback.showModal) {
    dialogPolyfill.registerDialog(dialog_feedback);
  }
  // for adding a scenario.
  showDialogButton_feedback.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    dialog_feedback.show();
  });

  dialog_feedback.querySelector('.close').addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    dialog_feedback.close();
  });
  */

  var dialog_save = document.querySelector('.save-dialog');
  var showDialogButton_save = document.querySelector('#save');
  if (!dialog_save.showModal) {
    dialogPolyfill.registerDialog(dialog_save);
  }
  // for adding a scenario.
  showDialogButton_save.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    if(Workspace.isLoggedin) {
      dialog_save.show();
    }
    else {
      Workspace.showMessage('\
      <span>Please <a href="#" class="open_login">login</a> / <a href="#" class="open_register">register</a> for saving a project.</span>\
      <div class="clearfix"> </div>\
      <div style="float:right;">\
        <button type="button" class="mdl-button mdl-js-button mdl-button--primary open_login">Ok</button>\
      </div>');
    }
  });

  dialog_save.querySelector('.close').addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    dialog_save.close();
  });

  dialog_save.querySelector('.btn-save').addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    if(window.behave.csrf_token == "") {
      get_token(save_projects);
    }
    else {
      save_projects();
    }
  });

  /**
   * Save this as a new project to backend.
   */
  function save_projects() {
    var project_name = $("#save_project").val().trim();
    var project_data = Workspace.getData();
    var id = "";
    if(project_name == "") {
      id = $("#saved_projects").val();
      project_name = "";
    }
    if((project_name || id) != "" && project_data.length  > 0) {
      $.ajax({
        url : "/behave/save?_format=json",
        method : "POST",
        beforeSend: function (request) {
          request.setRequestHeader("X-CSRF-Token", window.behave.csrf_token);
          request.setRequestHeader("Content-Type", "application/json; charset=utf-8");
          $(".save-dialog .mdl-spinner").addClass('is-active');
        },
        dataType: "json",
        data : JSON.stringify({
          "name" : project_name, 
          "data" : project_data,
          "id" : id
        }),
        error: function(data) {
          $(".save-dialog .mdl-spinner").removeClass('is-active');
        },
        success : function(data) {
          updateProjectData(data);
          dialog_save.close();
          $(".save-dialog .mdl-spinner").removeClass('is-active');
        }
      });
    }
  };
  
  /**
   * update data in open and save dialogboxes.
   */
  function updateProjectData(data) {
    var created = new Date(data.created * 1000);
    $(".dialog-open tbody").prepend('<tr>\
                <td class="project-title">'+ data.title +'</td>\
                <td>'+ created.getDate() + '/' + (created.getMonth() + 1) + '/' + created.getFullYear() +'</td>\
                <td data-id="'+ data.pid +'">\
                  <button class="mdl-button mdl-js-button mdl-button--icon delete_project">\
                    <i class="material-icons">delete</i>\
                  </button>\
                  <button class="mdl-button mdl-js-button mdl-button--icon download_project">\
                    <i class="material-icons">file_download</i>\
                  </button>\
                  <button class="mdl-button mdl-js-button mdl-button--icon open_project">\
                    <i class="material-icons">folder_open</i>\
                  </button>\
                </td>\
              </tr>');
    // adding to save as dialogs.
    $("#saved_projects > option:first-child").after("<option value="+ data.pid +">"+ data.title +"</option>");
  };

  var dialog_profile = document.querySelector('.dialog-profile');
  var showDialogButton_profile = document.querySelector('#profile');
  if (!dialog_profile.showModal) {
    dialogPolyfill.registerDialog(dialog_profile);
  }
  // for adding a scenario.
  showDialogButton_profile.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    dialog_profile.show();
  });

  dialog_profile.querySelector('.cancel').addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    dialog_profile.close();
  });

  /**
   * Cancel the account for current user.
   */
  dialog_profile.querySelector('#cancel_account').addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    if(window.behave.csrf_token == "") {
      get_token(cancel_account);
    }
    else {
      cancel_account();
    }
  });

  function cancel_account() {
    $.ajax({
      url : "/behave/cancel?_format=json",
      method : "POST",
      beforeSend: function (request) {
        request.setRequestHeader("X-CSRF-Token", window.behave.csrf_token);
        request.setRequestHeader("Content-Type", "application/json");
        $(".profile_details .mdl-spinner").addClass('is-active');
      },
      dataType: "json",
      data : {},
      error: function(data) {
      },
      success : function(data) {
          //success code
        dialog_profile.close();
        Workspace.logout();
      }
    });
  }
  /**
   * upload new profile picture to server and update user data.
   */
  dialog_profile.querySelector('.btn-save').addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    if(window.behave.csrf_token == "") {
      get_token(update_profile);
    }
    else {
      update_profile();
    }   
  });
  
  function update_profile() {
    var image_data = $("#profile_pic").attr("src");
    var formData = {
      "img" : image_data
    };
    $.ajax({
      url : "/behave/update-profile?_format=json",
      method : "POST",
      beforeSend: function (request) {
        request.setRequestHeader("Content-Type", "application/json");
        request.setRequestHeader("X-CSRF-Token", window.behave.csrf_token);
      },
      data: JSON.stringify(formData),
      contentType: false,
      processData: false,
      success: function (data) {
        $("#user_pic").css('background-image', "url('"+ image_data +"')");
        dialog_profile.close();
      }
    });
  }

  var dialog_open = document.querySelector('.dialog-open');
  var showDialogButton_open = document.querySelector('#open');
  if (!dialog_open.showModal) {
    dialogPolyfill.registerDialog(dialog_open);
  }
  // for adding a scenario.
  showDialogButton_open.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    if(Workspace.isLoggedin) {
      dialog_open.show();
    }
    else {
      Workspace.showMessage('\
      <span>Please <a href="#" class="open_login">login</a> for opening your saved projects</span>\
      <div class="clearfix"> </div>\
      <div style="float:right;">\
        <button id="open_login" type="button" class="mdl-button mdl-js-button mdl-button--primary">Ok</button>\
      </div>');
    }
  });

  dialog_open.querySelector('.close').addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    dialog_open.close();
  });

  dialog_open.querySelector('.btn_ok').addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    dialog_open.close();
  }); 

  $("#open_projects").click(function(e) {
    e.stopPropagation();
    e.preventDefault();
    dialog_open.show();
  });

  // open a saved project.
  $(".dialog-open").on("click", ".open_project", function(e) {
    e.preventDefault();
    e.stopPropagation();
    var pid = $(this).parent().data("id");
    $.ajax({
      url : "/behave/get/"+ pid +"/json?_format=json",
      method : "GET",
      beforeSend: function (request) {
        request.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        request.setRequestHeader("X-CSRF-Token", window.behave.csrf_token);
      },
      dataType: "json",
      error: function(response) {
      },
      success : function(response) {
        // set deta in workspace from autosave data.
        Workspace.clean();
        Workspace.setData(JSON.parse(response.data));
      }
    });
  });

  // open a feture template to workspace.
  $(".dialog-templates").on("click", ".template_id", function(e) {
    e.stopPropagation();
    var tid = $(this).val();
    if($(this).prop("checked")) {
      $.ajax({
        url : "/behave/get-template/"+ tid +"/?_format=json",
        method : "GET",
        beforeSend: function (request) {
          request.setRequestHeader("Content-Type", "application/json; charset=utf-8");
          request.setRequestHeader("X-CSRF-Token", window.behave.csrf_token);
        },
        dataType: "json",
        error: function(response) {
          dialog_templates.close();
        },
        success : function(response) {
          // set deta in workspace from autosave data.
          Workspace.setData(JSON.parse(response.data), "f_templet_" + tid);
        }
      });
    }
    else {
      // remove the templates added 
      $(".f_templet_" + tid).each(function() {
        $(this).find(".feature-close").trigger('click');
      });
    }
    return true;
  });


  var dialog_templates = document.querySelector('.dialog-templates');
  var showDialogButton_templates = document.querySelector('#templates');
  if (!dialog_templates.showModal) {
    dialogPolyfill.registerDialog(dialog_templates);
  }
  // for adding a scenario.
  showDialogButton_templates.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    dialog_templates.show();
  });

  dialog_templates.querySelector('.close').addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    dialog_templates.close();
  });

  var dialog_run = document.querySelector('.dialog-run');
  var showDialogButton_run = document.querySelector('#run');
  if (!dialog_run.showModal) {
    dialogPolyfill.registerDialog(dialog_run);
  }
  // for adding a scenario.
  showDialogButton_run.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    if($(".action-list li").length > 0) {
      $(".run-error-msg").hide();
      dialog_run.show();
    }
    else {
      var message_txt = '';
      if($(".feature-item").length == 0) {
        if(("#saved_projects option").length > 1) {
          message_txt += '<span>Please add a features, scenarios and actions or open a saved project before running the test</span>';
        }
        else {
          message_txt += '<span>Please add a features, scenarios and actions before running the test</span>';
        }
        message_txt += '<div class="clearfix"> </div>\
        <div style="display:block;overflow:hidden;">\
          <a style="margin-top: 9px;display: inline-block;" class="help-txt help-link" data-index="1" href="#">Help?</a>\
          <button style="float:right;" id="add_feature" type="button" class="mdl-button mdl-js-button mdl-button--primary">Ok</button>\
        </div>';
        Workspace.showMessage(message_txt);
        return;
      }
      if($(".itm-scenario").length == 0) {
        Workspace.showMessage('\
        <span>Please add scenarios and actions for the test.</span>\
        <div class="clearfix"> </div>\
        <div style="display:block;overflow:hidden;">\
          <a style="margin-top: 9px;display: inline-block;" class="help-txt help-link" data-index="1" href="#">Help?</a>\
          <button style="float:right;" id="add_feature" type="button" class="mdl-button mdl-js-button mdl-button--primary">Ok</button>\
        </div>');  
      }
      else {
        Workspace.showMessage('\
        <span>Please add at least one action before running the test.</span>\
        <div class="clearfix"> </div>\
        <div style="display:block;overflow:hidden;">\
          <a style="margin-top: 9px;display: inline-block;" class="help-txt help-link" data-index="1" href="#">Help?</a>\
          <button style="float:right;" id="add_feature" type="button" class="mdl-button mdl-js-button mdl-button--primary">Ok</button>\
        </div>');  
      }    
    }
  });

  dialog_run.querySelector('.close').addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    dialog_run.close();
  });

  dialog_run.querySelector('.btn_ok').addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    dialog_run.close();
  });

  /* For auth related actions.*/
  $(".dialog_auth").on('click', ".forgot-password-link", function(e) {
    e.preventDefault();
    e.stopPropagation();
    $(".dialog_auth").addClass('dialog_password_reset').removeClass('dialog_login dialog_reg');
    $(".dialog_auth .auth_error").html("");
  });

  $(".reg-link").click(function(e) {
    e.preventDefault();
    e.stopPropagation();
    $(".dialog_auth").addClass('dialog_reg').removeClass('dialog_login dialog_password_reset');
    $(".dialog_auth .auth_error").html("");
  });

  $(".login-link").click(function(e) {
    e.preventDefault();
    e.stopPropagation();
    $(".dialog_auth").addClass('dialog_login').removeClass('dialog_reg dialog_password_reset');
    $(".dialog_auth .auth_error").html("");
  });
  
  // make the dialog draggabale
  $("dialog").draggable({handle:'.mdl-card__title'});

  /** 
   * Close dialogboxes when we click on body.
   */
  $(document).click(function(event) {
    // if there is an open dialog we need to close it.
    if($("dialog:visible").length > 0 && $(event.target).closest('dialog > div').length == 0) {
      // if we are in help or feedback form we dont need to close this dialogbox.
      if(!$(event.target).hasClass('down_link') && !$.pagewalkthrough('isActive') && $("#feedback-canvas").length == 0) {
        var length = $("dialog:visible").length;
        $("dialog:visible")[length - 1].close();
      }
    }
  });

  /**
   * We will compain this with above function.
   */
  $(document).keyup(function(e) {
    if (e.keyCode == 27) { // escape key maps to keycode `27`
      // if there is an open dialog we need to close it.
      if($("dialog:visible").length > 0) {
        // if we are in help or feedback form we dont need to close this dialogbox.
        var length = $("dialog:visible").length;
        $("dialog:visible")[length - 1].close();
      }
    }
  });

})(jQuery);

/**
 * Force browser to download the build.
 * @param path
 *  path to the archive file to download.
 * @param file
 *  file name fr adding in anchor tag.
 */
function downloadFile(path, file) {
  if(path == "") {
    return;
  }
  var link = document.createElement('a');
  link.href = path;
  link.className = 'down_link';
  link.target = '_blank';
  link.download = file;
  document.body.appendChild(link);
  link.click();  
  document.body.removeChild(link);  
}