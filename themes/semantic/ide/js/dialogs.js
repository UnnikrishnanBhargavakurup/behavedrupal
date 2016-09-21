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
      showMessage('\
      <span>Please add a feature before adding scenarios</span>\
      <div class="clearfix"> </div>\
      <div class="clearfix"> </div>\
      <div style="display:block;overflow:hidden;">\
        <a style="margin-top: 9px;display: inline-block;" class="help-txt help-link" data-index="3" href="#">Help?</a>\
        <button id="add_feature" style="float:right;" type="button" class="mdl-button mdl-js-button mdl-button--primary">Ok</button>\
      </div>');
      return;
    }
    dialog_scenario.showModal();
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
      addScenario(scenario_name, false);
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
    dialog_feature.showModal();
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
      addFeature(feature_name, feature_description);
      $("#feature-name").val('');
      $("#feature-description").val('');
    }
    dialog_feature.close();
  });


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
    dialog_login.showModal();
  });
  dialog_login.querySelector('.close').addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    dialog_login.close();
  });

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
            window.behave.isLoggedin = 0;
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
            window.behave.isLoggedin = 1;
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
            window.behave.isLoggedin = 0;
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
            window.behave.isLoggedin = 1;
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
    if(error.length == 2 && error[0] == 'name') {
      $(".dialog_auth .error-msg").html("Email already taken plrease use a different email.");
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
    if(error.indexOf("Unrecognized username") === 0) {
      $(".dialog_auth .auth_error").html("Unrecognized username or password.");
    }
    if(error.indexOf("is not recognized as a username") > 0) {
      $(".dialog_auth .auth_error").html("User does not exist");
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
      logout();
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
    dialog_feedback.showModal();
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
    if(window.behave.isLoggedin) {
      dialog_save.showModal();
    }
    else {
      showMessage('\
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
    var project_data = get_data();
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
            //success code
          dialog_save.close();
          $(".save-dialog .mdl-spinner").removeClass('is-active');
        }
      });
    }
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
    dialog_profile.showModal();
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
        logout();
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
    if(window.behave.isLoggedin) {
      dialog_open.showModal();
    }
    else {
      showMessage('\
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
    dialog_open.showModal();
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
        set_data(JSON.parse(response.data));
      }
    });
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
    dialog_templates.showModal();
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
      dialog_run.showModal();
    }
    else {
      if($(".feature-item").length == 0) {
        showMessage('\
        <span>Please add a features, scenarios and actions before running the test</span>\
        <div class="clearfix"> </div>\
        <div style="display:block;overflow:hidden;">\
          <a style="margin-top: 9px;display: inline-block;" class="help-txt help-link" data-index="3" href="#">Help?</a>\
          <button style="float:right;" id="add_feature" type="button" class="mdl-button mdl-js-button mdl-button--primary">Ok</button>\
        </div>');
        return;
      }
      if($(".itm-scenario").length == 0) {
        showMessage('\
        <span>Please add scenarios and actions for the test.</span>\
        <div class="clearfix"> </div>\
        <div style="display:block;overflow:hidden;">\
          <a style="margin-top: 9px;display: inline-block;" class="help-txt help-link" data-index="3" href="#">Help?</a>\
          <button style="float:right;" id="add_feature" type="button" class="mdl-button mdl-js-button mdl-button--primary">Ok</button>\
        </div>');  
      }
      else {
        showMessage('\
        <span>Please add at least one action before running the test.</span>\
        <div class="clearfix"> </div>\
        <div style="display:block;overflow:hidden;">\
          <a style="margin-top: 9px;display: inline-block;" class="help-txt help-link" data-index="3" href="#">Help?</a>\
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

  /**
   * Upload a foto for user picture.
   */
  $("#upload-photo").click(function(e) {
    e.preventDefault();
    e.stopPropagation();
    $("#uploaded_file").trigger('click');
  });
  
  /**
   * preview the new image 
   */
  $("#uploaded_file").on('change', function(e) {
    e.preventDefault();
    e.stopPropagation();
    var reader = new FileReader();
    // Closure to capture the file information.
    reader.onload = (function(theFile) {
        return function(e) {
            // Render thumbnail.
          $("#profile_pic").attr('src', e.target.result);                         
        };
    })($("#uploaded_file")[0].files[0]);
    // Read in the image file as a data URL.
    reader.readAsDataURL($("#uploaded_file")[0].files[0]);    
  });
  
  /**
   * some how this event is reaching datatoggle and causing issues.
   */
  $(".dialog-profile").on('click', 'button, input', function(e) {
    e.stopPropagation();
  });

  /* For auth related actions.*/
  $(".forgot-password-link").click(function(e) {
    e.preventDefault();
    e.stopPropagation();
    $(".dialog_auth").addClass('dialog_password_reset').removeClass('dialog_login dialog_reg');

  });

  $(".reg-link").click(function(e) {
    e.preventDefault();
    e.stopPropagation();
    $(".dialog_auth").addClass('dialog_reg').removeClass('dialog_login dialog_password_reset');
  });

  $(".login-link").click(function(e) {
    e.preventDefault();
    e.stopPropagation();
    $(".dialog_auth").addClass('dialog_login').removeClass('dialog_reg dialog_password_reset');
  });

  /**
   * Remove profile informations.
   */
  function logout() {
    $(".usr-profile").hide();
    $("#login").show();
    $(".profile_details .mdl-spinner").removeClass('is-active');   
    window.behave.isLoggedin = 0;
  };

  // for tracking the id of ui elements.
  var feature_cnt = 0;
  var feature_names = {};
  var feature_list = {};
  var features = {};
  var scenarios = {};
  var active_feature = 0;
  var active_scenario = null;
    
  // This is for tracking active scenario
  $(".scenario-list").on("focusin", ".itm-scenario input:text", function(e) {
    e.stopPropagation();
    active_scenario = $(this).closest('.itm-scenario');
    hide_help();
    showActiveHelpLink();
  });

  $(".scenario-list").on('click', '.itm-scenario input:submit', function(e) {
    e.preventDefault();
    e.stopPropagation();
    // some thimes it is showing error.
    active_scenario = active_scenario || $(this).closest('.itm-scenario');
    var action_txt = active_scenario.find('input:text').val();
    
    var help_patterns = action_txt.toLowerCase().match(/(^|\s):(\w+)/g);
    if(help_patterns) {
      show_help(help_patterns);
    }
    else {
      hide_help();
      var action_index = $(this).data('edit-index');
      if(typeof action_index !== 'undefined') {
        $("#"+ action_index).find('span.action_itm').text(action_txt);
        $(this).removeData('edit-index');
      }
      else {
        addAction(action_txt);
      }
      active_scenario.find('input:text').val('');
    }
    /*
    addAction(action_txt);
    active_scenario.find('input:text').val('');
    */
  });
  
  /**
   * remove a feature and associated scnarios.
   */
  $(".feature-list").on('click', '.feature-close', function(e) {
    e.preventDefault();
    e.stopPropagation();
    var f_id = $(this).data('target');
    // remove all the scenario associated with this feature
    $('.feature-' + f_id).remove();
    var f_name = $('#feature-' + f_id).find(".email-title").text().trim(); 
    if(feature_list.hasOwnProperty(f_name)) {
      delete feature_list[f_name];
      delete features[f_id];
    }
    // remove the feature.
    $('#feature-' + f_id).remove();
    //prev.trigger('click');
  });

  $(".scenario-list").on('click', '.scenario_close', function(e) {
    e.preventDefault();
    e.stopPropagation();
    var s_id = $(this).data('target');
    var f_id = $(this).data('fid');
    var s_name = $(s_id).find(".s_name").text().trim();
    if($(".itm-scenario:visible").length == 1) {
      $('.feature-help').show();
    }
    // delete this scenario form feature array.
    if(features[f_id]["scenarios"].hasOwnProperty(s_name)) {
      delete features[f_id]["scenarios"][s_name];
    }
    $(s_id).remove();
  });

  /**
   * add action data table
   */

  $(".scenario-list").on('click', '.add-data', function(e) {
    e.preventDefault();
    e.stopPropagation();
    var action_index = $(this).data('index');
    var vars = JSON.parse(unescape($(this).data('vars')));
    var tbl = '';
    for (var i = 0; i < vars.length; i++) {
      tbl += addTable(action_index, vars[i], []);
    };
    $('#action-' + action_index +' .action-data').append(tbl);
    componentHandler.upgradeDom();
    $(this).parent().hide();
  });
  
  /**
   * delete this table.
   */
  $(".scenario-list").on('click', '.delete-tbl', function(e) {
      var tbl_ctrl = $(this).closest('li').find('.tbl-controls');
      $(this).closest('table').remove();
      if($(this).closest('li').find('table').length == 0) {
        tbl_ctrl.show();
      }
  });
  
  /**
   * Show controlls to add data to table.
   */
  $(".scenario-list").on('click', '.cell-dta', function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.target !== this) {
      return;
    }
    var data_now = $(this).text().trim();
    data_now = data_now.toLowerCase() == 'click here' ? '' : data_now;
    $(this).html("<input class='cell-ctl' type='text' value='"+ data_now +"'>");
    $(this).find("input").focus();
  });
  
  /** 
   * some times that table cell blur is not working.
   * TODO: need to find exact issue.
   */
  $(document).click(function(event) {
    if($("#messages:visible").length > 0 && $(event.target).closest('#messages > div').length == 0) {
      $("#messages").hide();
    }
    $(".scenario-list .cell-ctl").blur();
    // if there is an open dilaog we need to close it.
    if($("dialog:visible").length == 1 && $(event.target).closest('dialog > div').length == 0) {
      if(!$(event.target).hasClass('down_link')) {
        $("dialog:visible")[0].close();
      }
    }
  });
  
  /**
   * Do not propogate to document we have a blur there.
   */
  $(".scenario-list").on("click", '.cell-ctl', function(e) {
    e.stopPropagation();
  });
  
  /**
   * Update cell data.
   */
  $(".scenario-list").on("blur", '.cell-ctl', function(e) {
    e.preventDefault();
    if (e.target !== this) {
      return;
    }
    var data_now = $(this).val().trim();
    $(this).parent().text(data_now);
  });
  
  /**
   * deleting a column from current table.
   */
  $(".scenario-list").on("click", '.delete-col', function(e) {
    e.preventDefault();
    var table = $(this).closest("table");
    var colspan = table.find('tbody tr:first td').length;
    if(colspan == 1) {
      var tbl_ctrl = $(this).closest('li').find('.tbl-controls');
      table.remove();
      if($(this).closest('li').find('table').length == 0) {
        tbl_ctrl.show();
      }
    }
    table.find('tbody tr:not(:last-child) td:last-child').remove();
    table.find('thead th').attr('colspan', colspan - 1);
    table.find('tbody tr:last-child td').attr('colspan', colspan - 1);
  });

  /**
   * add a column from current table.
   */
  $(".scenario-list").on("click", '.add-col', function(e) {
    e.preventDefault();
    var table = $(this).closest("table");
    var colspan = table.find('tbody tr:first td').length;
    table.find('tbody tr:not(:last-child)').append('<td class="cell-dta">click here</td>');
    table.find('thead th').attr('colspan', colspan + 1);
    table.find('tbody tr:last-child td').attr('colspan', colspan + 1);    
  });

  /**
   * deleting a row from current table.
   */
  $(".scenario-list").on("click", '.delete-row', function(e) {
    e.preventDefault();
    var table = $(this).closest("table");
    var rows = table.find('tbody tr').length;
    if(rows == 1) {
      var tbl_ctrl = $(this).closest('li').find('.tbl-controls');
      table.remove();
      if($(this).closest('li').find('table').length == 0) {
        tbl_ctrl.show();
      }
    }
    table.find('tbody tr:nth-last-child(2)').remove();
  });

  /**
   * add a row to current table.
   */
  $(".scenario-list").on("click", '.add-row', function(e) {
    e.preventDefault();
    var table = $(this).closest("table");
    var colspan = table.find('tbody tr:first td').length;
    table.find('tbody tr:last-child').before('<tr></tr>');
    for(i = 0; i < colspan; i++) {
      table.find('tbody tr:nth-last-child(2)').append('<td class="cell-dta">click here</td>');
    }   
  });

  /**
   * Show help message
   */
  function show_help(help_patterns) {
    active_scenario.find('input:text').addClass('invalid');
    /*
    for (var i = 0; i < help_patterns.length; i++) {
      var key = help_patterns[i].trim();
      if(key in help_data) {
        active_scenario.find('.error-msg span').text(help_data[key]);
      }
      else {
        active_scenario.find('.error-msg span').html("Please provide a value for " + key + " placeholder.");
      }
      break;
    };
    */
    var msg = "";
    if(help_patterns.length > 1) {
      msg = "Please provide values for <b>" + help_patterns.join(", ") + "</b> placeholders. Should be enclosed in quotes";
    }
    else {
      msg = "Please provide a value for <b>" + help_patterns[0] + "</b> placeholder. Should be enclosed in quotes";
    }
    active_scenario.find('.error-msg span').html(msg);
    $('.scenario-help').hide();
    active_scenario.find('.error-msg').animate({opacity: 1, height : '20px'}, 50);
    active_scenario.find('input:text').blur();
  }

  /**
   * Show active help link.
   */
  function showActiveHelpLink() {
    $('.scenario-help').hide();
    if(active_scenario) {
      active_scenario.find('.scenario-help').show();
    }
  };

  /**
   * Hide help message.
   */
  function hide_help() {
    active_scenario.find('input:text').removeClass('invalid');
    active_scenario.find('.error-msg span').text("");
    active_scenario.find('.error-msg').animate({opacity: 0, height : 0}, 50);
  }

  var tbl_cnt = 0;
  /**
   * Add a table of data to action.
   * @param action_index
   *  
   * @param label 
   *
   * @param rows
   *  if data exist prepopulate it
   * @return string
   *  HTML table representation of data.
   */
  function addTable(action_index, label, rows) {
    var tbl = '<table id="data-table-'+ tbl_cnt +'" class="mdl-data-table mdl-js-data-table action-data-table">\
              <thead>\
                <tr>\
                  <th colspan="2">\
                    <div class="tbl-title">\
                      <span>'+ label.slice(0, -1) +'</span>\
                    </div>\
                    <button id="delete-col-'+ tbl_cnt +'" class="mdl-button mdl-js-button mdl-button--icon delete-col">\
                      <i class="material-icons">chevron_left</i>\
                    </button>\
                    <button id="add-col-'+ tbl_cnt +'" class="mdl-button mdl-js-button mdl-button--icon add-col">\
                      <i class="material-icons">chevron_right</i>\
                    </button>\
                    <div class="mdl-tooltip" for="delete-col-'+ tbl_cnt +'"><span>Delete column</span></div>\
                    <div class="mdl-tooltip" for="add-col-'+ tbl_cnt +'"><span>Add column</span></div>\
                  </th>\
                </tr>\
              </thead>\
              <tbody>';
              if(rows.length > 0) {
                for (var i = 0; i < rows.length; i++) {
                  tbl += '<tr>';
                  for (var j = 0; j < rows[i].length; j++) {
                    tbl += '<td class="cell-dta">'+ rows[i][j] +'</td>';
                  }
                  tbl += '</tr>';
                }
              }
              else {
                tbl +='<tr>\
                        <td class="cell-dta">click here</td>\
                        <td class="cell-dta">click here</td>\
                      </tr>\
                      <tr>\
                        <td class="cell-dta">click here</td>\
                        <td class="cell-dta">click here</td>\
                      </tr>';
              }
        tbl += '<tr>\
                  <td colspan="2">\
                    <button id="delete-row-'+ tbl_cnt +'" class="mdl-button mdl-js-button mdl-button--icon delete-row">\
                      <i class="material-icons">expand_less</i>\
                    </button>\
                    <button id="add-row-'+ tbl_cnt +'" class="mdl-button mdl-js-button mdl-button--icon add-row">\
                      <i class="material-icons">expand_more</i>\
                    </button>\
                    <div class="mdl-tooltip" for="delete-row-'+ tbl_cnt +'"><span>Delete row</span></div>\
                    <div class="mdl-tooltip" for="add-row-'+ tbl_cnt +'"><span>Add row </span></div>\
                    <button id="delete-tbl-'+ tbl_cnt +'" class="mdl-button mdl-js-button mdl-button--icon delete-tbl">\
                      <i class="material-icons">delete</i>\
                    </button>\
                    <div class="mdl-tooltip" for="delete-tbl-'+ tbl_cnt +'"><span>Delete table</span></div>\
                    <a class="table-help help-txt help-link" data-index="5" href="#">Help?</a>\
                  </td>\
                </tr>\
              </tbody>\
            </table>';
    return tbl;
    //$('#action-' + action_index +' .action-data').append(tbl);
    //componentHandler.upgradeDom();
  }

  /**
   * Add a new feature here.
   */
  function addFeature(feature_name, description) {
    // we don't want duplicate features in a project 
    if(feature_list.hasOwnProperty(feature_name)) {
      return;
    }   
    $("ul.collection li").removeClass('active');
    var feature_ui = '<li id="feature-'+ feature_cnt +'" class="collection-item avatar email-unread feature-item active" data-id="'+ feature_cnt +'">\
                        <i class="fa fa-cogs icon_1"></i>\
                        <div class="avatar_left">\
                          <span class="email-title feature-n">'+ feature_name +'</span>\
                          <p class="truncate grey-text ultra-small feature-dis">'+ description +'</p>\
                        </div>\
                        <div class="feature-actions">\
                          <button data-target="'+ feature_cnt +'" class="mdl-button mdl-js-button mdl-button--icon btn-close pull-right feature-close">\
                            <i class="material-icons">close</i>\
                          </button>\
                          <button class="mdl-button mdl-js-button mdl-button--icon pull-right btn-edit">\
                            <i class="material-icons">mode_edit</i>\
                          </button>\
                        </div>\
                        <div class="clearfix"></div>\
                      </li>';
    $(".itm-scenario").removeClass('active');
    $(feature_ui).insertBefore('.feature-list li:last-child');
    // for preventing duplicate feature names in the same project.
    feature_list[feature_name] = {};
    features[feature_cnt] = {
      "name" : feature_name,
      "description" : description,
      "scenarios" : {}
    };
    active_feature = feature_cnt;
    feature_names[feature_cnt] = feature_name;
    // update feature name in add scenario dialogbox.
    updateAddScenarioDialog();
    feature_cnt++;
  };


  var scenario_cnt = 0;

  /**
   * Add a new scenario here.
   */
  function addScenario(scenario_name, loading) {
    // we don't want duplicate scenarios in the same fature.
    if(features[active_feature].scenarios.hasOwnProperty(scenario_name)) {
      return;
    }  
    $('.scenario-help').hide();
    var scenario_ui = '<div id="scenario-'+ scenario_cnt +'" class="Compose-Message itm-scenario feature-'+ active_feature +' active">\
                        <div class="panel panel-default">\
                          <div class="panel-heading">\
                            <i class="fa fa-cog" aria-hidden="true"></i>&nbsp;<span class="s_name">'+ scenario_name +'</span>\
                            <button data-fid="'+ active_feature +'" data-target="#scenario-'+ scenario_cnt +'" data-dismiss="alert" class="mdl-button mdl-js-button mdl-button--icon pull-right btn-close scenario_close">\
                              <i class="material-icons">close</i>\
                            </button>\
                            <button class="mdl-button mdl-js-button mdl-button--icon pull-right btn-edit">\
                              <i class="material-icons">mode_edit</i>\
                            </button>\
                          </div>\
                          <div class="panel-body panel-body-com-m">\
                            <div class="action-wrap">\
                              <div class="clearfix"></div>\
                              <ul class="list-group action-list"></ul>\
                            </div>\
                            <form class="com-mail">\
                              <hr/>\
                              <div class="col-md-10">\
                                <input type="text" class="form-control1 control3 action_txt">\
                                <div class="error-msg">\
                                  <span></span>\
                                  <p>\
                                    <a class="help-txt help-link" data-index="3" href="#">Help?</a>\
                                  </p>\
                                </div>\
                              </div>\
                              <div class="col-md-2">\
                                <input type="submit" value="Add Action">\
                              </div>\
                            </form>\
                            <div>\
                              <a class="scenario-help help-txt help-link" data-index="2" href="#">Help?</a>\
                            </div>\
                          </div>\
                        </div>\
                      </div>';
    $(".scenario-list").append(scenario_ui);
    attach_autocomplete($("#scenario-"+ scenario_cnt +" input:text"));
    $('.feature-help').hide();
    // if we are not loading from saved items
    if(!loading) {
      var offset = $('#scenario-'+ scenario_cnt).offset();
      offset.left -= 120;
      offset.top -= 120;
      $('html, body').animate({
        scrollTop: offset.top,
        scrollLeft: offset.left
      });
    }
    // for actions
    features[active_feature].scenarios[scenario_name] = {
      "id" : scenario_cnt
    };
    scenario_cnt++;
    //componentHandler.upgradeDom(); - for updating the meterial js.
    //var el = $('.action-list:last-child')[0];
    //var sortable = Sortable.create(el);
    $(".action-list:last-child").sortable({
      "connectWith": '.action-list',
      "appendTo": '.action-list',
    });

  };

  var action_cnt = 0;

  /**
   * Add action to active scenario.
   * @param action_txt
   *  action that needs to be added.
   */
  function addAction(action_txt) {
    var action_ui = '<li id="action-'+ action_cnt +'" class="list-group-item">\
                       <i class="fa fa-bolt text-warning" aria-hidden="true"></i>\
                       <span class="action_itm">'+ action_txt +'</span>\
                       <button data-target="#action-'+ action_cnt +'" data-dismiss="alert" class="mdl-button mdl-js-button mdl-button--icon pull-right action-btn">\
                         <i class="material-icons">close</i>\
                       </button>\
                       <button class="mdl-button mdl-js-button mdl-button--icon pull-right btn-edit action-btn">\
                         <i class="material-icons">mode_edit</i>\
                       </button>';
    /**
     * a word that endwith : 
     * and not followed by anything that is not a space or end of string
     * we dont need to match anything within quotes
     */
    //TODO : need to optimize this regex.   
    var _action_txt = action_txt.toLowerCase().replace(/['"][^"']+["']|(\+)/g, "");                
    var data_patterns = _action_txt.match(/\w*:(?![^\s$])/g);  
    // we need to add some sample data for this action.
    if(data_patterns)  {
      //action_ui += '<div class="action-data"></div>';
      action_ui += '<div class="action-data">';
      for (var i = 0; i < data_patterns.length; i++) {
        action_ui += addTable(action_cnt, data_patterns[i], []);
      };
      action_ui += '</div>';
      var data_vars = JSON.stringify(data_patterns);
      action_ui += '<div class="tbl-controls">';
      action_ui += '<a class="scenario-help help-txt help-link" data-index="4" href="#">Help?</a>';
      action_ui += '<a class="add-data txt-small" data-index="'+ action_cnt +'" data-vars="'+ escape(data_vars) +'" href="#"></i>add data?</a>'; 
      action_ui += '</div>';
      /*
      var data_vars = JSON.stringify(data_patterns);
      var action_index = $(this).data('index');
      var vars = JSON.parse(unescape($(this).data('vars')));
      action_ui += '<div class="tbl-controls">';
      action_ui += '<a class="scenario-help help-txt" data-index="4" href="#">Help?</a>';
      action_ui += '<a class="add-data txt-small" data-index="'+ action_cnt +'" data-vars="'+ escape(data_vars) +'" href="#"></i>add data?</a>'; 
      action_ui += '</div>';
      */
    } 
    action_ui += '</li>';          
    active_scenario.find('.action-list').append(action_ui);
    componentHandler.upgradeDom();
    action_cnt++;
  };  

  /**
   * For selecting feature before adding a scenario.
   */
  $("ul.collection").on('click', 'li.feature-item', function(e) {
    e.stopPropagation();
    $("ul.collection li").removeClass('active');
    $(this).addClass('active');
    active_feature = $(this).data('id');
    $(".itm-scenario").removeClass('active');
    if($(".scenario-list .feature-" + active_feature).length > 0) {
      $('.scenario-help').hide();
      $(".scenario-list .feature-" + active_feature).addClass('active');
      $('.feature-help').hide();
      $(".scenario-list .active:first").find('.scenario-help').show();
    }
    else {
      $('.feature-help').show();
    }
    // for showing in the add scenatio dialogbox.
    updateAddScenarioDialog();
  });

  /**
   * update feature name in add scenario dialogbox.
   */
  function updateAddScenarioDialog() {
    $(".feature-name").text(feature_names[active_feature]);
  };

  /**
   * Get data for saving or building the test.
   */
  function get_data() {
    var _data = [];
    for (var feature_no in features) {
      if (features.hasOwnProperty(feature_no)) {
        var _feature = {
          "name" : features[feature_no].name,
          "description" : features[feature_no].description,
          "scenarios" : []
        };
        for (var scenario_name in features[feature_no].scenarios) {
          if (features[feature_no].scenarios.hasOwnProperty(scenario_name)) {
            var _actions = [];
            $("#scenario-" + features[feature_no].scenarios[scenario_name].id +" li").each(function() {
              var action_txt = $(this).find("span.action_itm").html();
              var data = [];
              // need to get all data here
              if($(this).find("table").length > 0) {
                data = getTableData($(this).find("table"));
              }
              _actions.push({"action" : action_txt, "data" : data});
            });
            _feature.scenarios.push({"name" : scenario_name, "actions" : _actions});
          }
        } 
        _data.push(_feature);
      }
    }
    return _data;
  };

  /**
   * get data for actions.
   */
  function getTableData(tables) {
    var data = [];
    for(var i = 0; i < tables.length; i++) {
      var _data =  $(tables[i]).find('tbody tr:not(:last-child)').get().map(function(row) {
        return $(row).find('td.cell-dta').get().map(function(cell) {
          return $(cell).text();
        });
      }); 
      data.push(_data); 
    } 
    return data;
  }
  
  /**
   * Load data to IDE.
   */
  function set_data(_features) {
    if(_features == null) {
      return;
    }
    //clean everything before adding from saved data.
    clean();

    for(var i = 0; i < _features.length; i++) {

      // add feature to workspace.
      addFeature(_features[i].name, _features[i].description);

      for (var j = 0; j < _features[i].scenarios.length; j++) {

        // add the scenario to the feature.
        addScenario(_features[i].scenarios[j].name, true);

        var action_ui  = "";

        for (var k = 0; k < _features[i].scenarios[j].actions.length; k++) {

          var action_txt = _features[i].scenarios[j].actions[k].action;
          var action_data = _features[i].scenarios[j].actions[k].data;

          action_ui += '<li id="action-'+ action_cnt +'" class="list-group-item">\
                       <i class="fa fa-bolt text-warning" aria-hidden="true"></i>\
                       <span class="action_itm">'+ action_txt +'</span>\
                       <button data-target="#action-'+ action_cnt +'" data-dismiss="alert" class="mdl-button mdl-js-button mdl-button--icon pull-right action-btn">\
                         <i class="material-icons">close</i>\
                       </button>\
                       <button class="mdl-button mdl-js-button mdl-button--icon pull-right btn-edit action-btn">\
                         <i class="material-icons">mode_edit</i>\
                       </button>';
          /**
           * a word that endwith : 
           * and not followed by anything that is not a space or end of string
           * we dont need to match anything within quotes
           */
          //TODO : need to optimize this regex.
          var _action_txt = action_txt.toLowerCase().replace(/['"][^"']+["']|(\+)/g, "");
          var data_patterns = _action_txt.match(/\w*:(?![^\s$])/g);  
          // we need to add data for this action.
          if(data_patterns)  {
            action_ui += '<div class="action-data">';
            // add data table here.
            for (var p_i = 0; p_i < action_data.length; p_i++) {
              if(typeof data_patterns[p_i] !== 'undefined') {
                action_ui += addTable(action_cnt, data_patterns[p_i], action_data[p_i]);
              }
            };

            action_ui += '</div>';
            // we need this later.
            var data_vars = JSON.stringify(data_patterns);
            action_ui += '<div class="tbl-controls">';
            action_ui += '<a class="scenario-help help-txt help-link" data-index="4" href="#">Help?</a>';
            action_ui += '<a class="add-data txt-small" data-index="'+ action_cnt +'" data-vars="'+ escape(data_vars) +'" href="#"></i>add data?</a>'; 
            action_ui += '</div>';
          }

          action_ui += '</li>';
          action_cnt++;
        }
        $("#scenario-"+ j +" .action-list").append(action_ui);
      }
    }
  };
  
  /**
   * Clean IDE before adding data.
   */
  function clean() {
    feature_cnt = 0;
    feature_names = {};
    feature_list = {};
    features = {};
    scenarios = {};
    active_feature = 0;
    scenario_cnt = 0;
    action_cnt = 0;
    tbl_cnt = 0;
    $(".itm-scenario").remove();
    $(".feature-item").remove();
  }
  
  /**
   * show a message to user for prerequirements.
   */
  function showMessage(message) {
    $("#msg_body").html(message);
    $("#messages").show();
  }; 

  /**
   * Open login dilaogbox.
   */
  $("#messages").on("click", ".open_login", function(e) {
    e.stopPropagation();
    e.preventDefault();
    $(".dialog_auth").addClass('dialog_login').removeClass('dialog_reg dialog_password_reset');
    $("#messages").hide();
    dialog_login.showModal();
  });
  
  /**
   * Open register dilaogbox.
   */
  $("#messages").on("click", ".open_register", function(e) {
    e.stopPropagation();
    e.preventDefault();
    $(".dialog_auth").addClass('dialog_reg').removeClass('dialog_login dialog_password_reset');
    $("#messages").hide();
    dialog_login.showModal();
  });

  /**
   * Need at least one feature for adding scenatios.
   */
  $("#messages").on("click", "#add_feature", function(e) {
    e.preventDefault();
    e.stopPropagation();
    $("#messages").hide();
    dialog_feature.showModal();
  });


  function get_token(_function) {
    $.ajax({
      method : "GET",
      url: '/rest/session/token',
      success: function (csrf_token) {
        window.behave.csrf_token = csrf_token;
        _function();
      }
    });
  }

  var project_data = [];
  // get autosaved items.
  function get_autosave() {
    $.ajax({
      url : "/behave/autosave?_format=json",
      method : "POST",
      beforeSend: function (request) {
        request.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        request.setRequestHeader("X-CSRF-Token", window.behave.csrf_token);
      },
      dataType: "json",
      data : JSON.stringify({
        "get" : true
      }),
      success : function(data) {
        set_data(data);
        project_data = data;
      }
    });    
  };

  // get token and update workspace.
  get_token(get_autosave);

  // for autosaving workspace data.
  var autosave = function() {
    var _project_data = get_data();
    // only if we have some chages
    if(JSON.stringify(project_data) == JSON.stringify(_project_data)) {
      return;
    }
    project_data = _project_data;
    if(window.behave.csrf_token == "") {
      get_token(autosave_update);
    }
    else {
      autosave_update();
    }
  };
  
  function autosave_update() {
    $.ajax({
      url : "/behave/autosave?_format=json",
      method : "POST",
      beforeSend: function (request) {
        request.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        request.setRequestHeader("X-CSRF-Token", window.behave.csrf_token);
        $(".auto_save").show();
      },
      dataType: "json",
      data : JSON.stringify({
        "data" : project_data
      }),
      error: function(data) {
        $(".auto_save").hide();
      },
      success : function(data) {
        $(".auto_save").hide();
      }
    });    
  }

  //clean all data from workspace.
  $("#clear_all").click(function(e) {
    e.preventDefault();
    e.stopPropagation();
    clean();
    project_data = [];
    if(window.behave.csrf_token == "") {
      get_token(autosave_update);
    }
    else {
      autosave_update();
    }
  });
  
  /**
   * Download build from the current workspace data. 
   */
  $("#download_build").click(function(e) {
    e.preventDefault();
    e.stopPropagation();
    var base_url = $("#base_path").val();
    if(base_url != "") {
      $.ajax({
        url : "/behave/download-build/?_format=json",
        method : "POST",
        beforeSend: function (request) {
          request.setRequestHeader("Content-Type", "application/json; charset=utf-8");
          request.setRequestHeader("X-CSRF-Token", window.behave.csrf_token);
        },
        data : JSON.stringify({
          "base_url" : base_url
        }),
        dataType: "json",
        error: function(response) {
        },
        success : function(response) {
          downloadFile(response.url, "build.zip");
        }
      });
    }
    else {
      $('.run-error-msg').show();       
    }
  });

  $("#base_path").keydown(function(event) {
    $('.run-error-msg').hide(); 
  });

  /**
   * edit an action text.
   */
  $(".scenario-list").on("click", ".list-group-item .btn-edit", function(e) {
    e.preventDefault();
    e.stopPropagation(); 
    var action_txt = $(this).siblings('span').text();
    var action_index = $(this).parent().attr('id');
    $(this).closest('.panel-body').find('.action_txt').val(action_txt);
    $(this).closest('.panel-body').find(':submit').data('edit-index', action_index);
  });

  /**
   * edit feature text and description.
   */
  $(".feature-list").on("click", ".btn-edit", function(e) {
    e.preventDefault();
    //e.stopPropagation(); 
    $('.feature-item .error').hide();
    var feature_name = $(this).closest('.feature-item').find('.feature-n').text().trim();
    var feature_description = $(this).closest('.feature-item').find('.feature-dis').text().trim();
    $(this).closest('.feature-item').find('.feature-n').html("<div class='error'>feature aready exist</div><div><input type='text' class='feature-n-ctl' value='"+ feature_name +"'></div>");
    $(this).closest('.feature-item').find('.feature-dis').html("\
      <div class='feature-editor'>\
        <label>Description :</label>\
        <textarea class='feature-dis-ctl'>"+ feature_description +"</textarea>\
        <div class='pull-right'>\
          <button data-name='" + feature_name + "' data-dis='" + feature_description + "' class='mdl-button mdl-js-button mdl-button--primary cancel-edt-featre'>\
            Cancel\
          </button>\
          <button data-name='" + feature_name + "' data-dis='" + feature_description + "' class='mdl-button mdl-js-button mdl-button--accent save-edt-featre'>\
            Save\
          </button>\
        </div>\
      </div>");
    $(this).hide();
  });
  
  /**
   * cancel feature edit.
   */
  $(".feature-list").on("click", ".cancel-edt-featre", function(e) {
    e.preventDefault();
    e.stopPropagation();
    $(this).closest('.feature-item').find('.feature-n').text($(this).data('name').trim());
    $(this).closest('.feature-item').find('.feature-dis').text($(this).data('dis').trim());
    $('.feature-item .btn-edit').show();
    $('.feature-item .error').hide();
  });

  /**
   * save feature edit.
   */
  $(".feature-list").on("click", ".save-edt-featre", function(e) {
    e.preventDefault();
    e.stopPropagation(); 
    $('.feature-item .error').hide();
    var name = $(this).closest('.feature-item').find('.feature-n-ctl').val().trim();
    var old_name = $(this).data('name');
    if(feature_list.hasOwnProperty(name) && old_name != name) {
      $(this).closest('.feature-item').find('.error').show();
      return;
    }
    var description = $(this).closest('.feature-item').find('.feature-dis-ctl').val().trim();
    $(this).closest('.feature-item').find('.feature-n').text(name);
    $(this).closest('.feature-item').find('.feature-dis').text(description); 
    features[active_feature].name = name;
    features[active_feature].description = description;
    $('.feature-item .btn-edit').show();
  });

  /**
   * Edit scenario name.
   */
  $(".scenario-list").on("click", ".itm-scenario .panel-heading .btn-edit", function(e) {
    e.preventDefault();
    e.stopPropagation(); 
    var cur_name = $(this).parent().find('.s_name').text().trim();
    $(this).parent().find('.s_name').html("<input class='edit_s_name' data-old='"+ cur_name +"' type='text' value='"+ cur_name +"'>");
    $(this).parent().find('.edit_s_name').focus();
  });

  /**
   * Save edited scenario name.
   */
  $(".scenario-list").on("blur", ".itm-scenario .panel-heading .edit_s_name", function(e) {
    e.preventDefault();
    e.stopPropagation();
    var scenario_name = $(this).val().trim();
    var old_value = $(this).data('old');
    if(features[active_feature].scenarios.hasOwnProperty(scenario_name) && old_value != scenario_name) {
      return;
    }
    else if(old_value != scenario_name) {
      features[active_feature].scenarios[scenario_name] = Object.assign(features[active_feature].scenarios[old_value]);
      delete features[active_feature].scenarios[old_value];
      $(this).parent().text(scenario_name);
    }
    else {
      $(this).parent().text(scenario_name);
    }
  });

  /**
   * Move dropdown to visibility.
   */
  $(".scenario-list").on( "focusin", ".action_txt", function(e) {
    e.preventDefault();
    e.stopPropagation();

    var elOffset = $(this).offset().top;
    var elHeight = $(this).height();
    var windowHeight = $(window).height();
    var offset;
    if (elHeight < windowHeight) {
      offset = elOffset - ((windowHeight / 2) - (elHeight / 2));
    }
    else {
      offset = elOffset;
    }
    $('html, body').animate({scrollTop:offset}, 700);
  });

  $.ajaxSetup({
    beforeSend: function (request) {
      request.setRequestHeader("Content-Type", "application/json; charset=utf-8");
      request.setRequestHeader("X-CSRF-Token", window.behave.csrf_token);
    }
  });

  // auto save on every minute.
  window.setInterval(autosave, 2 * 1000);

})(jQuery);

(function($){

})(jQuery);

/**
 * Force browser to download the build.
 * @param path
 *  path to the archive file to download.
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