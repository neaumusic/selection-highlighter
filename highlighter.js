/*
 *
 *  jquery.highlight.js served under MIT license from https://github.com/bartaz/sandbox.js
 *
 */

(function($){

var highlightListener = function(){
  jQuery(document).on('mouseup', function(e){
    jQuery('body').unhighlight();
    var word = '' + window.getSelection().getRangeAt(0);
    if (word.length && word !== ' '){
      jQuery('html').highlight(word, {wordsOnly: true});
      $('.highlightSel').css({'background-color':'yellow'});
    }
  });
};

highlightListener();

}).call(this, jQuery);