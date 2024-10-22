/**
 * Checks whether the `button` element has the `.active` class or not.
 * 
 * @param buttonElement - The `button` element to check.
 * @returns True if the element has the `.active` class, false otherwise.
 */
const isActive = (buttonElement: HTMLButtonElement): boolean => buttonElement.classList.contains("active");

/**
 * Updates the label of the button.
 * 
 * @param buttonElement - The `button` element to update.
 * @param label - The label to use for the update.
 */
const updateLabel = (buttonElement: HTMLButtonElement, label: string): void => {
    const textLabel = buttonElement.querySelector(".sr-only");
    if (textLabel) {
        buttonElement.title = label;
        textLabel.textContent = label;
    }
};

// Slide the sidebar
const header = document.getElementById("header");
const main = document.querySelector("main");
if (header && main) {
    const menuButton: HTMLButtonElement | null = header.querySelector("#header button");
    if (menuButton) {
        menuButton.addEventListener("click", function () {
            this.classList.toggle("active");
            header.classList.toggle("active-sidebar");
            main.classList.toggle("active-sidebar");
            const label = `${isActive(this) ? "Hide" : "Show"} sidebar`;
            updateLabel(this, label);
        });
    }
}

// Toggle preview
const app = document.getElementById("app");
const editor = document.getElementById("editor");
if (app && editor) {
    const togglePreviewButton: HTMLButtonElement | null = app.querySelector(".toggle-preview button");
    if (togglePreviewButton) {
        togglePreviewButton.addEventListener("click", function () {
            this.classList.toggle("active");
            editor.classList.toggle("active-preview");
            const label = `${isActive(this) ? "Reduce" : "Expand"} preview`;
            updateLabel(this, label);
        });
    }
}

// Show confirmation dialog before deleting
const deleteButton = app?.querySelector<HTMLButtonElement>(`button[type="button"][title="Delete"]`);
if (deleteButton) {
    deleteButton.addEventListener("click", () => {
        const documentNameInput = document.getElementById("document-name");
        if (documentNameInput) {
            const documentName = documentNameInput.dataset.documentName ?? "";
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
            document.body.appendChild(dialog);
            dialog.showModal();
        }
    });
}
