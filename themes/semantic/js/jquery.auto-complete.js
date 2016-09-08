/*
	jQuery autoComplete v1.0.7
    Copyright (c) 2014 Simon Steinberger / Pixabay
    GitHub: https://github.com/Pixabay/jQuery-autoComplete
	License: http://www.opensource.org/licenses/mit-license.php
*/

(function($){
    $.fn.autoComplete = function(options){
        var o = $.extend({}, $.fn.autoComplete.defaults, options);
        // public methods
        if (typeof options == 'string') {
            this.each(function() {
                var that = $(this);
                if (options == 'destroy') {
                    $(window).off('resize.autocomplete', that.updateSC);
                    that.off('blur.autocomplete focus.autocomplete keydown.autocomplete keyup.autocomplete');
                    if (that.data('autocomplete'))
                        that.attr('autocomplete', that.data('autocomplete'));
                    else
                        that.removeAttr('autocomplete');
                    $(that.data('sc')).remove();
                    that.removeData('sc').removeData('autocomplete');
                }
            });
            return this;
        }

        return this.each(function() {

            var that = $(this);
            // sc = 'suggestions container'
            that.data('sc', $('.autocomplete-suggestions')).data('autocomplete', that.attr('autocomplete'));
            that.attr('autocomplete', 'off');
            that.cache = {};
            that.last_val = '';
            // on resize te window we ned to adjust the dropdown.
            that.updateSC = function(resize, next) {
                $('.autocomplete-suggestions').css({
                    top: that.offset().top + that.outerHeight(),
                    left: that.offset().left,
                    width: that.outerWidth()
                });
                if (!resize) {
                    $('.autocomplete-suggestions').show();
                    if (!$('.autocomplete-suggestions').maxHeight) $('.autocomplete-suggestions').maxHeight = parseInt($('.autocomplete-suggestions').css('max-height'));
                    if (!$('.autocomplete-suggestions').suggestionHeight) $('.autocomplete-suggestions').suggestionHeight = $('.autocomplete-suggestion', $('.autocomplete-suggestions')).first().outerHeight();
                    if ($('.autocomplete-suggestions').suggestionHeight)
                        if (!next) $('.autocomplete-suggestions').scrollTop(0);
                        else {
                            var scrTop = $('.autocomplete-suggestions').scrollTop(), selTop = next.offset().top - $('.autocomplete-suggestions').offset().top;
                            if (selTop + $('.autocomplete-suggestions').suggestionHeight - $('.autocomplete-suggestions').maxHeight > 0)
                                $('.autocomplete-suggestions').scrollTop(selTop + $('.autocomplete-suggestions').suggestionHeight + scrTop - $('.autocomplete-suggestions').maxHeight);
                            else if (selTop < 0)
                                $('.autocomplete-suggestions').scrollTop(selTop + scrTop);
                        }
                }
            }

            $(window).on('resize.autocomplete', that.updateSC);

            $('.autocomplete-suggestion').on('mouseleave', function () {
                $('.autocomplete-suggestion.selected').removeClass('selected');
            });

            $('.autocomplete-suggestion').on('mouseenter', function (){
                $('.autocomplete-suggestion.selected').removeClass('selected');
                $(this).addClass('selected');
            });
            // on selecting an item 
            $('.autocomplete-suggestion').on('mousedown click', function (e) {
                var item = $(this), v = item.data('val');
                if (v || item.hasClass('autocomplete-suggestion')) { // else outside click
                    that.val(v);
                    o.onSelect(e, v, item);
                    $('.autocomplete-suggestions').hide();
                }
                return false;
            });
            // if we move focus to dropdown we will update it with dorpdown value.
            $('#bdd_features').on('blur.autocomplete', '.action_name', function() {
                try { 
                  over_sb = $('.autocomplete-suggestions:hover').length; 
                } 
                catch(e) {
                  over_sb = 0; 
                } // IE7 fix :hover
                if (!over_sb) {
                    that.last_val = that.val();
                    $('.autocomplete-suggestions').hide();
                    setTimeout(function() { 
                      $('.autocomplete-suggestions').hide(); 
                    }, 350); // hide suggestions on fast input
                } else if (!that.is(':focus')) {
                  setTimeout(function(){ 
                    that.focus(); 
                  }, 20);
                }
            });

            if (!o.minChars) {
                $('#bdd_features').on('focus.autocomplete', '.action_name', function() { 
                    that.last_val = '\n'; 
                    that.trigger('keyup.autocomplete'); 
                });
            }

            function suggest(data){
                var val = that.val();
                that.cache[val] = data;
                if (data.length && val.length >= o.minChars) {
                    var s = '';
                    for (var i=0;i<data.length;i++) {
                        s += o.renderItem(data[i], val);
                    }
                    $('.autocomplete-suggestions').html(s);
                    that.updateSC(0);
                }
                else {
                  $('.autocomplete-suggestions').hide();
                }
            }

            $('#bdd_features').on('keydown.autocomplete', '.action_name',function(e) {
                // down (40), up (38)
                if ((e.which == 40 || e.which == 38) && $('.autocomplete-suggestions').html()) {
                    var next, sel = $('.autocomplete-suggestion.selected', $('.autocomplete-suggestions'));
                    if (!sel.length) {
                        next = (e.which == 40) ? $('.autocomplete-suggestion', $('.autocomplete-suggestions')).first() : $('.autocomplete-suggestion', $('.autocomplete-suggestions')).last();
                        that.val(next.addClass('selected').data('val'));
                    } else {
                        next = (e.which == 40) ? sel.next('.autocomplete-suggestion') : sel.prev('.autocomplete-suggestion');
                        if (next.length) { sel.removeClass('selected'); that.val(next.addClass('selected').data('val')); }
                        else { sel.removeClass('selected'); that.val(that.last_val); next = 0; }
                    }
                    that.updateSC(0, next);
                    return false;
                }
                // esc
                else if (e.which == 27) {
                    that.val(that.last_val);
                    $('.autocomplete-suggestion').hide();
                }
                // enter or tab
                else if (e.which == 13 || e.which == 9) {
                    var sel = $('.autocomplete-suggestion.selected', $('.autocomplete-suggestions'));
                    if (sel.length && $('.autocomplete-suggestions').is(':visible')) { 
                        o.onSelect(e, sel.data('val'), sel); 
                        setTimeout(function() { 
                          $('.autocomplete-suggestions').hide(); 
                        }, 20); 
                    }
                }
            });

            $('#bdd_features').on('keyup.autocomplete', '.action_name', function(e) {
                // if it is not this characters
                if (!~$.inArray(e.which, [13, 27, 35, 36, 37, 38, 39, 40])) {
                    var val = that.val();
                    if (val.length >= o.minChars) {
                        if (val != that.last_val) {
                            that.last_val = val;
                            clearTimeout(that.timer);
                            if (o.cache) {
                                if (val in that.cache) { 
                                    suggest(that.cache[val]); 
                                    return; 
                                }
                                // no requests if previous suggestions were empty
                                for (var i=1; i<val.length-o.minChars; i++) {
                                    var part = val.slice(0, val.length-i);
                                    if (part in that.cache && !that.cache[part].length) { suggest([]); return; }
                                }
                            }
                            // search from the data array.
                            that.timer = setTimeout(function() { o.source(val, suggest) }, o.delay);
                        }
                    } else {
                        that.last_val = val;
                        $('.autocomplete-suggestions').hide();
                    }
                }
            });
        });
    }

    $.fn.autoComplete.defaults = {
        source: 0,
        minChars: 3,
        delay: 150,
        cache: 1,
        menuClass: '',
        renderItem: function (item, search){
            // escape special characters
            search = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            var re = new RegExp("(" + search.split(' ').join('|') + ")", "gi");
            return '<div class="autocomplete-suggestion" data-val="' + item + '">' + item.replace(re, "<b>$1</b>") + '</div>';
        },
        onSelect: function(e, term, item){}
    };

}(jQuery));




