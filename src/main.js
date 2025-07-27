import Storehouse from "storehouse-js";
import * as monaco from "monaco-editor";
import { marked } from "marked";
import DOMPurify from "dompurify";
// import "github-markdown-css";

const init = () => {
    let hasEdited = false;
    let scrollBarSync = false;

    const localStorageNamespace = "com.markdownlivepreview";
    const localStorageKey = "last_state";
    const localStorageScrollBarKey = "scroll_bar_settings";
    const confirmationMessage =
        "Are you sure you want to reset? Your changes will be lost.";
    // default template
    const defaultInput = `# Markdown syntax guide

## Headers

# This is a Heading h1
## This is a Heading h2
###### This is a Heading h6

## Emphasis

*This text will be italic*  
_This will also be italic_

**This text will be bold**  
__This will also be bold__

_You **can** combine them_

## Lists

### Unordered

* Item 1
* Item 2
* Item 2a
* Item 2b
    * Item 3a
    * Item 3b

### Ordered

1. Item 1
2. Item 2
3. Item 3
    1. Item 3a
    2. Item 3b

## Images

![This is an alt text.](/image/sample.webp "This is a sample image.")

## Links

You may be using [Markdown Live Preview](https://markdownlivepreview.com/).

## Blockquotes

> Markdown is a lightweight markup language with plain-text-formatting syntax, created in 2004 by John Gruber with Aaron Swartz.
>
>> Markdown is often used to format readme files, for writing messages in online discussion forums, and to create rich text using a plain text editor.

## Tables

| Left columns  | Right columns |
| ------------- |:-------------:|
| left foo      | right foo     |
| left bar      | right bar     |
| left baz      | right baz     |

## Blocks of code

${"`"}${"`"}${"`"}
let message = 'Hello world';
alert(message);
${"`"}${"`"}${"`"}

## Inline code

This web site is using ${"`"}markedjs/marked${"`"}.
`;

    self.MonacoEnvironment = {
        getWorker(_, label) {
            return new Proxy({}, { get: () => () => { } });
        },
    };

    let setupEditor = () => {
        let editor = monaco.editor.create(document.querySelector("#editor"), {
            fontSize: 14,
            language: "markdown",
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            scrollbar: {
                vertical: "visible",
                horizontal: "visible",
            },
            wordWrap: "on",
            hover: { enabled: false },
            quickSuggestions: true,
            suggestOnTriggerCharacters: false,
            folding: true,
            formatOnPaste: true,
            theme: "vs-dark",
            lineNumbers: "on",
        });

        editor.onDidChangeModelContent(() => {
            let changed = editor.getValue() != defaultInput;
            if (changed) {
                hasEdited = true;
            }
            let value = editor.getValue();
            convert(value);
            saveLastContent(value);
        });

        editor.onDidScrollChange((e) => {
            if (!scrollBarSync) {
                return;
            }

            const scrollTop = e.scrollTop;
            const scrollHeight = e.scrollHeight;
            const height = editor.getLayoutInfo().height;

            const maxScrollTop = scrollHeight - height;
            const scrollRatio = scrollTop / maxScrollTop;

            let previewElement = document.querySelector("#preview");
            let targetY =
                (previewElement.scrollHeight - previewElement.clientHeight) *
                scrollRatio;
            previewElement.scrollTo(0, targetY);
        });

        return editor;
    };

    // Render markdown text as html
    let convert = (markdown) => {
        let options = {
            headerIds: false,
            mangle: false,
        };
        let html = marked.parse(markdown, options);
        let sanitized = DOMPurify.sanitize(html);
        document.querySelector("#output").innerHTML = sanitized;
    };

    // Reset input text
    let reset = () => {
        let changed = editor.getValue() != defaultInput;
        if (hasEdited || changed) {
            var confirmed = window.confirm(confirmationMessage);
            if (!confirmed) {
                return;
            }
        }
        presetValue(defaultInput);
        document.querySelectorAll(".column").forEach((element) => {
            element.scrollTo({ top: 0 });
        });
    };

    let presetValue = (value) => {
        editor.setValue(value);
        editor.revealPosition({ lineNumber: 1, column: 1 });
        editor.focus();
        hasEdited = false;
    };

    // ----- sync scroll position -----

    let initScrollBarSync = (settings) => {
        let checkbox = document.querySelector("#sync-scroll-checkbox");
        checkbox.checked = settings;
        scrollBarSync = settings;

        checkbox.addEventListener("change", (event) => {
            let checked = event.currentTarget.checked;
            scrollBarSync = checked;
            saveScrollBarSettings(checked);
        });
    };

    let enableScrollBarSync = () => {
        scrollBarSync = true;
    };

    let disableScrollBarSync = () => {
        scrollBarSync = false;
    };

    // ----- clipboard utils -----

    let copyToClipboard = (text, successHandler, errorHandler) => {
        navigator.clipboard.writeText(text).then(
            () => {
                successHandler();
            },

            () => {
                errorHandler();
            }
        );
    };

    let notifyCopied = () => {
        let labelElement = document.querySelector("#copy-button a");
        labelElement.innerHTML = "Copied!";
        setTimeout(() => {
            labelElement.innerHTML = "Copy";
        }, 1000);
    };

    // ----- setup -----

    // setup navigation actions
    let setupResetButton = () => {
        document
            .querySelector("#reset-button")
            .addEventListener("click", (event) => {
                event.preventDefault();
                reset();
            });
    };

    let setupCopyButton = (editor) => {
        document
            .querySelector("#copy-button")
            .addEventListener("click", (event) => {
                event.preventDefault();
                let value = editor.getValue();
                copyToClipboard(
                    value,
                    () => {
                        notifyCopied();
                    },
                    () => {
                        // nothing to do
                    }
                );
            });
    };

    let setupDownloadPdfButton = () => {
        document
            .querySelector("#download-pdf-button")
            .addEventListener("click", (event) => {
                const preview = document.querySelector("#output");
                if (!preview || !preview.innerHTML.trim()) {
                    alert("Nothing to download. Please enter some markdown first.");
                    return;
                }
                // Let the user choose PDF options
                const now = new Date();
                const pad = (n) => n.toString().padStart(2, "0");
                const formattedDate = `${now.getFullYear()}${pad(
                    now.getMonth() + 1
                )}${pad(now.getDate())}-${pad(now.getHours())}${pad(
                    now.getMinutes()
                )}${pad(now.getSeconds())}`;

                const opt = {
                    margin: 0.5,
                    filename: `markdown-preview-${formattedDate}.pdf`,
                    image: { type: "jpeg", quality: 0.98 },
                    html2canvas: { scale: 2 },
                    jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
                    pagebreak: { mode: ["avoid-all", "css", "legacy"] },
                };

                // Create dropdowns for margin and orientation
                let pdfOptionsDiv = document.createElement("div");
                pdfOptionsDiv.style.position = "fixed";
                pdfOptionsDiv.style.top = "50%";
                pdfOptionsDiv.style.left = "50%";
                pdfOptionsDiv.style.transform = "translate(-50%, -50%)";
                pdfOptionsDiv.style.background = "#fff";
                pdfOptionsDiv.style.padding = "20px";
                pdfOptionsDiv.style.border = "1px solid #ccc";
                pdfOptionsDiv.style.zIndex = "10000";
                pdfOptionsDiv.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
                pdfOptionsDiv.innerHTML = `
            <label> Prefix filename:
            <input id="pdf-prefix" type="text" value="markdown-preview" />
            </label>
            <label>
            Margin (inches):
            <input id="pdf-margin" type="number" min="0.25" step="0.05" value="0.5" />
            </label>
            <br/><br/>
            <label>
            Orientation:
            <select id="pdf-orientation">
                <option value="portrait" selected>Portrait</option>
                <option value="landscape">Landscape</option>
            </select>
            </label>
            <br/><br/>
            <button id="pdf-ok">OK</button>
            <button id="pdf-cancel">Cancel</button>
        `;

                document.body.appendChild(pdfOptionsDiv);

                return new Promise((resolve, reject) => {
                    document.getElementById("pdf-ok").onclick = () => {
                        const margin = parseFloat(
                            document.getElementById("pdf-margin").value
                        );

                        const orientation =
                            document.getElementById("pdf-orientation").value;

                        const prefix = document.getElementById("pdf-prefix").value;

                        document.body.removeChild(pdfOptionsDiv);

                        resolve({ margin, orientation, prefix });
                        console.log("PDF options form above:", opt);
                    };
                    document.getElementById("pdf-cancel").onclick = () => {
                        document.body.removeChild(pdfOptionsDiv);
                        reject();
                    };
                })
                    .then(({ margin, orientation, prefix }) => {
                        opt.filename = `${prefix}-${formattedDate}.pdf`;
                        if (orientation === "portrait" || orientation === "landscape") {
                            opt.jsPDF.orientation = orientation;
                        }
                        if (!isNaN(margin) && margin >= 0) {
                            opt.margin = margin;
                        }
                        console.log("PDF options:", opt); // Debugging
                        window.html2pdf().set(opt).from(preview).save()
                    })
                    .catch(() => {
                        // alert("PDF generation cancelled.");
                        // Cancelled, do nothing
                    });
            });
    };

    // ----- local state -----

    let loadLastContent = () => {
        let lastContent = Storehouse.getItem(
            localStorageNamespace,
            localStorageKey
        );
        return lastContent;
    };

    let saveLastContent = (content) => {
        let expiredAt = new Date(2099, 1, 1);
        Storehouse.setItem(
            localStorageNamespace,
            localStorageKey,
            content,
            expiredAt
        );
    };

    let loadScrollBarSettings = () => {
        let lastContent = Storehouse.getItem(
            localStorageNamespace,
            localStorageScrollBarKey
        );
        return lastContent;
    };

    let saveScrollBarSettings = (settings) => {
        let expiredAt = new Date(2099, 1, 1);
        Storehouse.setItem(
            localStorageNamespace,
            localStorageScrollBarKey,
            settings,
            expiredAt
        );
    };

    let setupDivider = () => {
        let lastLeftRatio = 0.5;
        const divider = document.getElementById("split-divider");
        const leftPane = document.getElementById("edit");
        const rightPane = document.getElementById("preview");
        const container = document.getElementById("container");

        let isDragging = false;

        divider.addEventListener("mouseenter", () => {
            divider.classList.add("hover");
        });

        divider.addEventListener("mouseleave", () => {
            if (!isDragging) {
                divider.classList.remove("hover");
            }
        });

        divider.addEventListener("mousedown", () => {
            isDragging = true;
            divider.classList.add("active");
            document.body.style.cursor = "col-resize";
        });

        divider.addEventListener("dblclick", () => {
            const containerRect = container.getBoundingClientRect();
            const totalWidth = containerRect.width;
            const dividerWidth = divider.offsetWidth;
            const halfWidth = (totalWidth - dividerWidth) / 2;

            leftPane.style.width = halfWidth + "px";
            rightPane.style.width = halfWidth + "px";
        });

        document.addEventListener("mousemove", (e) => {
            if (!isDragging) return;
            document.body.style.userSelect = "none";
            const containerRect = container.getBoundingClientRect();
            const totalWidth = containerRect.width;
            const offsetX = e.clientX - containerRect.left;
            const dividerWidth = divider.offsetWidth;

            // Prevent overlap or out-of-bounds
            const minWidth = 100;
            const maxWidth = totalWidth - minWidth - dividerWidth;
            const leftWidth = Math.max(minWidth, Math.min(offsetX, maxWidth));
            leftPane.style.width = leftWidth + "px";
            rightPane.style.width = totalWidth - leftWidth - dividerWidth + "px";
            lastLeftRatio = leftWidth / (totalWidth - dividerWidth);
        });

        document.addEventListener("mouseup", () => {
            if (isDragging) {
                isDragging = false;
                divider.classList.remove("active");
                divider.classList.remove("hover");
                document.body.style.cursor = "default";
                document.body.style.userSelect = "";
            }
        });

        window.addEventListener("resize", () => {
            const containerRect = container.getBoundingClientRect();
            const totalWidth = containerRect.width;
            const dividerWidth = divider.offsetWidth;
            const availableWidth = totalWidth - dividerWidth;

            const newLeft = availableWidth * lastLeftRatio;
            const newRight = availableWidth * (1 - lastLeftRatio);

            leftPane.style.width = newLeft + "px";
            rightPane.style.width = newRight + "px";
        });
    };

    // ----- entry point -----
    let lastContent = loadLastContent();
    let editor = setupEditor();
    if (lastContent) {
        presetValue(lastContent);
    } else {
        presetValue(defaultInput);
    }
    setupResetButton();
    setupCopyButton(editor);
    setupDownloadPdfButton();

    let scrollBarSettings = loadScrollBarSettings() || false;
    initScrollBarSync(scrollBarSettings);

    setupDivider();
};

window.addEventListener("load", () => {
    init();
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.querySelector("#theme-toggle a").innerHTML = "🌚 Theme";
        document.querySelector("#code-theme-toggle a").innerHTML = "🌚 Code";
        monaco.editor.setTheme("vs-dark");
    } else {
        document.querySelector("#theme-toggle a").innerHTML = "🌞 Theme";
        document.querySelector("#code-theme-toggle a").innerHTML = "🌞 Code";

        monaco.editor.setTheme("vs");
    }
    document
        .querySelector("#code-theme-toggle")
        .addEventListener("click", (event) => {
            event.preventDefault();
            if (
                document.querySelector("#code-theme-toggle a").innerHTML === "🌞 Code"
            ) {
                document.querySelector("#code-theme-toggle a").innerHTML = "🌚 Code";
                monaco.editor.setTheme("vs-dark");
            } else {
                document.querySelector("#code-theme-toggle a").innerHTML = "🌞 Code";
                monaco.editor.setTheme("vs");
            }
        });
    document.querySelector("#theme-toggle").addEventListener("click", (event) => {
        event.preventDefault();
        if (document.querySelector("#theme-toggle a").innerHTML === "🌞 Theme") {
            document.querySelector("#theme-toggle a").innerHTML = "🌚 Theme";
            document.querySelector("#code-theme-toggle a").innerHTML = "🌚 Code";
            monaco.editor.setTheme("vs-dark");
            document.querySelector("#markdown-theme").href =
                "/css/github-markdown-dark.css";
        } else {
            document.querySelector("#theme-toggle a").innerHTML = "🌞 Theme";
            document.querySelector("#code-theme-toggle a").innerHTML = "🌞 Code";
            monaco.editor.setTheme("vs");
            document.querySelector("#markdown-theme").href =
                "/css/github-markdown-light.css";
        }
    });
});
