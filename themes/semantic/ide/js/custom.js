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
        wrapper: '#help',
        popup: {
          type: 'tooltip',
          content: '#walkthrough-1',
          position: 'right'
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
        }
      },
      {
        onEnter: function() {
          if(!$(".dialog-run")[0].open) {
            $(".dialog-run")[0].show();
            $("#base_path").val('http://drupal.org');
          }
          $("#download_build").trigger('click');
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