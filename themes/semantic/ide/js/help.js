//http://www.w3schools.com/icons/google_icons_av.asp

/**
 * For interactive walk through.
 * https://github.com/jwarby/jquery-pagewalkthrough - recommended
 * http://easelinc.github.io/tourist/
 */

 //http://ui-patterns.com/blog/beyond-usability-designing-with-persuasive-patterns

 // when redesing 
 //http://materializecss.com/

 //http://bdd.alexo.it/
 //https://www.drupal.org/drupalorg/docs/build/bdd-tests/tagging-scenarios

"use strict";

(function($) {
  
  /**
   * For showing help topic related to current context.
   */
  $("body").on('click', '.help-link', function(e) {
    e.preventDefault();
    e.stopPropagation();

    var index  = $(this).data('index');
    var scenario_name = $(this).closest('.itm-scenario').find('.s_name').text();
    console.log(index);
    switch(index) {
      case 1:
        showMessage('<p>This is the workspace we are going to use most of our time in this application, \
          here we add <strong>Features</strong>, <strong>Scenarios</strong> and <strong>Actions</strong>.</p>\
          <p>First thing we might be doing here is adding features of our application here, \
          for that we need to click the Add Feature button from the left pane.</p>\
            <p>After adding a feature we need to define scenarios in that feature; scenario is a flow in an application \
          like <strong>Login</strong> or <strong>Logout</strong> we add scenario by clicking \
          Add Scenario button in top right side of the workspace.</p>\
          <p>After adding a scenario we need to define actions for that scenario; action is step we do in a scenario \
          like pressing a button or filling up a form.</p>\
          <p>After adding <strong>Features</strong>, <strong>Scenarios</strong> and <strong>Actions</strong>\
           we need to download the build and install it in our local development environment,\
          on running the command to execute the test it will automatically pull the changes from workspace and \
          run it through behat.</p>');      
        break;
      case 2:
        showMessage('\
        <p>Here we add actions for the scenarios, an action is something that we do in a scenario.\
        Like <strong>clicking on the login button</strong>, <br/><strong>navigate to a "/user" page</strong>\
        or <strong>filling value in login form</strong>. Here we need to add actions to "<strong>'+ scenario_name +'</strong>" scenario.\
        </p>\
        <p>An action should start with the following keywords. <strong>Give, When, And, Or, But</strong> and <strong>Then</strong>.</p>\
        <p>Following is example for actions in login scenario.<br/>\
        <strong>\
        <br/>Given I am at "/user"\
        <br/>And fill in "username" with "user"\
        <br/>And fill in "password" with "password"\
        <br/>And I press the "Login" button\
        <br/>Then I should see the link "logout"\
        </strong>\
        </p>\
        <div class="clearfix"> </div>\
        <div class="clearfix"> </div>\
        <div style="display:block;overflow:hidden;">\
          <button style="float:right;" type="button" class="mdl-button mdl-js-button message-close mdl-button--primary">Ok</button>\
        </div>');
          break;
        case 3:
        showMessage('\
        Words start with <strong>:</strong> are placeholders for values, we should replace those please holders with a value\
        in single or double quotes. Like <strong>:path</strong> should be replaces to "/user" or "http://drupal.org/user"\
        <p>Following are the common please holders we use in an action<br/>\
        <br/><strong>:path</strong>      - an internal or external path like "/user" or "http://drupal.org/user"\
        <br/><strong>:field</strong>     - a filed name like "user name" or "E-mail" in a form\
        <br/><strong>:value</strong>     - something that you want to use as value for a filed like "foo@example.com"\
        <br/><strong>:message</strong>   - message that show in a page after some action like "Sorry, unrecognized username or password. Have you forgotten your password?"\
        <br/><strong>:region</strong>    - A region in you theme like "footer" or "header"\
        <br/>You can specify the regions from your drupal site in behat.local.yml file like the following (this file will be in the build you download later)\
<pre class="language-markup">region_map:\
<br/>  right sidebar: "#aside .region-sidebar-second"\
<br/>  content: "#content"\
<br/>  # Header regions\
<br/>  left header: "#header-left"\
<br/>  top header: "#nav-header"\
</pre>\
        </p>\
        <div class="clearfix"> </div>\
        <div class="clearfix"> </div>\
        <div style="display:block;overflow:hidden;">\
          <button style="float:right;" type="button" class="mdl-button mdl-js-button message-close mdl-button--primary">Ok</button>\
        </div>');
        break;
      case 4:
      case 5:
        var action_text = $(this).closest('.list-group-item').find('.action_itm').text();
        showMessage('\
        <p>Words end with <strong>:</strong> are placeholders for tabular data for a action\
        for example suppose you want to check whether administrator roles has access to edit page content. Your scenario\
        would be like the following:\
        </p>\
<pre class="language-markup"> Scenario: An administrator should be able to edit page content\
<br/>   Given "page" nodes:\
<br/>     | title      | body          | status  |\
<br/>     | Test page  | test content  | 1       |\
<br/>   When I go to "admin/content"\
<br/>   And I click "edit" in the "Test page" row\
<br/>   Then I should not see "Access denied"\
</pre>\
<p>Here we need to add a dataset for the action <strong>'+ action_text +'</strong> we can do that by clicking the "click here"\
 place holders in the table controller. if we want we can add more rows by clicking <button class="mdl-button mdl-js-button mdl-button--icon"><i class="material-icons">expand_more</i></button>\
 button in the table footer and columns by clicking <button class="mdl-button mdl-js-button mdl-button--icon"><i class="material-icons">chevron_right</i></button> buttons in table header.\
After adding the data click somewhere else to save it.</p>\
        <div class="clearfix"> </div>\
        <div class="clearfix"> </div>\
        <div style="display:block;overflow:hidden;">\
          <button style="float:right;" type="button" class="mdl-button mdl-js-button message-close mdl-button--primary">Ok</button>\
        </div>');      
        break;
      case 6:
        showMessage('\
        <p>Here we specify the base url from which we access all the internal path in our application. For example if you add \
<strong>http://localhost/my_site</strong> for this field and if you have an action like <strong>Given I am at "/user"</strong> then\
behat will try to access the page using the URL <strong>http://localhost/my_site/user</strong></p>\
This will be added in behat.local.yml (this file will be in the build you download in next step). \
<pre class="language-markup">base_url: "http://localhost/my_site"</pre>\
        <div class="clearfix"> </div>\
        <div class="clearfix"> </div>\
        <div style="display:block;overflow:hidden;">\
          <button style="float:right;" type="button" class="mdl-button mdl-js-button message-close mdl-button--primary">Ok</button>\
        </div>');      
        break;
      case 7:
        showMessage('\
        <p>Here we can open a saved project to workspace by clicking <button class="mdl-button mdl-js-button mdl-button--icon"><i class="material-icons">folder_open</i></button> button,\
         delete a saved project by clicking <button class="mdl-button mdl-js-button mdl-button--icon"><i class="material-icons">delete</i></button> button and\
          download features from a saved project by clicking <button class="mdl-button mdl-js-button mdl-button--icon"><i class="material-icons">file_download</i></button> button.</p>\
        <div class="clearfix"> </div>\
        <div class="clearfix"> </div>\
        <div style="display:block;overflow:hidden;">\
          <button style="float:right;" type="button" class="mdl-button mdl-js-button message-close mdl-button--primary">Ok</button>\
        </div>');      
        break;
      case 8:
        showMessage('\
          <p>Here we save workspace data as project, we have two options here either we can save it as a new project or \
          we can save to an existing project.</p> \
          <p>We can load saved project to workspace from the open project from the left side menu <i class="fa fa-folder-open" aria-hidden="true"></i></p> \
          <p>Note: we also have an auto save feature which will preserve current workspace data in session.</p>\
        <div class="clearfix"> </div>\
        <div class="clearfix"> </div>\
        <div style="display:block;overflow:hidden;">\
          <button style="float:right;" type="button" class="mdl-button mdl-js-button message-close mdl-button--primary">Ok</button>\
        </div>');      
        break;
      case 9:
        showMessage('<p>From here we can add common test cases in Drupal. Select features you want to add to your project and click the add button</p>\
        <div class="clearfix"> </div>\
        <div class="clearfix"> </div>\
        <div style="display:block;overflow:hidden;">\
          <button style="float:right;" type="button" class="mdl-button mdl-js-button message-close mdl-button--primary">Ok</button>\
        </div>');      
        break;
      case 10:
        showMessage('<p>Action shoud always start with <strong>Given</strong> / <strong>When</strong> / <strong>Then</strong> / \
        <strong>And</strong> / <strong>Or</strong> / <strong>But</strong></p>\
        <div class="clearfix"> </div>\
        <div class="clearfix"> </div>\
        <div style="display:block;overflow:hidden;">\
          <button style="float:right;" type="button" class="mdl-button mdl-js-button message-close mdl-button--primary">Ok</button>\
        </div>');      
        break;
      default:
    }    
  });

  /**
   * show a message to user.
   */
  function showMessage(message) {
    $("#help_window .msg_body").html(message);
    $("#help_window").show();
  };

  //http://jsfiddle.net/warby_/tsqu05mj/2/
  //document.cookie.indexOf("has_js")
  //http://stripgenerator.com/
  $('body').pagewalkthrough({
    name: 'behave-ide',
    onCookieLoad: function() {
    },
    onBeforeShow: function() {
      $(".help_sample .feature-close").trigger('click');
    },
    steps: [
      {
        wrapper: '#help',
        popup: {
          type: 'tooltip',
          content: '#walkthrough-1',
          position: 'right',
          width: '600'
        }
      },
      {
        onEnter: function() {
          $("body").css({"scrollTop": 0});
          return true;
        },
        popup: {
          content: '#walkthrough-2',
          type: 'modal',
          width: '600'
        }
      },
      {
        wrapper: '#add-feature',
        popup: {
          content: '#walkthrough-3',
          type: 'tooltip',
          position: 'top',
          width: '400'
        }
      },
      {
        onEnter: function() {
          $("#add-feature").trigger('click');
          return true;
        },
        wrapper: '.dialog_add-feature',
        popup: {
          content: '#walkthrough-4',
          type: 'tooltip',
          position: 'right'
        },
        onLeave: function() {
          $("#feature-name").val("Authentication");
          $("#feature-description").val("For posting an issue user shoud be able to login to drupal.");
          $(".btn_add-feature").trigger('click');
          $(".feature-item:nth-last-child(2)").addClass('help_sample');
          return true;
        }
      },
      {
        wrapper: '.add-scenario',
        popup: {
          content: '#walkthrough-5',
          type: 'tooltip',
          position: 'left'
        }
      },
      {
        onEnter: function() {
          $("#add-scenario").trigger('click');
          return true;
        },
        wrapper: '.dialog_add-scenario',
        popup: {
          content: '#walkthrough-6',
          type: 'tooltip',
          position: 'right'
        },
        onLeave: function() {
          if($('.scenario-list .active').length == 0) {
            $("#scenario-name").val('Login');
            $(".btn_add-scenario").trigger('click');
          }
          else if($(".dialog_add-scenario")[0].open) {
            $(".dialog_add-scenario")[0].close();
          }
          return true;
        }
      },
      {
        wrapper: '.scenario-list .active .action_txt',
        popup: {
          content: '#walkthrough-7',
          type: 'tooltip',
          position: 'top',
          width: '600'
        },
        onLeave: function() {
          $(".scenario-list .active").focus();
          if($(".scenario-list .active .list-group-item").length == 0) {
            $(".scenario-list .active .action_txt").focus();
            $(".scenario-list .active .action_txt").val('Given I am at "/user"');
            $('.scenario-list .active input[type="submit"]').trigger('click');
            $(".scenario-list .active .action_txt").val('And fill in "username" with "user"');
            $('.scenario-list .active input[type="submit"]').trigger('click');
            $(".scenario-list .active .action_txt").val('And fill in "password" with "password"');
            $('.scenario-list .active input[type="submit"]').trigger('click');
            $(".scenario-list .active .action_txt").val('And I press the "Login" button');
            $('.scenario-list .active input[type="submit"]').trigger('click');
            $(".scenario-list .active .action_txt").val('Then I should see the message containing "Sorry, unrecognized username or password. Have you forgotten your password?"');
            $('.scenario-list .active input[type="submit"]').trigger('click');
            $(".scenario-list .active .action_txt").blur();
          }
          return true;
        }
      },
      { 
        onEnter: function() {
          if($(".dialog-run")[0].open) {
            $(".dialog-run")[0].close();
          }
          return true;
        },
        wrapper: '.nav-stacked #run',
        popup: {
          content: '#walkthrough-8',
          type: 'tooltip',
          position: 'right',
          width: '600'
        }
      },
      {
        onEnter: function() {
          if(!$(".dialog-run")[0].open) {
            $(".dialog-run")[0].show();
          }
          return true;
        },
        wrapper: '#base_path',
        popup: {
          content: '#walkthrough-9',
          type: 'tooltip',
          position: 'bottom',
          width: '500'
        },
        onLeave: function() {
          $("#base_path").val('http://drupal.org');
          return true;
        }
      },
      {
        wrapper: '#download_build',
        popup: {
          content: '#walkthrough-10',
          type: 'tooltip',
          position: 'bottom',
          width: '500'
        },
        onLeave: function() {
          if($.pagewalkthrough.cur_step == "next") {
            $("#download_build").trigger('click');
          }
          return true;
        }
      },
      {
        onEnter: function() {
          if(!$(".dialog-run")[0].open) {
            $(".dialog-run")[0].show();
            $("#base_path").val('http://drupal.org');
          }
          return true;
        },
        wrapper: 'pre.language-markup:eq(0)',
        popup: {
          content: '#walkthrough-18',
          type: 'tooltip',
          position: 'top',
          width: '500'
        }
      },
      {
        onEnter: function() {
          if(!$(".dialog-run")[0].open) {
            $(".dialog-run")[0].show();
            $("#base_path").val('http://drupal.org');
          }
          return true;
        },
        wrapper: 'pre.language-markup:eq(1)',
        popup: {
          content: '#walkthrough-11',
          type: 'tooltip',
          position: 'top',
          width: '500'
        }
      },
      {
        onEnter: function() {
          if($(".dialog-run")[0].open) {
            $(".dialog-run")[0].close();
          }
          return true;
        },
        wrapper: '#templates',
        popup: {
          content: '#walkthrough-12',
          type: 'tooltip',
          position: 'right'
        }
      },
      {
        wrapper: '#clear_all',
        popup: {
          content: '#walkthrough-13',
          type: 'tooltip',
          position: 'right',
          width: '500'
        }
      },
      {
        wrapper: '#save',
        popup: {
          content: '#walkthrough-14',
          type: 'tooltip',
          position: 'right',
          width: '500'
        }
      },
      {
        wrapper: '#open',
        popup: {
          content: '#walkthrough-15',
          type: 'tooltip',
          position: 'right'
        }
      },
      {
        wrapper: '#feedback',
        popup: {
          content: '#walkthrough-16',
          type: 'tooltip',
          position: 'right'
        }
      },
      {
        wrapper: '.usr-profile',
        popup: {
          content: '#walkthrough-17',
          type: 'tooltip',
          position: 'left'
        }
      }
    ]   
  });

  $('#userpass').pwstrength(); 

  $('.info dd').each(function() {  $(this).css({width: $(this).text()+'%'});});

  $('.messages .close').on('click', function(e) {
    e.stopPropagation();
    e.preventDefault();
    $(this).parent().hide();
  });

  $("#help").click(function(e) {
    e.preventDefault();
    e.stopPropagation();
    $('body').pagewalkthrough('show');
    //http://www.jqueryscript.net/layout/Flexible-Interactive-jQuery-Page-Walkthrough-Plugin.html
  });
  
  // for issue reports.
  $.feedback({
      ajaxURL: '/behave/feedback/?_format=json',
      html2canvasURL: window.behave.theme_path + '/ide/js/html2canvas.min.js',
      feedbackButton : '#feedback',
      highlightElement : false,
      postURL: false
     /* tpl : {
        highlighter :  '<div id="feedback-highlighter"><div><i class="fa fa-bullhorn" aria-hidden="true"></i>&nbsp;<b>Feedback</b></div><p>Click and drag on the page to help us better understand your feedback. You can move this dialog if it\'s in the way.</p><button class="feedback-sethighlight feedback-active"><div class="ico"></div><span>Highlight</span></button><label>Highlight areas relevant to your feedback.</label><button class="feedback-setblackout"><div class="ico"></div><span>Black out</span></button><label class="lower">Black out any personal information.</label><div class="feedback-buttons"><button id="feedback-highlighter-next" class="feedback-next-btn feedback-btn-gray">Next</button><button id="feedback-highlighter-back" class="feedback-back-btn feedback-btn-gray">Back</button></div><div class="feedback-wizard-close"></div></div>'
      }*/
  });

})(jQuery);

/*
var captchaCallback = function() {
  grecaptcha.render('captchafield1', {'sitekey' : '6LdXOigTAAAAAHVzIa0EfOJ6g1prYu6BJd-YltR-'});
  grecaptcha.render('captchafield2', {'sitekey' : '6LdXOigTAAAAAHVzIa0EfOJ6g1prYu6BJd-YltR-'});
};
*/
//https://getmdl.io/components/index.html
//https://www.materialpalette.com/