var highlightListener = function(){
  var word;
  document.onmouseup = function(){
    jQuery('body').unhighlight();
    word = '';
    var selection = window.getSelection();
    for (var i = 0; i < selection.rangeCount; i++){
      word += selection.getRangeAt(i);
    }
    jQuery('html').highlight(word, {wordsOnly: true});
    $('.highlightSel').css({'background-color':'yellow'});
  };
};

highlightListener();