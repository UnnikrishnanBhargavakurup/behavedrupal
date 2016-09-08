//http://www.w3schools.com/icons/google_icons_av.asp

/**
 * For interactive walk through.
 * https://github.com/jwarby/jquery-pagewalkthrough - recommended
 * http://easelinc.github.io/tourist/
 */

 //http://ui-patterns.com/blog/beyond-usability-designing-with-persuasive-patterns

 // when redesing 
 //http://materializecss.com/

"use strict";

(function($) {
  var features = {};
  var active_scenario = null;
  var active_feature = 0;

  var dialog_scenario = document.querySelector('.dialog_add-scenario');
  var showDialogButton = document.querySelector('.add-scenario');
  if (!dialog_scenario.showModal) {
    dialogPolyfill.registerDialog(dialog_scenario);
  }
  // for adding a scenario.
  showDialogButton.addEventListener('click', function() {
    dialog_scenario.showModal();
  });
  dialog_scenario.querySelector('.close').addEventListener('click', function() {
    dialog_scenario.close();
  });

  dialog_scenario.querySelector('.btn_add-scenario').addEventListener('click', function() {
    var scenario_name = $("#scenario-name").val().trim();
    if(scenario_name != "") {
      addScenario(scenario_name);
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
    dialog_feature.showModal();
  });

  dialog_feature.querySelector('.close').addEventListener('click', function() {
    dialog_feature.close();
  });

  dialog_feature.querySelector('.btn_add-feature').addEventListener('click', function() {
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
  showDialogButton_login.addEventListener('click', function() {
    dialog_login.showModal();
  });
  dialog_login.querySelector('.close').addEventListener('click', function() {
    dialog_login.close();
  });

  /**
   * Login the user 
   */
  dialog_login.querySelector('.auth_ok').addEventListener('click', function() {

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
          console.log(data);
        },
        success : function(data) {
          console.log(data);
          $("#user_pic").css("background-image", "url("+ data.pic +")");
          $("#user_name").text(data.name);
          $("#login").hide();
          $(".usr-profile").show();
            //success code
          dialog_login.close();
        }
      });
    }
    //https://codepen.io/sevilayha/pen/IdGKH
  });
  
  /**
   * Logout here
   */
  $("#logout").click(function(e) {
    e.preventDefault();
    $.get( "/user/logout", function(data) {
      $(".usr-profile").hide();
      $("#login").show();
    });
  });

  var dialog_feedback = document.querySelector('.feedback-dialog');
  var showDialogButton_feedback = document.querySelector('#feedback');
  if (!dialog_feedback.showModal) {
    dialogPolyfill.registerDialog(dialog_feedback);
  }
  // for adding a scenario.
  showDialogButton_feedback.addEventListener('click', function(e) {
    e.preventDefault();
    dialog_feedback.showModal();
  });

  dialog_feedback.querySelector('.close').addEventListener('click', function() {
    dialog_feedback.close();
  });

  var dialog_save = document.querySelector('.save-dialog');
  var showDialogButton_save = document.querySelector('#save');
  if (!dialog_save.showModal) {
    dialogPolyfill.registerDialog(dialog_save);
  }
  // for adding a scenario.
  showDialogButton_save.addEventListener('click', function(e) {
    e.preventDefault();
    dialog_save.showModal();
  });

  dialog_save.querySelector('.close').addEventListener('click', function() {
    dialog_save.close();
  });

  /* For auth related actions.*/
  $(".forgot-password-link").click(function(e) {
    e.preventDefault();
    $(".dialog_auth").addClass('dialog_password_reset').removeClass('dialog_login dialog_reg');
  });

  $(".reg-link").click(function(e) {
    e.preventDefault();
    $(".dialog_auth").addClass('dialog_reg').removeClass('dialog_login dialog_password_reset');
  });

  $(".login-link").click(function(e) {
    e.preventDefault();
    $(".dialog_auth").addClass('dialog_login').removeClass('dialog_reg dialog_password_reset');
  });

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
    updateFeatureName(active_feature);
  });
  
  // This is for tracking active scenario
  $(".scenario-list").on("focusin", ".itm-scenario input:text", function(e) {
    e.stopPropagation();
    active_scenario = $(this).closest('.itm-scenario');
    hide_help();
    showActiveHelpLink();
  });

  $(".scenario-list").on('click', '.itm-scenario input:submit', function(e) {
    e.preventDefault();
    var action_txt = active_scenario.find('input:text').val();
    
    var help_patterns = action_txt.toLowerCase().match(/(^|\s):(\w+)/g);
    if(help_patterns) {
      show_help(help_patterns);
    }
    else {
      hide_help();
      addAction(action_txt);
      active_scenario.find('input:text').val('');
    }
    /*
    addAction(action_txt);
    active_scenario.find('input:text').val('');
    */
  });
  
  $(".scenario-list").on('click', '.itm-scenario .btn-close', function(e) {
    e.preventDefault();
    if($(".itm-scenario:visible").length == 1) {
      $('.feature-help').show();
    }
  });
  
  /**
   * remove a feature and associated scnarios.
   */
  $(".feature-list").on('click', '.feature-close', function(e) {
    e.preventDefault();
    var f_id = $(this).data('target');
    console.log(f_id);
    // remove all the scenario associated with this feature
    $('.feature-' + f_id).remove();
    // remove the feature.
    //var prev = $('#feature-' + f_id).prev();
    $('#feature-' + f_id).remove();
    //prev.trigger('click');
  });
  
  /**
   * add action data table
   */

  $(".scenario-list").on('click', '.add-data', function(e) {
    e.preventDefault();
    var action_index = $(this).data('index');
    var vars = JSON.parse(unescape($(this).data('vars')));
    var tbl = '';
    for (var i = 0; i < vars.length; i++) {
      tbl += addTable(action_index, vars[i]);
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
  });
  
  /** 
   * some times that table cell blur is not working.
   * TODO: need to find exact issue.
   */
  $(document).click(function(e) {
    if($("dialog:visible").length > 0) {
      //$("dialog:visible")[0].close();
      //return;
    }
    $(".scenario-list .cell-ctl").blur();
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
   * For showing help topic related to current context.
   */
  $(".xs").on('click', '.help-txt', function(e) {
    e.preventDefault();
    console.log($(this).data('index'));

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
      msg = "Please provide values for <b>" + help_patterns.join(", ") + "</b> placeholders.";
    }
    else {
      msg = "Please provide a value for <b>" + help_patterns[0] + "</b> placeholder.";
    }
    active_scenario.find('.error-msg span').html(msg);
    $('.scenario-help').hide();
    active_scenario.find('.error-msg').animate({opacity: 1, height : '20px'}, 50);
    console.log("here");
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

  var feature_cnt = 0;
  var feature_names = {};
  /**
   * Add a new feature here.
   */
  function addFeature(feature_name, description) {
    // we don't want duplicate features  
    if(features.hasOwnProperty(feature_name)) {
      return;
    }   
    $("ul.collection li").removeClass('active');
    var feature_ui = '<li id="feature-'+ feature_cnt +'" class="collection-item avatar email-unread feature-item active" data-id="'+ feature_cnt +'">\
                        <i class="fa fa-cogs icon_1"></i>\
                        <div class="avatar_left">\
                          <span class="email-title">'+ feature_name +'</span>\
                          <p class="truncate grey-text ultra-small">'+ description +'</p>\
                        </div>\
                        <button data-target="'+ feature_cnt +'" class="mdl-button mdl-js-button mdl-button--icon btn-close pull-right feature-close">\
                          <i class="material-icons">close</i>\
                        </button>\
                        <div class="clearfix"> </div>\
                      </li>';
    $(".itm-scenario").removeClass('active');
    $(feature_ui).insertBefore('.feature-list li:last-child');
    features[feature_name] = {
      "scenarios" : {}
    };
    active_feature = feature_cnt;
    feature_names[feature_cnt] = feature_name;
    updateFeatureName(feature_cnt);
    feature_cnt++;
  };


  var scenario_cnt = 0;

  /**
   * Add a new scenario here.
   */
  function addScenario(scenario_name) {
    // we don't want duplicate scenarios  
    $('.scenario-help').hide();
    var scenario_ui = '<div id="scenario-'+ scenario_cnt +'" class="Compose-Message itm-scenario feature-'+ active_feature +' active">\
                        <div class="panel panel-default">\
                          <div class="panel-heading">\
                            <i class="fa fa-cog" aria-hidden="true"></i>&nbsp;'+ scenario_name +'\
                            <button data-target="#scenario-'+ scenario_cnt +'" data-dismiss="alert" class="mdl-button mdl-js-button mdl-button--icon pull-right btn-close"><i class="material-icons">close</i></button>\
                          </div>\
                          <div class="panel-body panel-body-com-m">\
                            <div class="action-wrap">\
                              <ul class="list-group action-list"></ul>\
                            </div>\
                            <form class="com-mail">\
                              <hr/>\
                              <div class="col-md-10">\
                                <input type="text" class="form-control1 control3">\
                                <div class="error-msg">\
                                  <span></span>\
                                  <p>\
                                    <a class="help-txt" data-index="3" href="#">Help?</a>\
                                  </p>\
                                </div>\
                              </div>\
                              <div class="col-md-2">\
                                <input type="submit" value="Add Action">\
                              </div>\
                            </form>\
                            <div>\
                              <a class="scenario-help help-txt" data-index="2" href="#">Help?</a>\
                            </div>\
                          </div>\
                        </div>\
                      </div>';
    $(".scenario-list").append(scenario_ui);
    attach_autocomplete($("#scenario-"+ scenario_cnt +" input:text"));
    $('.feature-help').hide();
    var offset = $('#scenario-'+ scenario_cnt).offset();
    offset.left -= 120;
    offset.top -= 120;
    $('html, body').animate({
      scrollTop: offset.top,
      scrollLeft: offset.left
    });
    scenario_cnt++;
    //componentHandler.upgradeDom(); - for updating the meterial js.
  };


  var action_cnt = 0;

  /**
   * Add action to scenario.
   */
  function addAction(action_txt) {
    var action_ui = '<li id="action-'+ action_cnt +'" class="list-group-item">\
                       <i class="fa fa-bolt text-warning" aria-hidden="true"></i>\
                       <span>'+ action_txt +'</span>\
                       <button data-target="#action-'+ action_cnt +'" data-dismiss="alert" class="mdl-button mdl-js-button mdl-button--icon pull-right btn-close">\
                         <i class="material-icons">close</i>\
                       </button>';
    var data_patterns = action_txt.toLowerCase().match(/\w*:(?!\w)/g);  
    // we need to add some data for this action.
    if(data_patterns)  {
      //action_ui += '<div class="action-data"></div>';
      action_ui += '<div class="action-data">';
      for (var i = 0; i < data_patterns.length; i++) {
        action_ui += addTable(action_cnt, data_patterns[i]);
      };
      action_ui += '</div>';
      var data_vars = JSON.stringify(data_patterns);
      action_ui += '<div class="tbl-controls">';
      action_ui += '<a class="scenario-help help-txt" data-index="4" href="#">Help?</a>';
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
   var tbl_cnt = 0;
  /**
   * Add a table of data to action.
   * @param action_index
   * @label
   */
  function addTable(action_index, label) {
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
              <tbody>\
                <tr>\
                  <td class="cell-dta">click here</td>\
                  <td class="cell-dta">click here</td>\
                </tr>\
                <tr>\
                  <td class="cell-dta">click here</td>\
                  <td class="cell-dta">click here</td>\
                </tr>\
                </tr>\
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
                    <a class="table-help help-txt" data-index="5" href="#">Help?</a>\
                  </td>\
                </tr>\
              </tbody>\
            </table>';
    return tbl;
    //$('#action-' + action_index +' .action-data').append(tbl);
    //componentHandler.upgradeDom();
  }

  /**
   * update feature name in add scenario dialogbox.
   */
  function updateFeatureName(id) {
    $(".feature-name").text(feature_names[id]);
  };
  //http://jsfiddle.net/warby_/tsqu05mj/2/
  //document.cookie.indexOf("has_js")
  $('body').pagewalkthrough({
    name: 'behave-ide',
    onCookieLoad: function() {
    },
    steps: [{
      popup: {
        type: 'modal',
        content: 'Hello there!, let us walk through here for a moment, it will make you feel home :)'
      },
      onLeave: function() {
        console.log(arguments)
        return true
      }
    }]    
  });

  $('#userpass').pwstrength(); 
 

})(jQuery);
//https://getmdl.io/components/index.html
//https://www.materialpalette.com/