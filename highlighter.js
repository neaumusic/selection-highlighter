
var highlightedSpanTemplate = document.createElement("span");
    highlightedSpanTemplate.className = "highlighted_selection";
    highlightedSpanTemplate.style.backgroundColor = "yellow";

document.addEventListener("selectionchange", handleSelectionChange);

function handleSelectionChange (e) {
    removeAllHighlights();

    var selection = window.getSelection(),
        selectionString = (selection + "").trim(); // same as .toString()

    console.log("selection:",selection);

    if (selectionString.length < 3) {
        return; // short selection
    } else if (selection.anchorNode !== selection.focusNode) {
        return; // selection crosses textNodes
    } else if (selection.type === "None") {
        return;
    }


    var allTextNodes = getAllTextNodes(document.body);

    var currentTextNode,
        parentNodeName,
        matchIndex,
        isolatedTextNode,
        latest;


    document.removeEventListener("selectionchange", handleSelectionChange);
    latest = requestAnimationFrame(debounce(function () {
        loop1: for (var i = 0; i < allTextNodes.length; i++) {
            currentTextNode = allTextNodes[i];
            parentNodeName = currentTextNode.parentNode.nodeName;
            if (parentNodeName !== "SCRIPT" && parentNodeName !== "STYLE" && parentNodeName !== "HEAD") {
                if ((matchIndex = currentTextNode.data.indexOf(selectionString)) !== -1) {
                    var ancestor = currentTextNode.parentNode;
                    while (ancestor) {
                        if (ancestor.nodeType === "INPUT" || ancestor.nodeType === "TEXTAREA" || ancestor.contentEditable === "true") {
                            console.log("continuing:");
                            continue loop1;
                        } else {
                            if (ancestor.parentNode) {
                                ancestor = ancestor.parentNode;
                            } else {
                                break;
                            }
                        }
                    }

                    if ((selection.anchorNode !== currentTextNode || selection.anchorOffset !== matchIndex) &&
                        (selection.focusNode !== currentTextNode || selection.focusOffset !== matchIndex)) {

                        isolatedTextNode = currentTextNode.splitText(matchIndex); // remove preceding
                        allTextNodes.push(isolatedTextNode.splitText(selectionString.length)); // remove & save trailing

                        var clonedStyledSpan = highlightedSpanTemplate.cloneNode(true);
                            clonedStyledSpan.appendChild(isolatedTextNode.cloneNode(true));

                        isolatedTextNode.parentNode.insertBefore(clonedStyledSpan, isolatedTextNode);
                        isolatedTextNode.parentNode.removeChild(isolatedTextNode);
                    } else {
                        console.log("not wrapping");
                    }
                }
            }
        }
        document.addEventListener("selectionchange", handleSelectionChange);
    }, 300));

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
