
var highlightedSpanTemplate = document.createElement("span");
    highlightedSpanTemplate.className = "highlighted_selection";
    highlightedSpanTemplate.style.backgroundColor = "yellow";

window.addEventListener("mouseup", handleMouseUp);

function handleMouseUp () {
    removeAllHighlights();

    var selection = window.getSelection(),
        selectionString = selection + ""; // same as .toString()

    if (selectionString + "" === "" || selectionString + "" === " ") {
        return; // empty selection
    } else if (selection.anchorNode !== selection.focusNode) {
        return; // selection crosses textNodes
    }
    
    var allTextNodes = getAllTextNodes(document.body),
        currentTextNode,
        match;

    requestAnimationFrame(function () {
        for (var i = 0; i < allTextNodes.length; i++) {
            currentTextNode = allTextNodes[i];

            if (match = currentTextNode.data.match(selectionString)) {
                if (selection.anchorNode !== currentTextNode) {
                    var isolatedTextNode = currentTextNode.splitText(match.index); // remove preceding
                        isolatedTextNode.splitText(selectionString.length); // remove trailing

                    var clonedStyledSpan = highlightedSpanTemplate.cloneNode(true);
                        clonedStyledSpan.appendChild(isolatedTextNode.cloneNode(true));

                    isolatedTextNode.parentNode.insertBefore(clonedStyledSpan, isolatedTextNode);
                    isolatedTextNode.parentNode.removeChild(isolatedTextNode);
                }
            }
        }
    });
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
