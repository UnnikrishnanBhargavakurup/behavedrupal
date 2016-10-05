"use strict";

/**
 * all the event handlers for UI elements.
 */ 
(function($) {
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
   * Remove profile informations.
   */
  function logout() {
    $(".usr-profile").hide();
    $("#login").show();
    $("#saved_projects option").not(':first').remove();
    $(".dialog-open table tbody tr").remove();
    $(".profile_details .mdl-spinner").removeClass('is-active');   
    window.behave.isLoggedin = 0;
  };
    
  // This is for tracking active scenario
  $(".scenario-list").on("focusin", ".itm-scenario input:text", function(e) {
    e.stopPropagation();
    var index = $(this).closest('.itm-scenario').data('index');
    // feature >> scenario 
    Wordspace.getActiveChild().setActiveChild(index);
    hide_help();
    showActiveHelpLink();
  });

  $(".scenario-list").on('click', '.itm-scenario input:submit', function(e) {
    e.preventDefault();
    e.stopPropagation();
    // some thimes it is showing error.
    var index = $(this).closest('.itm-scenario').data('index');
    // feature >> scenario 
    Wordspace.getActiveChild().setActiveChild(index);
    var action_txt = Wordspace.getActiveScenario().find('input:text').val();
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
        var action = new Action(action_txt);
        Wordspace.getActiveChild().getActiveChild().addChild(action);
      }
      Wordspace.getActiveScenario().find('input:text').val('');
    }
    /*
    addAction(action_txt);
    Wordspace.getActiveScenario().find('input:text').val('');
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
    Wordspace.removeChild(f_id);
    // remove the feature.
    $('#feature-' + f_id).remove();
    //prev.trigger('click');
  });
  
  /**
   * remove a scenario fron the feature.
   */
  $(".scenario-list").on('click', '.scenario_close', function(e) {
    e.preventDefault();
    e.stopPropagation();
    var s_id = $(this).data('target');
    var sIndex = $(this).data('index');
    // if no scenario is showing we will show a help message
    if($(".itm-scenario:visible").length == 1) {
      $('.feature-help').show();
    }
    Wordspace.getActiveChild().removeChild(sIndex);
    $(s_id).remove();
  });

  /**
   * add action data table
   */
  $(".scenario-list").on('click', '.add-data', function(e) {
    e.preventDefault();
    e.stopPropagation();
    var action_index = $(this).data('index');
    var data_patterns = JSON.parse(unescape($(this).data('vars')));
    var tbl = '';
    // getting active action from current feature > scenario 
    var action = Wordspace.getActiveChild().getActiveChild().getChild(action_index);
    for(var i = 0; i < data_patterns.length; i++) {
      // if we have data
      if(action.data.length > 0) {
        tbl += action.addTable(data_patterns[i], action.data[i]);
      }
      else {
        // just add the palceholder here
        tbl += action.addTable(data_patterns[i], []);
      }
    };
    Wordspace.getActiveScenario().find('.action-' + action_index).append(tbl);
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
   * Some times that table cell blur is not working.
   * TODO: need to find exact issue.
   */
  $(document).click(function(event) {
    // hide all the message boxes.
    if($(".messages:visible").length > 0 && $(event.target).closest('.messages > div').length == 0) {
      $(".messages").hide();
    }
    $(".scenario-list .cell-ctl").blur();
    $('.cancel-edt-featre').trigger('click');
  });

  /**
   * We will compain this with above function.
   */
  $(document).keyup(function(e) {
    if (e.keyCode == 27) { // escape key maps to keycode `27`
     // hide all the message boxes.
      if($(".messages:visible").length > 0) {
        $(".messages").hide();
      }
      $(".scenario-list .cell-ctl").blur();
      $('.cancel-edt-featre').trigger('click');
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
   * For tab navigation in data cells of an action.
   */
  $(".scenario-list").on("keydown", '.cell-ctl', function(e) {
    if (e.keyCode == 9) { 
      e.preventDefault();
      e.stopPropagation();
      var curr = $("td.cell-dta").index($(this).parent());
      $(this).blur();
      $("td.cell-dta").eq(curr + 1).trigger('click');
    }
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
    for(var i = 0; i < colspan; i++) {
      table.find('tbody tr:nth-last-child(2)').append('<td class="cell-dta">click here</td>');
    }   
  });

  /**
   * Show help message
   */
  function show_help(help_patterns) {
    Wordspace.getActiveScenario().find('input:text').addClass('invalid');
    /*
    for(var i = 0; i < help_patterns.length; i++) {
      var key = help_patterns[i].trim();
      if(key in help_data) {
        Wordspace.getActiveScenario().find('.error-msg span').text(help_data[key]);
      }
      else {
        Wordspace.getActiveScenario().find('.error-msg span').html("Please provide a value for " + key + " placeholder.");
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
    Wordspace.getActiveScenario().find('.error-msg span').html(msg);
    $('.scenario-help').hide();
    Wordspace.getActiveScenario().find('.error-msg').animate({opacity: 1, height : '20px'}, 50);
    Wordspace.getActiveScenario().find('input:text').blur();
  }

  /**
   * Show active help link.
   */
  function showActiveHelpLink() {
    $('.scenario-help').hide();
    if(Wordspace.getActiveScenario()) {
      Wordspace.getActiveScenario().find('.scenario-help').show();
    }
  };

  /**
   * Hide help message.
   */
  function hide_help() {
    Wordspace.getActiveScenario().find('input:text').removeClass('invalid');
    Wordspace.getActiveScenario().find('.error-msg span').text("");
    Wordspace.getActiveScenario().find('.error-msg').animate({opacity: 0, height : 0}, 50, function() {
      Wordspace.getActiveScenario().find('.error-msg .help-txt').data("index", 3);
    });
  }
 
  /**
   * For selecting feature before adding a scenario.
   */
  $("ul.collection").on('click', 'li.feature-item', function(e) {
    e.stopPropagation();
    $("ul.collection li").removeClass('active');
    // make clicked item active
    $(this).addClass('active');
    var activeFeatureIndex = $(this).data('id') || 0;
    // set active feature in workarea 
    Wordspace.setActiveChild(activeFeatureIndex);
    $(".itm-scenario").removeClass('active');

    if($(".scenario-list .feature-" + activeFeatureIndex).length > 0) {
      $('.scenario-help').hide();
      $(".scenario-list .feature-" + activeFeatureIndex).addClass('active');
      $('.feature-help').hide();
      $(".scenario-list .active:first").find('.scenario-help').show();
    }
    else {
      // if there is not visibel scearios we need to show feature help.
      $('.feature-help').show();
    }
    // for showing in the add scenatio dialogbox.
  });
   
  /**
   * Open login dialogbox.
   */
  $(".messages").on("click", ".open_login", function(e) {
    e.stopPropagation();
    e.preventDefault();
    $(".dialog_auth").addClass('dialog_login').removeClass('dialog_reg dialog_password_reset');
    $(".messages").hide();
    Wordspace.login();
  });
  
  /**
   * Open register dialogbox.
   */
  $(".messages").on("click", ".open_register", function(e) {
    e.stopPropagation();
    e.preventDefault();
    $(".dialog_auth").addClass('dialog_reg').removeClass('dialog_login dialog_password_reset');
    $(".messages").hide();
    Wordspace.login();
  });

  /**
   * Need at least one feature for adding scenatios.
   */
  $(".messages").on("click", "#add_feature", function(e) {
    e.preventDefault();
    e.stopPropagation();
    Feature.add();
    $(".messages").hide();
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
        if(data == null || data.length == 0) {
          return;
        }
       //clean everything before adding from saved data.
       Wordspace.clean();
       Wordspace.setData(data);
       project_data = data;
      }
    });    
  };

  // get token and update workspace.
  get_token(get_autosave);

  // for autosaving workspace data.
  var autosave = function() {
    var _project_data = Wordspace.getData();
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
    Wordspace.clean();
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
    // we need a base path from which we go to other locations
    var base_url = $("#base_path").val();
    if(ValidURL(base_url)) {
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
      // this is needed
      $('.run-error-msg').show();       
    }
    
    function ValidURL(str) {
      var regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
      if(!regex .test(str)) {
        return false;
      } else {
        return true;
      }
    }
  });
  
  /**
   * Hide the error message.
   */
  $("#base_path").keydown(function(e) {
    e.stopPropagation();
    $('.run-error-msg').hide(); 
  });

  /**
   * edit an action text.
   */
  $(".scenario-list").on("click", ".list-group-item .btn-edit", function(e) {
    e.preventDefault();
    //e.stopPropagation(); 
    var action_txt = $(this).siblings('span').text();
    var action_index = $(this).parent().attr('id');
    $(this).closest('.panel-body').find('.action_txt').val(action_txt);
    $(this).closest('.panel-body').find(':submit').data('edit-index', action_index);
  });

  /**
   * edit an action text.
   */
  $(".scenario-list").on("click", ".list-group-item .btn-copy", function(e) {
    e.preventDefault();
    //e.stopPropagation(); 
    var action_txt = $(this).siblings('span').text();
    var action = new Action(action_txt);
    Wordspace.getActiveChild().getActiveChild().addChild(action);    
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
   * Cancel feature edit.
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
   * Save feature edit.
   */
  $(".feature-list").on("click", ".save-edt-featre", function(e) {
    e.preventDefault();
    e.stopPropagation(); 
    $('.feature-item .error').hide();
    var featureName = $(this).closest('.feature-item').find('.feature-n-ctl').val().trim();
    var old_name = $(this).data('name');
    
    /**
     * If there already exist a feature with same name.
     */
    if(old_name != featureName) {
      if(Wordspace.findByName(featureName)) {
        // show the error message and exit.
        $(this).closest('.feature-item').find('.error').show();
        return;
      }
    }

    var description = $(this).closest('.feature-item').find('.feature-dis-ctl').val().trim();
    $(this).closest('.feature-item').find('.feature-n').text(featureName);
    $(this).closest('.feature-item').find('.feature-dis').text(description); 
    Wordspace.getActiveChild().name = featureName;
    Wordspace.getActiveChild().description = description;
    $('.feature-item .btn-edit').show();
  });
  
  /**
   * Remove the error message on keydown.
   */
  $(".feature-list").on("keydown", '.feature-n-ctl', function(e) {
    e.stopPropagation();
    $(this).closest('.feature-n').find('.error').hide();
  });

  /**
   * Edit scenario name.
   */
  $(".scenario-list").on("click", ".itm-scenario .panel-heading .btn-edit", function(e) {
    e.preventDefault();
    //e.stopPropagation(); 
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
    /** 
     * if we have a different value for scenario we need to check 
     * whether there exist a scenario with same name. 
     * If yes show an error message.
     */
    if(old_value != scenario_name) {
      if(Wordspace.getActiveChild().findByName(scenario_name)) {
        return;
      }
      else {
        var old_scenario = Wordspace.getActiveChild().findByName(old_value);
        old_scenario.name = scenario_name;
        $(this).parent().text(scenario_name); 
      }
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