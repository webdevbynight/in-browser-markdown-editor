/**
 * Checks whether the `button` element has the `.active` class or not.
 * 
 * @param buttonElement - The `button` element to check.
 * @returns True if the element has the `.active` class, false otherwise.
 */
export const isActive = (buttonElement: HTMLButtonElement): boolean => buttonElement.classList.contains("active");

/**
 * Updates the label of the button.
 * 
 * @param buttonElement - The `button` element to update.
 * @param label - The label to use for the update.
 */
export const updateLabel = (buttonElement: HTMLButtonElement, label: string): void => {
    const textLabel = buttonElement.querySelector(".sr-only");
    if (textLabel) {
        buttonElement.title = label;
        textLabel.textContent = label;
    }
};

/**
 * Generates the `dialog` element.
 * 
 * @param documentName - The document name to use.
 * @returns The `dialog` element.
 */
export const generateDialog = (documentName: string): HTMLDialogElement => {
    const dialog = document.createElement("dialog");
    dialog.className = "confirmation";
    dialog.setAttribute("aria-live", "assertive");
    const h2 = document.createElement("h2");
    h2.textContent = "Delete this document?";
    const p = document.createElement("p");
    p.innerText = `Are you sure you want to delete the ‘${documentName}’ document and its contents? This action cannot be reversed.`;
    const buttonContainer = document.createElement("p");
    const button = document.createElement("button");
    button.type = "button";
    button.autofocus = true;
    button.textContent = "Confirm & Delete";
    button.addEventListener("click", () => {
        dialog.close();
        dialog.remove();
    });
    buttonContainer.appendChild(button);
    dialog.appendChild(h2);
    dialog.appendChild(p);
    dialog.appendChild(buttonContainer);
    return dialog;
};
