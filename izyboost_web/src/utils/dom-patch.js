/**
 * Fix for React "NotFoundError: Failed to execute 'removeChild' on 'Node'"
 * caused by Google Ads, Google Translate, or other 3rd party scripts modifying the DOM directly.
 * 
 * This monkey-patches Node.prototype.removeChild to safely ignore errors when 
 * React tries to remove a node that is no longer a child of the parent.
 */

if (typeof window !== 'undefined') {
    const originalRemoveChild = Node.prototype.removeChild;

    Node.prototype.removeChild = function (child) {
        if (child.parentNode !== this) {
            console.warn(
                '[React DOM Fix] Attempted to remove a node that is not a child of this parent.',
                '\nChild:', child,
                '\nParent:', this
            );
            // Return the child to satisfy the method signature, even though we didn't remove it
            return child;
        }
        return originalRemoveChild.apply(this, arguments);
    };

    // Optional: Fix for insertBefore as well, which can sometimes fail similarly
    const originalInsertBefore = Node.prototype.insertBefore;
    Node.prototype.insertBefore = function (newNode, referenceNode) {
        if (referenceNode && referenceNode.parentNode !== this) {
            console.warn(
                '[React DOM Fix] Attempted to insert before a reference node that is not a child of this parent.',
                '\nReference:', referenceNode,
                '\nParent:', this
            );
            // Fallback: append to the end if reference is missing? 
            // Or better to just let it append if reference is null. 
            // If reference is invalid, we might break unsafe layout, but preventing crash is priority.
            // We'll treat it as append (referenceNode = null)
            return originalInsertBefore.call(this, newNode, null);
        }
        return originalInsertBefore.apply(this, arguments);
    };
}
