import type { ElementOrNull } from "./types.ts";
import { generateDialog, isActive, updateLabel } from "./utils.js";

const header = document.getElementById("header");
const main = document.querySelector("main");
const app = document.getElementById("app");
const editor = document.getElementById("editor");
if (header && main && app && editor) {
    // Slide the sidebar
    const menuButton: ElementOrNull<HTMLButtonElement> = header.querySelector("#header button");
    if (menuButton) {
        menuButton.addEventListener("click", function () {
            this.classList.toggle("active");
            header.classList.toggle("active-sidebar");
            main.classList.toggle("active-sidebar");
            const label = `${isActive(this) ? "Hide" : "Show"} sidebar`;
            updateLabel(this, label);
        });
    }

    // Toggle preview
    const togglePreviewButton: ElementOrNull<HTMLButtonElement> = app.querySelector(".toggle-preview button");
    if (togglePreviewButton) {
        togglePreviewButton.addEventListener("click", function () {
            this.classList.toggle("active");
            editor.classList.toggle("active-preview");
            const label = `${isActive(this) ? "Reduce" : "Expand"} preview`;
            updateLabel(this, label);
        });
    }

    // Show confirmation dialog before deleting
    const deleteButton = app.querySelector<HTMLButtonElement>(`button[type="button"][title="Delete"]`);
    if (deleteButton) {
        deleteButton.addEventListener("click", () => {
            const documentNameInput = document.getElementById("document-name");
            if (documentNameInput) {
                const documentName = documentNameInput.dataset.documentName ?? "";
                const dialog = generateDialog(documentName);
                document.body.appendChild(dialog);
                dialog.showModal();
            }
        });
    }
}
