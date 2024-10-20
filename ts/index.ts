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
        });
    }
}
