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
  $(".xs").on('click', '.help-link', function(e) {
    e.preventDefault();
    e.stopPropagation();
    var index  = $(this).data('index');
    switch(index) {
      case 1:
        break;
      case 2:
        break;
      default:
    }    
  });
  //http://jsfiddle.net/warby_/tsqu05mj/2/
  //document.cookie.indexOf("has_js")

  $('body').pagewalkthrough({
    name: 'behave-ide',
    onCookieLoad: function() {
    },
    onBeforeShow: function() {
      $(".help_sample .feature-close").trigger('click');
    },
    steps: [
      {
        popup: {
          type: 'modal',
          content: '#walkthrough-1',
          width: '400'
        }
      },
      {
        popup: {
          content: '#walkthrough-2',
          type: 'modal',
          width: '400'
        }
      },
      {
        wrapper: '#add-feature',
        popup: {
          content: '#walkthrough-3',
          type: 'tooltip',
          position: 'top'
        }
      },
      {
        onEnter: function() {
          $("#add-feature").trigger('click');
          return true
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
          return true
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
          return true
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
          return true
        }
      },
      {
        wrapper: '.scenario-list .active .action_txt',
        popup: {
          content: '#walkthrough-7',
          type: 'tooltip',
          position: 'top'
        },
        onLeave: function() {
          $(".scenario-list .active").focus();
          if($(".scenario-list .active .list-group-item").length == 0) {
            $(".scenario-list .active .action_txt").focus();
            $(".scenario-list .active .action_txt").val('Given I am at "/user"');
            $('.scenario-list .active input[type="submit"]').trigger('click');
          }
          return true
        }
      },
      { 
        onEnter: function() {
          if($(".dialog-run")[0].open) {
            $(".dialog-run")[0].close();
          }
          return true
        },
        wrapper: '#run',
        popup: {
          content: '#walkthrough-8',
          type: 'tooltip',
          position: 'right'
        }
      },
      {
        onEnter: function() {
          $(".dialog-run")[0].show();
          return true
        },
        wrapper: '#base_path',
        popup: {
          content: '#walkthrough-9',
          type: 'tooltip',
          position: 'bottom'
        },
        onLeave: function() {
          $("#base_path").val('http://drupal.org');
          return true
        }
      },
      {
        wrapper: '#download_build',
        popup: {
          content: '#walkthrough-10',
          type: 'tooltip',
          position: 'bottom'
        }
      },
      {
        onEnter: function() {
          $("#download_build").trigger('click');
          return true
        },
        popup: {
          content: '#walkthrough-11',
          type: 'modal',
          width: '400'
        }
      }
    ]   
  });

  $('#userpass').pwstrength(); 

  $('.info dd').each(function() {  $(this).css({width: $(this).text()+'%'});});

  $('#messages .close').on('click', function(e) {
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