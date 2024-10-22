import type { ColourMode, DateFormat, Day, DocumentName, ElementOrNull, InitialData, MarkdownDocument, Month, Year } from "./types.ts";

/**
 * Formats the initial data.
 * 
 * @returns The data with the correct properties and formats.
 */
const formatInitialData = (data: InitialData[]): MarkdownDocument[] | undefined => {
    const formattedData: MarkdownDocument[] = [];
    data.forEach((element, index) => {
        const { createdAt, name, content } = element;
        const formattedDate = createdAt.replace(/^(\d{2})-(\d{2})-(\d{4})$/, "$3-$1-$2") as DateFormat;
        formattedData.push({
            id: index + 1,
            name,
            content,
            createdAt: formattedDate,
        });
    });
    return formattedData;
}

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
 * Display the selected document.
 * 
 * @param app - The element containing the app form.
 * @param markdownDocument - The document to display.
 */
const displayDocument = (app: HTMLElement, markdownDocument: MarkdownDocument): void => {
    const documentNameInput: ElementOrNull<HTMLInputElement> = app.querySelector(`.app-bar input[type="text"]`);
    const markdown: ElementOrNull<HTMLElement> = app.querySelector("#editor #markdown");
    if (documentNameInput && markdown) {
        app.dataset.documentId = String(markdownDocument.id);
        documentNameInput.value = markdownDocument.name;
        documentNameInput.dataset.documentName = markdownDocument.name;
        markdown.textContent = markdownDocument.content;
    }
};

/**
 * Sets the current date.
 * 
 * @returns The date in YYYY-MM-DD format.
 */
const setDate = (): DateFormat => {
    const currentDate = new Date();
    const currentYear: Year = currentDate.getFullYear();
    const currentMonth = (currentDate.getMonth() + 1).toString(10).padStart(2, "0") as Month;
    const currentDay = (currentDate.getDate()).toString(10).padStart(2, "0") as Day;
    return `${currentYear}-${currentMonth}-${currentDay}`;
};

/**
 * Generates the `dialog` element.
 * 
 * @param documentId - The document ID to use.
 * @param documentName - The document name to use.
 * @returns The `dialog` element.
 */
export const generateDialog = (documentId: number, documentName: string): HTMLDialogElement => {
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
        deleteDocument(documentId);
        const sidebar = document.getElementById("sidebar");
        const updatedDocuments = getDocuments();
        if (sidebar && updatedDocuments) {
            setDocumentsList(sidebar, updatedDocuments);
            displayFirstDocument(sidebar);
        }
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

/**
 * Gets the mode choice.
 * 
 * @param modeChoice - The checkbox managing the mode choice.
 */
export const getMode = (modeChoice: HTMLInputElement) => {
    const mode = localStorage.getItem("mode");
    if (mode) {
        document.documentElement.dataset.mode = mode;
        modeChoice.checked = (mode === "light");
    }
};

/**
 * Sets the mode choice and saves it.
 * 
 * @param mode - The chosen mode.
 */
export const setMode = (mode: ColourMode): void => {
    document.documentElement.dataset.mode = mode;
    localStorage.setItem("mode", mode);
};

/**
 * Get the documents from localStorage.
 * 
 * @returns The documents.
 */
export const getDocuments = (): MarkdownDocument[] | null => {
    const storedDocuments = localStorage.getItem("documents");
    if (storedDocuments) return JSON.parse(storedDocuments);
    return null;
};

/**
 * Fetch the documents from the initial data.
 * 
 * @returns The documents or an error if the data could not be found.
 */
export const fetchDocuments = async (): Promise<MarkdownDocument[] | undefined> => {
    const response = await fetch("./data/data.json");
    if (response.status === 200 && response.ok) {
        const data: InitialData[] = await response.json();
        return formatInitialData(data);
    }
    console.error("The data could not be found.", response.status);
};

/**
 * Saves the updated documents into localStorage.
 * 
 * @param documents - The updated documents to save.
 */
export const saveDocuments = (documents: MarkdownDocument[]): void => {
    localStorage.setItem("documents", JSON.stringify(documents));
};

/**
 * Sets the documents list within the sidebar.
 * 
 * @param sidebar - The element containing the sidebar.
 * @param markdownDocuments - The documents to list within the sidebar.
 */
export const setDocumentsList = async (sidebar: HTMLElement, markdownDocuments: MarkdownDocument[]): Promise<void> => {
    sidebar.querySelector("ul")?.remove();
    if (markdownDocuments.length) {
        const ul = document.createElement("ul");
        for (const markdownDocument of markdownDocuments) {
            const { id, name, createdAt, updatedAt } = markdownDocument;
            const date = updatedAt ? updatedAt : createdAt;
            const dateFormatOptions: Intl.DateTimeFormatOptions = {
                year: "numeric",
                month: "long",
                day: "2-digit"
            };
            const li = document.createElement("li");
            const button = document.createElement("button");
            button.type = "button";
            button.dataset.documentId = String(id);
            button.dataset.documentName = name;
            button.addEventListener("click", () => {
                const app = document.getElementById("app");
                if (app) displayDocument(app, markdownDocument);
            });
            const time = document.createElement("time");
            time.dateTime = date;
            time.textContent = new Intl.DateTimeFormat("en-GB", dateFormatOptions).format(new Date(date));
            const documentName = document.createElement("span");
            documentName.className = "document-name";
            documentName.textContent = name;
            button.appendChild(time);
            button.appendChild(documentName);
            li.appendChild(button);
            ul.appendChild(li);
        }
        const form = sidebar.querySelector("form");
        if (form) {
            sidebar.insertBefore(ul, form);
        }
    }
};

/**
 * Displays the first document of the list within the sidebar triggering a click event.
 * 
 * @param sidebar - The element containing the sidebar.
 */
export const displayFirstDocument = (sidebar: HTMLElement): void => {
    sidebar.querySelector("li:first-child button")?.dispatchEvent(new MouseEvent("click"));
};

/**
 * Displays the last document of the list within the sidebar triggering a click event.
 * 
 * @param sidebar - The element containing the sidebar.
 */
export const displayLastDocument = (sidebar: HTMLElement): void => {
    sidebar.querySelector("li:last-child button")?.dispatchEvent(new MouseEvent("click"));
};

/**
 * Saves the changes on a document.
 * 
 * @param form - The form used.
 * @param documents - The documents with the one to update.
 */
export const saveChanges = (form: HTMLFormElement, documents: MarkdownDocument[]): void => {
    const documentId = form.dataset.documentId;
    if (documentId) {
        const findDocument = (document: MarkdownDocument): boolean => document.id === Number(documentId);
        const formData = new FormData(form);
        const markdown = form.querySelector("#markdown")?.textContent;
        const index = documents.findIndex(findDocument);
        const document = documents[index];
        if (document && index !== -1) {
            document.updatedAt = setDate();
            document.content = markdown ?? "";
            for (const [key, value] of formData.entries()) {
                if (key === "document-name") {
                    const documentName = (typeof value === "string") ? (value.endsWith(".md") ? value : `${value}.md`) : "untiltled-document.md";
                    document.name = documentName as DocumentName;
                }
            }
            saveDocuments(documents);
        }
    }
};

export const createDocument = (): void => {
    const documents = getDocuments();
    if (documents) {
        const lastId = Math.max(...documents.map(document => document.id));
        const newDocument: MarkdownDocument = {
            id: lastId + 1,
            name: "untitled-document.md",
            content: "",
            createdAt: setDate()
        };
        documents.push(newDocument);
        saveDocuments(documents);
    }
};

/**
 * Deletes the current document.
 * 
 * @param id - The ID of the document to delete.
 */
const deleteDocument = (id: number) => {
    const currentDocuments = getDocuments();
    const sidebar = document.getElementById("sidebar");
    if (currentDocuments && sidebar) {
        const filteredDocuments = currentDocuments.filter(document => document.id !== id);
        saveDocuments(filteredDocuments);
    }
}
