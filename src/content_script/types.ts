export type SelectionWithAnchorAndFocusNodes = Selection & {
  anchorNode: Node;
  focusNode: Node;
};
export function isSelectionWithAnchorAndFocusNodes(
  selection: Selection | null
): selection is SelectionWithAnchorAndFocusNodes {
  return !!selection && !!selection.anchorNode && !!selection.focusNode;
}
