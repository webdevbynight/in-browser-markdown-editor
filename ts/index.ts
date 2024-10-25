import type { ColourMode, ElementOrNull } from "./types.ts";

import { createDocument, displayFirstDocument, displayLastDocument, displayPreview, fetchDocuments, generateDialog, getDocuments, getMode, isActive, saveChanges, saveDocuments, setDocumentsList, setMode, updateLabel } from "./utils.js";

const header = document.getElementById("header");
const main = document.querySelector("main");
const app = document.getElementById("app");
const editor = document.getElementById("editor");
const sidebar = document.getElementById("sidebar");
if (header && main && app && editor && sidebar) {
    // Slide the sidebar
    const menuButton: ElementOrNull<HTMLButtonElement> = header.querySelector("#header button");
    if (menuButton) {
        menuButton.addEventListener("click", function () {
            this.classList.toggle("active");
            header.classList.toggle("active-sidebar");
            main.classList.toggle("active-sidebar");
            const label = `${isActive(this) ? "Hide" : "Show"} sidebar`;
            updateLabel(this, label);
            if (isActive(this)) sidebar.focus();
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
            const documentId = Number(app.dataset.documentId);
            const documentNameInput = document.getElementById("document-name");
            if (documentId && documentNameInput) {
                const documentName = documentNameInput.dataset.documentName ?? "";
                const dialog = generateDialog(documentId, documentName);
                document.body.appendChild(dialog);
                dialog.showModal();
            }
        });
    }

    // Mode choice
    const modeChoice: ElementOrNull<HTMLInputElement> = sidebar.querySelector(`form input[type="checkbox"]`);
    if (modeChoice) {
        getMode(modeChoice);
        modeChoice.addEventListener("click", function () {
            const chosenMode: ColourMode = this.checked ? "light" : "dark";
            setMode(chosenMode);
        });
    }

    // Documents list (with saving in localStorage if necessary)
    const initialData = !getDocuments() ? await fetchDocuments() : null;
    if (initialData) saveDocuments(initialData);
    const documents = getDocuments();
    if (documents) {
        setDocumentsList(sidebar, documents);
        displayFirstDocument(sidebar);

        // Save changes
        app.addEventListener("submit", async function (e) {
            e.preventDefault();
            saveChanges(this as HTMLFormElement, documents);
            setDocumentsList(sidebar, documents);
        });
    }

    // New document
    const newDocumentButton: ElementOrNull<HTMLButtonElement> = sidebar.querySelector("p:first-of-type button");
    if (newDocumentButton) {
        newDocumentButton.addEventListener("click", () => {
            createDocument();
            const updatedDocuments = getDocuments();
            if (updatedDocuments) {
                setDocumentsList(sidebar, updatedDocuments);
                displayLastDocument(sidebar);
            }
        });
    }

    // Preview update
    const markdown = document.getElementById("markdown");
    const preview = document.getElementById("preview");
    if (markdown && preview) {
        markdown.addEventListener("input", function () {
            displayPreview(app, this.innerText);
        });
    }
}
