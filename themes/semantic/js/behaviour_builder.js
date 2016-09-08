// namespace
window.bdd_builder = window.bdd_builder || {};
// for accessing the active ui element.
var active_content = null;
/*
do_addFeature("feature 1");
do_addDescription("this is a test feature");
do_addScenarioControllers();
do_addScenario("user login");
do_addActionControllers();
do_addAction("given I am in home page");
*/
/**
 * Add all the event handlers here.
 */
bdd_builder.ready = function() {
  // add a feature here
  $("#add_feature").click(function() {
    var feature_name = $("#feture_name").val();
    do_addFeature(feature_name);
    do_addDescriptionControllers();
    // add different label
    if($("#bdd_features div").length > 0) {
      $("#add_feature").text("Add another");
      $("#bdd_features").show();
    }
    $("#feture_name").val("");
  });

  /**
   * Add a description to a feature.
   */
  $("#bdd_features").on( "click", "button.add_description", function(event) {
    event.preventDefault();
    var description = $(active_content).find(".feature_description").val();
    do_addDescription(description);
    do_removeDescriptionControllers();
    do_addScenarioControllers();
  });

  /**
   * Add a scenario to the project.
   */
  $("#bdd_features").on( "click", "div.add_scenerio", function(event) {
    event.preventDefault();
    var scenario_name = $(active_content).find('.scenario_name').val();
    do_addScenario(scenario_name);
    // here we add this controllers to the last item.
    active_content = $(active_content).find(".content:last");
    do_addActionControllers();
    $(this).siblings('.scenario_name').val("");
    //$(this).text("Add another scenario");
    return;
  });

  /**
   * Add an action to the scenario
   */
  $("#bdd_features").on("click", ".add_action", function(event) {
    event.preventDefault();
    var input = $(active_content).find(".action_name");
    if(input.hasClass('has_error')) {
      do_shake(input.parent().siblings('.help-text'));
      return;
    }
    var action_name = input.val();
    // index of this action in orginal data array.
    var data_index = input.data("data-index");
    /*
    try {
      var tag = "";
      if(data_index != undefined) {
        tag = action_data[data_index].tag;
      }
      do_addAction(action_name, tag);
    } catch(err) {
      console.log(err);
    }
    */
    try {
      do_addAction(action_name, "");
    } catch(err) {
      console.log(err);
    }
    // this will add a table data for the above action.
    try {
      // if it requires a table data we will add a sample.
      var matches = action_name.toLowerCase().match(/\w+:/ig);
      if(matches.length > 0) {
        if(data_index != undefined && action_data[data_index].d.length > 0) {
          var num_cols = action_data[data_index].d[0].length;
          do_addTable(num_cols);
          do_addTableData(action_data[data_index].d);
          do_addTableFooter(num_cols);
        }
        else {
          /**
           * show a link to add data to the action.
           * Usually it comes as the last word. 
           */
          do_addDataLink(matches[matches.length - 1]);
        }
      }
    } catch(err) {
      console.log(err);
    }
    //clear the action input.
    input.val("");
  });

  /**
   * Add table data
   */
  $("#bdd_features").on("click", ".add_table_data", function(event) {
    event.preventDefault();
    $data_cols = $(active_content).find("table:last .col-data");
    var cols = [];
    $data_cols.each(function(){
      cols.push($(this).val());
    });
    if(cols.length > 0) {
      do_addTableData([cols]);
      $data_cols.val("");
    }
  });

  /**
   * Add number of colms to table.
   */
  $("#bdd_features").on("click", ".table_add_cols", function(event) {
    event.preventDefault();
    var num_cols = $(active_content).find(".num-cols").val();
    // we are limiting this to 8cols now because of UI limitations.
    if(num_cols > 0 && num_cols < 8) {
      do_addTable(num_cols);
      do_addTableFooter(num_cols);
      $(active_content).find(".num-cols").val("");
      $(active_content).find(".action-advanced .title, .content").removeClass('active');
    }
  });

  /**
   * Add number of colms to table.
   */
  $("#bdd_features").on("click", ".cancel_add_cols", function(e) {
    e.stopPropagation();
    $(active_content).find(".num-cols").val("");
    $(active_content).find(".action-advanced .title, .content").removeClass('active');
  });
  
  /**
   * remove add datafileds from form.
   */
  $("#bdd_features").on("click", ".add_table_finish", function(e) {
    e.stopPropagation();
    $(active_content).find("table:last tfoot").remove();
    $(active_content).find(".action-advanced .title, .content").removeClass('active');
  });
  
  /**
   * Ignore an error message.
   */
  $("#bdd_features").on("click", ".ignore-error", function(e) {
    e.stopPropagation();
    $("input.has_error").removeClass('has_error');
    $(this).parent().text("");
  });

  // add all the API endpoints here
  $.extend($.fn.api.settings.api, {
    actionSearch  : '/search/actions'
  });

  /**
   * For removing different ites from the interface.
   */
  $("#bdd_features").on("click", ".btn-close, actions .close", function(e) {
    e.stopPropagation();
    var parent = $(this).parent();

    if(parent.closest('td').hasClass('tbl-actions')) {
      parent.closest('tr').remove();
      return;
    }

    if(parent.closest('th').hasClass('data-tbl')) {
      parent.closest('table').remove();
      return;
    }

    if(parent.hasClass('feature') || parent.hasClass('scenario')) {
      parent.next().remove();
    }

    parent.remove();

    if($("#bdd_features").children().length == 0) {
      $("#bdd_features").hide();
    }
    $(".bdd_scenario").each(function() {
      if($(this).children().length == 0) {
        $(this).hide();
      }
    });
    do_change_action_help();
  });

  /**
   * Download the feature we genrated using our interface.
   */
  $(".download-code").click(function() {
    try {
      var data = do_collectFeatures();
      $.ajax({
        method: "POST",
        url: "/download/features?_format=json",
        data: JSON.stringify(data),
        contentType : 'application/json'
      }).done(function(response) {
        if(response.url != "") {
          //TODO: need to find a better solution for this.
          window.location.href = response.url;
        }
      });
    } catch(error) {
      console.log(error);
    };
  });

  /**
   * For adding data for action
   */
  $("#bdd_features").on("click", ".add_data", function(e) {
    e.stopPropagation();
    e.preventDefault();
    console.log("need to add even handler here");
  });


  // This is for tracking active feature / scenario
  $("#bdd_features").on("focusin", "input, textarea", function(e) {
    e.stopPropagation();
    active_content = $(this).closest('.content');
  });
  // end of document load.
};

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * we need to change the help text if there is not action in scenario.
 */
function do_change_action_help() {
  var $scenerio = $(active_content).find("actions");
  if($scenerio.children("div").length == 0) {
    $(active_content).find("small").text("Action: A step in this flow, should start with Given or When");
  }
  else {
    $(active_content).find("small").text("Should start with When/And/Or/Then");
  }
  // enable or disable the download button.
  if($("#bdd_features actions div").length > 0) {
    do_enableDownload();
  }
  else {
    do_disableDownload();
  }
}

/** 
 * For getting all the feature data from interface.
 */
function do_collectFeatures() {
  this.fatures = [];
  var self = this;
  $(".feature").each(function() {
    var name = $(this).text().trim();
    this.fature = {
      "name" : name.substring(9),
      "description" : $(this).next().find('.description').text(),
      "scenarios" : []
    };
    var self2 = this; 
    $(this).next().find('.scenario').each(function() {
      var name = $(this).text().trim();
      this.scenario = {
        "name" : name,
        "actions" : [],
        "tags" : []
      };
      var self3 = this;
      $(this).next().find('actions').children().each(function() {
        if($(this).is("div.action")) {
          self3.scenario.actions.push({"text" : $(this).text()});
          // if we have a tag we need to it here.
          /*
          if($(this).data('tag') != "") {
            self3.scenario.tags.push('@' + $(this).data('tag'));
          }
          */
        } 
        else if($(this).is("table")) {
          // this must be a table of data.
          self3.scenario.actions.push({"data" : do_getTable_data(this)});
        }
      });
      self2.fature.scenarios.push(this.scenario);
    });
    self.fatures.push(this.fature);
  }); 
  return this.fatures; 
}

var features = {};
var feature_count = -1;



/**
 * Add a feature.
 */
function do_addFeature(feature_name) {
  // santize feature name.
  feature_name = feature_name.trim();
  if(feature_name != "") {
    feature_count++;
    // this we will use to check uniqueness 
    var feature_original_name =  feature_name.toLowerCase();
    if(!feature_name.toLowerCase().startsWith("feature:")) {
      feature_name = "Feature: " + feature_name;
    }
    else if(feature_name.toLowerCase().startsWith("feature :")) {
      feature_name = "Feature: " + trim(feature_name.substring(9));
    }
    else {
      feature_name = capitalizeFirstLetter(feature_name);
    }
    // collapse all other features
    //$("#bdd_features div.active").removeClass('active');

    // add to UI
    $("#bdd_features").append('\
    <div id="feature-'+ feature_count +'" class="active title feature">\
      <i class="dropdown icon"></i>\
      '+ feature_name +'\
      <button class="mini right floated ui icon button btn-close">\
        <i class="icon close"></i>\
      </button>\
    </div>\
    <div id="content-'+ feature_count +'" class="active content">\</div>');
    $("#bdd_features").show();
    features[feature_count] = {
      "name" : feature_name,
      "scenarios" : [],
      "description" : ""
    };
    return true;
  } 
}

/**
 * Enable the download button.
 */
function do_enableDownload() {
  $(".download-code").removeClass('disabled');
}

/**
 * Enable the download button.
 */
function do_disableDownload() {
  $(".download-code").addClass('disabled');
}

/**
 * Add description controllers.
 */
function do_addDescriptionControllers() {
  $("#content-"+ feature_count).append('\
  <div class="ui form form-description">\
    <div class="field">\
      <label>Short description</label>\
      <textarea rows="2" class="feature_description"></textarea>\
      <small>A short description about this feature, a user story</small>\
      <button class="add_description ui right floated button mini">Add</button>\
    </div>\
  </div>');
  return true;
}

/**
 * Remove description controller.
 */
function do_removeDescriptionControllers() {
  $(active_content).find(".form-description").remove();
  return true;
}

/**
 * Add description to feature
 */
function do_addDescription(description) {
  var description = do_nl2br(description.trim());
  $(active_content).append("<p class='description'>"+ description +"</p>");
}


/**
 * Add description controllers.
 */
function do_addScenarioControllers() {
  $(active_content).append('\
    <div class="bdd_scenario ui styled fluid"></div>\
      <div class="add_scenario_form ui fluid action input">\
        <input class="scenario_name" type="text" placeholder="Add a scenario...">\
      <div class="add_scenerio ui button">Add Scenario</div>\
    </div>\
    <small>Scenario: a flow in this feature</small>');
  return true;
}

/**
 * add scenerio
 */
function do_addScenario(scenario_name) {
  var scenario_name = scenario_name.trim();
  if(scenario_name == "") {
    return;
  }
  // append Scenario: before the name
  if(!scenario_name.toLowerCase().startsWith("scenario:")) {
    scenario_name = "Scenario: " + scenario_name;
  }
  else if(scenerio_name.toLowerCase().startsWith("scenario :")) {
    scenario_name = "Scenario: " + trim(scenario_name.substring(10));
  }
  else {
    scenario_name = capitalizeFirstLetter(scenario_name);
  }
  // if it alredy defined for this feature we ignore it return it
  if(
       features[feature_count].scenarios.length > 0 && 
       features[feature_count].scenarios.hasOwnProperty(scenerio_name)) 
  {
    //TODO: need to show a message
    return ;
  } 
  $scenerio = $(active_content).find(".bdd_scenario");
  $scenerio.addClass('accordion');
  $scenerio.show();
  //collapse all other scenerios.
  //$scenerio.find(".active").removeClass('active');
  $scenerio.append('\
  <div class="active title scenario">\
    <i class="dropdown icon"></i>\
    '+ scenario_name +'\
    <button class="mini right floated ui icon button btn-close">\
      <i class="icon close"></i>\
    </button>\
  </div>\
  <div class="active content"></div>');
  features[feature_count].scenarios[scenario_name] = [];
  return true;
}

/**
 * Add description controllers.
 */
function do_addActionControllers() {
  //$last_scenerio = $("#bdd_features > .content.active .bdd_scenario .content").last();
  $(active_content).append(
  '<actions>\
  </actions>\
  <div class="ui help-text">\
    <p></p>\
  </div>\
  <div class="ui fluid action input">\
    <input class="action_name" type="text" placeholder="Add an action">\
    <div class="add_action ui button">Add Action</div>\
  </div>\
  <small>Action: A step in this flow, should start with Given or When</small>\
  <div class="ui accordion action-advanced">\
    <div class="title">\
      <i class="dropdown icon"></i>\
      Advanced\
    </div>\
    <div class="content">\
    <p>Add a table of data for the above action.</p>\
    <div class="ui mini form table-form">\
    <div class="fields">\
      <div class="field">\
        <label>Number of columns</label>\
        <input placeholder="" class="num-cols" type="text">\
      </div>\
    </div>\
    <div class="ui button mini submit table_add_cols">Submit</div><div class="ui button mini cancel_add_cols">Cancel</div>\
    </div>\
    </div>\
  </div>');
  attach_autocomplete($(active_content).find(".action_name").last());
  return true;
}


/**
 * add action
 */
function do_addAction(action_text, tag) {
  action_text = action_text.trim();
  if(action_text == "") {
    return;
  }
  $scenerio = $(active_content).find("actions");
  //$scenerio.append('<div class="ui mini message" data-tag="'+ tag +'">'+ action_text +'<i class="close icon"></i></div>'); 
  $scenerio.append('<div class="ui mini message action">'+ action_text +'<i class="close icon"></i></div>'); 
  // we need to change the help text.
  do_change_action_help();
  return true;
}

/**
 * Add a table controller
 */
function do_addTable(cols) {
  $scenerio = $(active_content).find("actions");
  var table = '<table class="ui basic table">';
  table += '<thead class="full-width">\
      <tr>\
        <th colspan="'+ (cols + 1) +'" class="data-tbl">\
          <button class="mini right floated ui icon button btn-close">\
            <i class="icon close"></i>\
          </button>\
        </th>\
      </tr>\
    </thead>';
  table += '<tbody>\
    </tbody>\
    </table>';
    /*
  table += '<tfoot class="full-width">\
        <tr>\
          <th colspan="'+ cols +'">\
            <div class="ui form">\
              <div class="field"><label>Add data here: </label></div>\
              <div class="inline fields">';
              for (var i = 0; i < cols; i++) {
                table += '<div class="field"><input class="col-data" type="text" placeholder=""></div>';
              }
              table += '</div>\
              <div class="field">\
                <div class="mini right floated ui submit button add_table_data">Add</div>\
                <div class="mini right floated ui submit button add_table_finish">Finish</div>\
              </div>\
            </div>\
          </th>\
        </tr>\
      </tfoot>';
  table += '</table>'
  */
  $scenerio.append(table); 
  return true;
}

/**
 * get data from table.
 */
function do_getTable_data(table) {
  return $(table).find('tbody tr').get().map(function(row) {
    return $(row).find('td:not(.tbl-actions)').get().map(function(cell) {
      return $(cell).html();
    });
  });
}

/**
 * Add table footer controllers. 
 */
function do_addTableFooter(cols) {
  var $table =  $(active_content).find("table:last");
  var footer = '\
  <tfoot class="full-width">\
      <tr>\
        <th colspan="'+ (cols + 1) +'">\
          <div class="ui form">\
            <div class="inline field"><label>Add data here: </label></div>\
            <div class="inline fields">';
            for (var i = 0; i < cols; i++) {
              footer += '<div class="field"><input class="col-data" type="text" placeholder=""></div>';
              if(i == 3 || i == 8) {
                footer += '</div><div class="inline fields">';
              }
            }
            footer += '</div>\
            <div class="field">\
              <div class="mini right floated ui submit button add_table_finish">Finish</div>\
              <div class="mini right floated ui submit button add_table_data">Add</div>\
            </div>\
          </div>\
        </th>\
      </tr>\
    </tfoot>';
  $table.append(footer);
}

/**
 * Add a table of data to actions
 */
function do_addTableData(rows) {
  $scenerio =  $(active_content).find("actions table:last tbody");
  var data = "";
  for(var i = 0; i < rows.length; i++) {
    data += "<tr>";
    for (var j = 0; j < rows[i].length; j++) {
      data += "<td>"+ rows[i][j] +"</td>";
    }
    data += "<td class='tbl-actions'>\
               <button class='mini ui icon button btn-close remove-row'>\
                 <i class='icon close'></i>\
               </button></td>";
    data += "</tr>";
  }
  $scenerio.append(data); 
  return true;
}

/**
 * show a link to add data table to the action.
 */
function do_addDataLink(placeholder) {
  $(active_content).find("actions").append('<a class="add_data" href="#">Click here to add data for '+ placeholder +'</a>');
}

/**
 * Shake the error message
 */
function do_shake(elm) {
  $(elm).find('p').css('color', 'red');
  $(elm).animate({
    'margin-top': '-=5px',
    'margin-bottom': '+=5px'
  }, 150, function() {
    $(elm).animate({
        'margin-top': '+=5px',
        'margin-bottom': '-=5px'
    }, 150, function() {
        $(elm).find('p').css('color', 'green');
        if($(elm).find(".ignore-error").length == 0) {
          $(elm).find('p').append("&nbsp;&nbsp;<button class='mini ui icon button btn-close ignore-error'><i class='icon close'></i></button>");
        }
    });
  });
}

/**
 * Convert new line to <br/>
 */
function do_nl2br(str, is_xhtml) {   
  var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';    
  return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1'+ breakTag +'$2');
}

// attach ready event
$(document)
  .ready(bdd_builder.ready)
;
