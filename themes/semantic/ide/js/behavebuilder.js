/**
 * Following are classes for workarea related functionalities.
 *
 * Base : object base object for all other object.
 *   name             - name of the object
 *   addUniqueChild() - add a unique child.
 * 
 * Workarea : object
 *   loading             - flag if data is getting loaded to workspace.
 *   getData()           - get data from workarea
 *   setData()           - set data to workarea
 *   showMessage()       - Show a message to use
 *   clean()             - Clean everuthing in workarea.
 *   getActiveScenario() - Active focused scenario.
 *
 * Feature : object
 *   description      - description about this feature
 *
 * Scenario : object
 *
 * Action : object
 *   addTable()       - Add a table to action
 *   getData()        - Get data for an action    
 */

"use strict";

/**
 * Base functionality for all other objects.
 */
var Base = function (name) {
  // name of the node
  this.name = name;
  // children
  this.children = {};
  //active child index
  this.activeChild = null;
  // index of this object in array; set by parent of this.
  this.index = 0;
  // child index
  this.childIndex = 0;

  this.parent = null;

  /**
   * add a unique child node.
   */
  this.addUniqueChild = function(node) {
    if(this.chekUnique(node.name)) {
      node.index = this.childIndex;
      node.parent = this;
      this.children[this.childIndex] = node;
      this.activeChild = this.childIndex;
      this.childIndex++;
      node.updateUI();
    }
    else {
      // show an error message 
      node.showDuplicateError(node.name);
    }
  }

  /**
   * add a child node.
   */
  this.addChild = function(node) {
    this.children[this.childIndex] = node;
    node.index = this.childIndex;
    node.parent = this;
    this.activeChild = this.childIndex;
    this.childIndex++;
    node.updateUI();
  }

  /**
   * remove a child node.
   */
  this.removeChild = function(id) {
    delete this.children[id];
  }

  this.removeAll = function() {
    delete this.children;
    this.children = {};
    this.activeChild = null;
  }
  /**
   * set active child node.
   */
  this.setActiveChild = function(id) {
    this.activeChild =  id;
  }

  /**
   * get a child node.
   */
  this.getChild = function(id) {
    return this.children[id];
  } 

  /**
   * get active child node.
   */
  this.getActiveChild = function() {
    return this.children[this.activeChild];
  }  

  /**
   * check if node unique.
   */
  this.chekUnique = function(name) {
    for(var childIndex in this.children) {
      if(name == this.children[childIndex].name) {
        return false;
      }  
    }
    return true;
  }

  /**
   * Find a node by name
   */
  this.findByName = function(name) {
    for(var childIndex in this.children) {
      if(this.children[childIndex].name == name) {
        return this.children[childIndex];
      }
    }
    return null;
  }; 

  /**
   * If already a node exist with the same name.
   */
  this.showDuplicateError = function() {
    if (window.console) {
      console.log("Duplicate name");
    }
  };

};

/**
 * This is a abstract function for child to add UI elements to workarea.
 */
Base.prototype.updateUI = function() {
  console.log("UI not implemented");
};

/**
 * Base class for all the fatures.
 */
var Feature = function(name, description) {
  this.name = name;
  this.description = description;
  this.children = {};
  //active child index
  this.activeChild = null;
  // index of this object in array; set by parent of this.
  this.index = 0;
  // child index
  this.childIndex = 0;
  this.parent = null;
};

Feature.prototype = new Base();

/**
 * Base class for all the scenarios in a feature.
 */
var Scenario = function(name) {
  this.name = name;
  this.children = {};
  //active child index
  this.activeChild = null;
  // index of this object in array; set by parent of this.
  this.index = 0;
  // child index
  this.childIndex = 0;
  this.parent = null;
};

Scenario.prototype = new Base();

/**
 * Base class for all the actions in a scenario.
 */
var Action = function(name, data) {
  this.name = name;
  this.data = data || []; 
};

Action.prototype = new Base();

/**
 * If we have any data patterns we need to show it below an action
 */
Action.prototype.addData = function(data) {
  var action_ui = "";
  /**
   * a word that endwith : 
   * and not followed by anything that is not a space or end of string
   * we dont need to match anything within quotes
   */

  //TODO : need to optimize this regex. 
  var _action_txt = this.name.toLowerCase().replace(/['"][^"']+["']|(\+)/g, "");                
  var data_patterns = _action_txt.match(/\w*:(?![^\s$])/g);  
  // we need to add some sample data for this action.
  if(data_patterns)  {
    //action_ui += '<div class="action-data"></div>';
    action_ui += '<div class="action-data">';
    for(var i = 0; i < data_patterns.length; i++) {
      if(this.data.length > 0) {
        action_ui += this.addTable(data_patterns[i], this.data[i]);
      }
      else {
        action_ui += this.addTable(data_patterns[i], []);
      }
    };
    action_ui += '</div>';
    var data_vars = JSON.stringify(data_patterns);
    action_ui += '<div class="tbl-controls">';
    action_ui += '<a class="scenario-help help-txt help-link" data-index="4" href="#">Help?</a>';
    action_ui += '<a class="add-data txt-small" data-index="'+ this.index +'" data-vars="'+ escape(data_vars) +'" href="#"></i>add data?</a>'; 
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
  return action_ui;
}

Feature.prototype.updateUI = function() {
  $("ul.collection li").removeClass('active');
  var _classes = "";
  var feature_ui = '\
  <li id="feature-'+ this.index +'" class="collection-item avatar email-unread feature-item '+ _classes +' active" data-id="'+ this.index +'">\
    <i class="fa fa-cogs icon_1"></i>\
    <div class="avatar_left">\
      <span class="email-title feature-n">'+ this.name +'</span>\
      <p class="truncate grey-text ultra-small feature-dis">'+ this.description +'</p>\
    </div>\
    <div class="feature-actions">\
      <button data-target="'+ this.index +'" class="mdl-button mdl-js-button mdl-button--icon btn-close pull-right feature-close">\
        <i class="material-icons">close</i>\
      </button>\
      <button class="mdl-button mdl-js-button mdl-button--icon pull-right btn-edit">\
        <i class="material-icons">mode_edit</i>\
      </button>\
    </div>\
    <div class="clearfix"></div>\
  </li>';
  // hide all the scenarios 
  $(".itm-scenario").removeClass('active');
  $(feature_ui).insertBefore('.feature-list li:last-child');
};

Scenario.prototype.updateUI = function() {
  var scenario_ui = '\
  <div id="f'+ this.parent.index +'-s'+ this.index +'" class="Compose-Message itm-scenario feature-'+ this.parent.index +' active" data-index="'+ this.index +'"> \
    <div class="panel panel-default">\
      <div class="panel-heading">\
        <i class="fa fa-cog" aria-hidden="true"></i>&nbsp;<span class="s_name">'+ this.name +'</span>\
        <button data-index="'+ this.index +'" data-target="#f'+ this.parent.index +'-s'+ this.index +'" data-dismiss="alert" class="mdl-button mdl-js-button mdl-button--icon pull-right btn-close scenario_close">\
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
  attach_autocomplete($('#f'+ this.parent.index +'-s'+ this.index +" input:text"));
  $('.feature-help').hide();
  // if we are not loading from saved items
  if(!Wordspace.loading) {
    var offset = $('#f'+ this.parent.index +'-s'+ this.index).offset();
    offset.left -= 120;
    offset.top -= 120;
    $('html, body').animate({
      scrollTop: offset.top,
      scrollLeft: offset.left
    });
  }
  //componentHandler.upgradeDom(); - for updating the meterial js.
  //var el = $('.action-list:last-child')[0];
  //var sortable = Sortable.create(el);
  $(".action-list:last-child").sortable({
    "connectWith": '.action-list',
    "appendTo": '.action-list',
  });
};

Action.prototype.updateUI = function() {
  var action_ui = '\
  <li id="f'+ this.parent.parent.index +'-s'+ this.parent.index +'-a'+ this.index +'" class="list-group-item action-'+ this.index +'">\
    <i class="fa fa-bolt text-warning" aria-hidden="true"></i>\
    <span class="action_itm">'+ this.name +'</span>\
    <button data-target="#f'+ this.parent.parent.index +'-s'+ this.parent.index +'-a'+ this.index +'" data-dismiss="alert" class="mdl-button mdl-js-button mdl-button--icon pull-right action-btn">\
      <i class="material-icons">close</i>\
    </button>\
    <button id="actio-edit-f'+ this.parent.parent.index +'-s'+ this.parent.index +'-a'+ this.index +'" class="mdl-button mdl-js-button mdl-button--icon pull-right btn-edit action-btn">\
      <i class="material-icons">mode_edit</i>\
    </button>\
    <button id="actio-copy-f'+ this.parent.parent.index +'-s'+ this.parent.index +'-a'+ this.index +'" class="mdl-button mdl-js-button mdl-button--icon pull-right btn-copy action-btn">\
      <i class="material-icons">content_copy</i>\
    </button>\
    <div class="mdl-tooltip" for="actio-copy-f'+ this.parent.parent.index +'-s'+ this.parent.index +'-a'+ this.index +'"><span>Duplicate</span></div>\
    <div class="mdl-tooltip" for="actio-edit-f'+ this.parent.parent.index +'-s'+ this.parent.index +'-a'+ this.index +'"><span>Edit</span></div>';
  // add data if pattern exist
  action_ui += this.addData();  
  action_ui += '</li>';
  // find the scenario belogs to this action and inster action to it.
  $('#f'+ this.parent.parent.index +'-s'+ this.parent.index).find('.action-list').append(action_ui);     
  componentHandler.upgradeDom();
};

/**
 * get data from action tables.
 *
 * @param table
 *   array of tables.
 */
Action.getData = function (tables) {
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
 * Add a table to current action.
 *
 * @param label 
 *
 * @param rows
 *  if data exist prepopulate it
 * @return string
 *  HTML table representation of data.
 */
var tableCount = 0;
Action.prototype.addTable = function(label, rows) {
    // default colspan 2
    var colspan = 2;
    var row_data = "";
    /**
     * get row data here if exist.
     * else add dummy rows.
     */
    if(rows.length > 0) {
      colspan = rows[0].length;
      for(var i = 0; i < rows.length; i++) {
        row_data += '<tr>';
        for(var j = 0; j < rows[i].length; j++) {
          row_data += '<td class="cell-dta">'+ rows[i][j] +'</td>';
        }
        row_data += '</tr>';
      }
    }
    else {
      row_data +='\
      <tr>\
        <td class="cell-dta">click here</td>\
        <td class="cell-dta">click here</td>\
      </tr>\
      <tr>\
        <td class="cell-dta">click here</td>\
        <td class="cell-dta">click here</td>\
      </tr>';
    }

    var tbl = '\
    <table id="data-table-'+ tableCount +'" class="mdl-data-table mdl-js-data-table action-data-table">\
      <thead>\
        <tr>\
          <th colspan="'+ colspan +'">\
            <div class="tbl-title">\
              <span>'+ label.slice(0, -1) +'</span>\
            </div>\
            <button id="delete-col-'+ tableCount +'" class="mdl-button mdl-js-button mdl-button--icon delete-col">\
              <i class="material-icons">chevron_left</i>\
            </button>\
            <button id="add-col-'+ tableCount +'" class="mdl-button mdl-js-button mdl-button--icon add-col">\
              <i class="material-icons">chevron_right</i>\
            </button>\
            <div class="mdl-tooltip" for="delete-col-'+ tableCount +'"><span>Delete column</span></div>\
            <div class="mdl-tooltip" for="add-col-'+ tableCount +'"><span>Add column</span></div>\
          </th>\
        </tr>\
      </thead>\
      <tbody>';
    tbl += row_data; // add row data here
    tbl += '<tr>\
          <td colspan="'+ colspan +'">\
            <button id="delete-row-'+ tableCount +'" class="mdl-button mdl-js-button mdl-button--icon delete-row">\
              <i class="material-icons">expand_less</i>\
            </button>\
            <button id="add-row-'+ tableCount +'" class="mdl-button mdl-js-button mdl-button--icon add-row">\
              <i class="material-icons">expand_more</i>\
            </button>\
            <div class="mdl-tooltip" for="delete-row-'+ tableCount +'"><span>Delete row</span></div>\
            <div class="mdl-tooltip" for="add-row-'+ tableCount +'"><span>Add row </span></div>\
            <button id="delete-tbl-'+ tableCount +'" class="mdl-button mdl-js-button mdl-button--icon delete-tbl">\
              <i class="material-icons">delete</i>\
            </button>\
            <div class="mdl-tooltip" for="delete-tbl-'+ tableCount +'"><span>Delete table</span></div>\
            <a class="table-help help-txt help-link" data-index="5" href="#">Help?</a>\
          </td>\
        </tr>\
      </tbody>\
    </table>';
    tableCount++;
    return tbl;
    //$('#action-' + this.index +' .action-data').append(tbl);
    //componentHandler.upgradeDom();
}

var Wordspace = new Base("ide");
// if data is loading to workspace or not
Wordspace.loading = false;

/**
 * show a message to user.
 */
Wordspace.showMessage = function(message) {
  $("#message_window .msg_body").html(message);
  $("#message_window").show();
}; 

(function($) {
  $(".messages").draggable({ handle:'H4'});
  $(".messages").on('click', '.message-close', function(e) {
    e.preventDefault();
    e.stopPropagation();
    $(".messages").hide();
  });
})(jQuery);

/**
 * Add data from backend to workspace
 */
Wordspace.setData = function(features, _classes) {
  this.loading = true;
  for(var i = 0; i < features.length; i++) {
    var fetaure = new Feature(features[i].name, features[i].description);
    Wordspace.addUniqueChild(fetaure); 
    // add feature to workspace.
    for(var j = 0; j < features[i].scenarios.length; j++) {
      // add the scenario to the feature.
      var scenario = new Scenario(features[i].scenarios[j].name);
      fetaure.addUniqueChild(scenario);
      // add all the actions
      for(var k = 0; k < features[i].scenarios[j].actions.length; k++) {
        var action_txt = features[i].scenarios[j].actions[k].action;
        var action_data = features[i].scenarios[j].actions[k].data;
        var action = new Action(action_txt, action_data);
        // add action to scenario.
        scenario.addChild(action);
      }
    }
  }
  componentHandler.upgradeDom();
  // select the fist feature from the list as default.
  $('.feature-list li:first-child').trigger('click');
  this.loading = false;
};

/**
 * get data from workspace.
 */
Wordspace.getData = function() {
  var data = [];
  for(var feature_no in this.children) {
    if (this.children.hasOwnProperty(feature_no)) {
      var feature = {
        "name" : this.children[feature_no].name,
        "description" : this.children[feature_no].description,
        "scenarios" : []
      };
      for(var scenario_no in this.children[feature_no].children) {
        if (this.children[feature_no].children.hasOwnProperty(scenario_no)) {
          var actions = [];
          $("#f" + this.children[feature_no].index + "-s" + this.children[feature_no].children[scenario_no].index +" li").each(function() {
            var action_txt = $(this).find("span.action_itm").html();
            var data = [];
            // need to get all data here
            if($(this).find("table").length > 0) {
              data = Action.getData($(this).find("table"));
            }
            actions.push({"action" : action_txt, "data" : data});
          });
          feature.scenarios.push({"name" : this.children[feature_no].children[scenario_no].name, "actions" : actions});
        }
      } 
      data.push(feature);
    }
  }
  return data;
};

Wordspace.clean = function() {
  this.removeAll();
  (function($) {
    $(".itm-scenario").remove();
    $(".feature-item").remove();
  })(jQuery);
}

Wordspace.getActiveScenario = function() {
  return $("#f" + this.activeChild + "-s" + this.getActiveChild().activeChild);
};

