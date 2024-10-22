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
 * Closes and removes the `dialog` element from the DOM.
 * 
 * @param dialogElement - The `dialog` element.
 */
const closeAndRemoveDialog = (dialogElement: HTMLDialogElement): void => {
    dialogElement.close();
    dialogElement.remove();
};

/**
 * Generates the `dialog` element.
 * 
 * @param documentName - The document name to use.
 * @returns The `dialog` element.
 */
export const generateDialog = (documentName: string): HTMLDialogElement => {
    const dialogLabel = "Delete this document?";
    const dialogLabelId = "confirmation-label";
    const dialogDescription = `Are you sure you want to delete the ‘${documentName}’ document and its contents? This action cannot be reversed.`;
    const dialogDescriptionId = "confirmation-description";
    const dialog = document.createElement("dialog");
    dialog.className = "confirmation";
    dialog.setAttribute("role", "alertdialog");
    dialog.setAttribute("aria-live", "assertive");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-labelledby", dialogLabelId);
    dialog.setAttribute("aria-describedby", dialogDescriptionId);
    const h2 = document.createElement("h2");
    h2.id = dialogLabelId;
    h2.textContent = dialogLabel;
    const p = document.createElement("p");
    p.id = dialogDescriptionId;
    p.innerText = dialogDescription;
    const buttonContainer = document.createElement("p");
    const button = document.createElement("button");
    button.type = "button";
    button.autofocus = true;
    button.textContent = "Confirm & Delete";
    button.addEventListener("click", () => {
        closeAndRemoveDialog(dialog);
    });
    button.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeAndRemoveDialog(dialog);
    });
    buttonContainer.appendChild(button);
    dialog.appendChild(h2);
    dialog.appendChild(p);
    dialog.appendChild(buttonContainer);
    return dialog;
};
