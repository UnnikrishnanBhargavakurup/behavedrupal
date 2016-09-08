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