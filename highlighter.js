
document.addEventListener("selectionchange", handleSelectionChange);

var highlightedSpanTemplate = document.createElement("div");
    highlightedSpanTemplate.className = "highlighted_selection";
    highlightedSpanTemplate.style.backgroundColor = "yellow";
    highlightedSpanTemplate.style.display = "inline-block";

function handleSelectionChange () {
    // don't listen until execution finishes
    debounce();

    // unwrap any pre-existing text
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

function debounce () {
    document.removeEventListener("selectionchange", handleSelectionChange);
    setTimeout(function () {
        document.addEventListener("selectionchange", handleSelectionChange);
    }, 0);
}
