
document.addEventListener("selectionchange", handleSelectionChange);

var highlightedSpanTemplate = document.createElement("span");
    highlightedSpanTemplate.className = "highlighted_selection";
    highlightedSpanTemplate.style.backgroundColor = "yellow";

function handleSelectionChange () {
    preventStackOverflow();
    removeAllHighlights();

    // assign and verify selection
    var selection = window.getSelection(),
        selectionString = (selection + "").trim();

    if (selectionString.length < 3 ||
        selection.type === "None" ||
        selection.type === "Caret") {
        return;
    }

    // validate all textNodes; check for and highlight matches
    var allTextNodes = getAllTextNodes(document.body);

    matchTextNodes: for (var i = 0; i < allTextNodes.length; i++) {

        var fullTextNode = allTextNodes[i],
            matchIndex = fullTextNode.data.indexOf(selectionString),
            ancestor = fullTextNode.parentNode;

        if (matchIndex !== -1) {

            // check bad ancestor environments
            while (ancestor) {
                if (ancestor.nodeName === "SCRIPT" ||
                    ancestor.nodeName === "STYLE" ||
                    ancestor.nodeName === "HEAD" ||
                    ancestor.nodeName === "INPUT" ||
                    ancestor.nodeName === "TEXTAREA" ||
                    ancestor.contentEditable === "true") {
                    console.log("continue");
                    continue matchTextNodes;

                } else {
                    ancestor = ancestor.parentNode;
                }
            }

            // don't wrap the text under current selection
            if ((selection.anchorNode !== fullTextNode || selection.anchorOffset !== matchIndex) &&
                (selection.focusNode !== fullTextNode || selection.focusOffset !== matchIndex)) {

                // remove preceding text
                isolatedTextNode = fullTextNode.splitText(matchIndex);
                // remove & queue trailing text
                allTextNodes.push(isolatedTextNode.splitText(selectionString.length));

                // wrap cloned text in cloned wrapper
                var clonedStyledSpan = highlightedSpanTemplate.cloneNode(true);
                    clonedStyledSpan.appendChild(isolatedTextNode.cloneNode(true));

                // replace existing text with cloned, wrapped text
                isolatedTextNode.parentNode.insertBefore(clonedStyledSpan, isolatedTextNode);
                isolatedTextNode.parentNode.removeChild(isolatedTextNode);

            } else {
                // queue text occuring after the selection
                allTextNodes.push(fullTextNode.splitText(matchIndex + selectionString.length));
            }
        }
    }
}

function preventStackOverflow () {
    var debouncer = debounce(function () {
        document.removeEventListener("selectionchange", debouncer);
        document.addEventListener("selectionchange", handleSelectionChange);
    }, 0);

    document.removeEventListener("selectionchange", handleSelectionChange);
    document.addEventListener("selectionchange", debouncer);
    setTimeout(debouncer, 0);
}

function removeAllHighlights () {
    var elements = document.querySelectorAll(".highlighted_selection");
    for (var i = 0; i < elements.length; i++) {
        elements[i].parentNode.insertBefore(new Text(elements[i].textContent || ""), elements[i]);
        elements[i].parentNode.removeChild(elements[i]);
    }
    document.normalize();
}

function getAllTextNodes (rootNode) {
    var currentNode, allTextNodes = [],
        filteredTreeWalker = document.createTreeWalker(rootNode, NodeFilter.SHOW_TEXT, null, false);

    while (currentNode = filteredTreeWalker.nextNode())
        allTextNodes.push(currentNode);

    return allTextNodes;
} // credit http://stackoverflow.com/a/10730777/1487102

function debounce (func, wait, immediate) {
    var timeout;
    return function () {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
} // credit to underscore.js
