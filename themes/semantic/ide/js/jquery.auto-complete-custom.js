//global cache
var cache = {};
var autocomplete_conf = {
  minChars : 1,
  delay : 150,
  onSelect: function(e, term, item){}
};
// for window resize
var last_elm = null;
function attach_autocomplete(selector) {
  (function($) {
    var dropDown = $('.autocomplete-suggestions');
    var that = selector;
    that.last_val = "";
    that.timer = null;
    var help_text = selector.parent().siblings(".help-text");
    that.on('keydown.autocomplete', function(e) {
        // down (40), up (38)
        if ((e.which == 40 || e.which == 38) && dropDown.html()) {
          var next, sel = $('.autocomplete-suggestion.selected', dropDown);
          if (!sel.length) {
            // if we reach first we need to cycle from last.
            next = (e.which == 40) ? $('.autocomplete-suggestion', dropDown).first() : $('.autocomplete-suggestion', dropDown).last();
            that.val(next.addClass('selected').data('val'));
          } 
          else {
            next = (e.which == 40) ? sel.next('.autocomplete-suggestion') : sel.prev('.autocomplete-suggestion');
            if (next.length) { 
              sel.removeClass('selected'); 
              that.val(next.addClass('selected').data('val')); 
              // we use this in behaviour_builder.js for accessing table data if any.
              that.data('data-index', next.data('data-index'));
              /*
              var help_patterns = that.val().toLowerCase().match(/(^|\s):(\w+)/g);
              if(help_patterns) {
                that.addClass('has_error');
                show_help(help_patterns);
              }
              else {
                that.removeClass('has_error');
                hide_help();
              }
              */
              // here we add help text.
              /*
              var help_index = next.data("help-index");
              if(help_index != "") {
                show_help(help_index);
              }
              else {
                hide_help();
              }
              // this we need later.
              that.data("help-index", help_index);
              */
            }
            else { 
              sel.removeClass('selected'); 
              that.val(that.last_val); 
              next = 0;
            }
          }
          updateSC(0, next)
          return false;
        }
        // esc
        else if (e.which == 27) {
          that.val(that.last_val);
          dropDown.hide();
        }
        // enter or tab
        else if (e.which == 13 || e.which == 9) {
          var sel = $('.autocomplete-suggestion.selected', dropDown);
          if (sel.length && dropDown.is(':visible')) { 
              //autocomplete_conf.onSelect(e, sel.data('val'), sel); 
              setTimeout(function() { 
                dropDown.hide(); 
              }, 20); 
          }
        }
    });

    that.on('change', function(e) {
      /* 
        We need to check the action is correct
        
       */ 
    });

    that.on('keyup.autocomplete', function(e) {
      // if it is not this characters
      if (!~$.inArray(e.which, [13, 27, 35, 36, 37, 38, 39, 40])) {
        var val = that.val();
        if (val.length >= autocomplete_conf.minChars) {
          if (val != that.last_val) {
            that.last_val = val;
            clearTimeout(that.timer);
            if (val in cache) { 
              suggest(cache[val]); 
              return; 
            }
            // no requests if previous suggestions were empty
            for (var i=1; i < val.length-autocomplete_conf.minChars; i++) {
              var part = val.slice(0, val.length - i);
              if (part in cache && !cache[part].length) { 
                suggest([]); 
                return; 
              }
            }
            // search from the data array.
            that.timer = setTimeout(function() { 
              source(val, suggest);
            }, autocomplete_conf.delay);
          }
        } 
        else {
          that.last_val = val;
          dropDown.hide();
        }
        if(val == "") {
          $(".itm-scenario :submit").removeData('edit-index');
        }
      }
    });

    // if we move focus to dropdown we will update it with dorpdown value.
    that.on('blur.autocomplete', function() {
        try { 
          over_sb = $('.autocomplete-suggestions:hover').length; 
        } 
        catch(e) {
          over_sb = 0; 
        } // IE7 fix :hover
        if (!over_sb) {
            that.last_val = that.val();
            dropDown.hide();
            setTimeout(function() { 
              dropDown.hide(); 
            }, 350); // hide suggestions on fast input
        } else if (!that.is(':focus')) {
          setTimeout(function(){ 
            that.focus(); 
          }, 20);
        }
    });
    
    /**
     * Show help message
     */
    function show_help(help_patterns) {
      for (var i = 0; i < help_patterns.length; i++) {
        var key = help_patterns[i].trim();
        if(key in help_data) {
          $.event.trigger({
            type: "behave_msg",
            message: help_data[key]
          });
          help_text.find('p').text(help_data[key]);
        }
        else {
          $.event.trigger({
            type: "behave_msg",
            message: "Please provide a value for " + key + " placeholder."
          });
          help_text.find('p').text("Please provide a value for " + key + " placeholder.");
        }
        break;
      };
      help_text.animate({opacity: 1}, 50);
    }

    /**
     * Hide help message.
     */
    function hide_help() {
      help_text.find('p').text("");
      help_text.animate({opacity: 0}, 50);
    }
    /**
     * This is a private function for this class
     */
    function suggest(data) {
        var val = that.val();
        if (data.length && val.length) {
            cache[val] = data;
            var s = '';
            for (var i = 0; i < data.length; i++) {
              // if we have a help for this action we will pass index here
              s += renderItem(data[i].text, val, data[i].index);
            }
            // add to dropdown
            dropDown.html(s);
            // update the dropdown position
            updateSC(0);
            help_text.animate({opacity: 0}, 50);
        }
        else {
          /*
          // get all the helps associated with input text.
          var help_patterns = val.toLowerCase().match(/(^|\s):(\w+)/g);
          if(help_patterns) {
            that.addClass('has_error');
            for (var i = 0; i < help_patterns.length; i++) {
              var key = help_patterns[i].trim();
              if(key in help_data) {
                help_text.find('p').text(help_data[key]);
              }
              else {
                help_text.find('p').text("Please provide a value for " + key + " placeholder.");
              }
              break;
            }
            help_text.animate({opacity: 1}, 50);
          }
          else {
            that.removeClass('has_error');
            help_text.animate({opacity: 0}, 50);
          }
          */
          /*
          var index = that.data("help-index");
          if(index != "" && index !== undefined) {
            help_text.find('p').text("");
            for (var key in action_data[index].h) {
              if(val.toLowerCase().indexOf(key) !== -1) {
                // show an help message to update the paceholders.
                help_text.find('p').text(action_data[index].h[key]);
                break;
              }
            }
          }
          */
          // don't show the dropdown.
          dropDown.hide();
        }
    }

   /**
    * update the dropdown size and position accoding to
    * action input filed.
    */
    function updateSC(resize, next) {  
      last_elm = that; 
      dropDown.css({
        top: that.offset().top + that.outerHeight(),
        left: that.offset().left,
        width: that.outerWidth()
      });
      if (!resize) {
        dropDown.show();
        if (!dropDown.maxHeight) {
          dropDown.maxHeight = parseInt(dropDown.css('max-height'));
        }
        if (!dropDown.suggestionHeight) {
          dropDown.suggestionHeight = $('.autocomplete-suggestion', dropDown).first().outerHeight();
        }
        if (dropDown.suggestionHeight) {
          if (!next) {
            dropDown.scrollTop(0);
          }
          else {
            var scrTop = dropDown.scrollTop(), selTop = next.offset().top - dropDown.offset().top;
            if (selTop + dropDown.suggestionHeight - dropDown.maxHeight > 0) {
              dropDown.scrollTop(selTop + dropDown.suggestionHeight + scrTop - dropDown.maxHeight);
            }
            else if (selTop < 0) {
              dropDown.scrollTop(selTop + scrTop);
            }
          }
        }
      }
    };

    /**
     * For accessing using mouse.
     */
    $('.autocomplete-suggestions').on('click', '.autocomplete-suggestion', function(e) {
      e.preventDefault();
      $(this).addClass('selected');
      that.val($(this).data('val')); 
      // we use this in behaviour_builder.js for accessing table data if any.
      that.data('data-index', $(this).data('data-index'));     
    });
  }(jQuery));   
};

/**
 * Here we match with json data.
 */
function source(term, suggest) {
  //TODO: need to find a better alternative for this.
  term = term.toLowerCase();
  var choices = action_data;
  var suggestions = [];
  for (i = 0; i < choices.length; i++) {
    var text = choices[i].t;
    var action = text.toLowerCase();
    // if the action start with 
    if (action.indexOf(term) == 0 ) {
      suggestions.push({
        "text" : text, 
        "index" : i // used for adding table for data.
      });
    }
    else {
      // remove the first word from text.
      text = text.substr(text.indexOf(" ") + 1);
      var first_word = term.substr(0, term.indexOf(" "));
      // need to add but here.
      if(first_word == 'and' || first_word == 'or') {
        term_stripped = term.substr(term.indexOf(" ") + 1);
        action = action.substr(action.indexOf(" ") + 1);
        if (action.indexOf(term_stripped) == 0 || term_stripped == "") {
          suggestions.push({
            "text" : first_word == 'and' ? 'And ' + text : 'Or ' + text, 
            "index" : i // used for adding table for data.
          });          
        }
      }
      else {
        if(term == 'a' || term == 'an' || term == 'and') {
            suggestions.push({
              "text" : "And " + text, 
              "index" : i // used for adding table for data.
            });  
        }
        if(term == 'o' || term == 'or') {
            suggestions.push({
              "text" : "Or " + text, 
              "index" : i // used for adding table for data.
            }); 
        }
        if(term == 'b' || term == 'bu' || term == 'but') {
            suggestions.push({
              "text" : "But " + text, 
              "index" : i // used for adding table for data.
            }); 
        }
      }
    }
  }
  suggest(suggestions);
};

/**
 * Render this in dropdown
 */
function renderItem(item, search, index) {
  // escape special characters
  search = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  var re = new RegExp("(" + search.split(' ').join('|') + ")", "gi");
  return '<div class="autocomplete-suggestion" data-val="' + item + '" data-data-index="' + index + '">' + item.replace(re, "<b>$1</b>") + '</div>';
}

(function($) {
  $(window).on('resize.autocomplete', function() {
    if(!last_elm) {
      return;
    }
    $('.autocomplete-suggestions').css({
      top: last_elm.offset().top + last_elm.outerHeight(),
      left: last_elm.offset().left,
      width: last_elm.outerWidth()
    });
    if (!$('.autocomplete-suggestions').maxHeight) $('.autocomplete-suggestions').maxHeight = parseInt($('.autocomplete-suggestions').css('max-height'));
    if (!$('.autocomplete-suggestions').suggestionHeight) $('.autocomplete-suggestions').suggestionHeight = $('.autocomplete-suggestion', $('.autocomplete-suggestions')).first().outerHeight();
    if ($('.autocomplete-suggestions').suggestionHeight)
    $('.autocomplete-suggestions').scrollTop(0);    
  });
}(jQuery));  