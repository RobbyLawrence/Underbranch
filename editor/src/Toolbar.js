const Toolbar = ({
    viewMode,
    onViewModeChange,
    latexCode,
    onCompile,
    pdfUrl,
    theme,
    onToggleTheme,
}) => {
    const handleDownload = () => {
        const blob = new Blob([latexCode], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "document.tex";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    // handler for downloading the pdf
    const handleDownloadPDF = () => {
        if (!pdfUrl) {
            alert("No compiled PDF available. Please compile first.");
            return;
        }

        const a = document.createElement("a");
        a.href = pdfUrl;
        a.download = "document.pdf";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleClear = () => {
        if (confirm("Are you sure you want to clear the editor?")) {
            onViewModeChange("editor");
            // This will be handled by the parent component
            const event = new CustomEvent("clearEditor");
            window.dispatchEvent(event);
        }
    };

    // Debug helpers - log button clicks
    const handleViewClick = (mode) => {
        console.log("[Toolbar] button click ->", mode);
        onViewModeChange(mode);
    };

    return React.createElement(
        "div",
        { className: "toolbar" },
        React.createElement("h1", null, "LaTeX Editor"),
        React.createElement(
            "div",
            { className: "toolbar-buttons" },
            React.createElement(
                "button",
                {
                    className: `btn ${viewMode === "editor" ? "btn-primary" : "btn-secondary"}`,
                    onClick: () => handleViewClick("editor"),
                },
                "Editor",
            ),
            React.createElement(
                "button",
                {
                    className: `btn ${viewMode === "split" ? "btn-primary" : "btn-secondary"}`,
                    onClick: () => handleViewClick("split"),
                },
                "Split",
            ),
            React.createElement(
                "button",
                {
                    className: `btn ${viewMode === "preview" ? "btn-primary" : "btn-secondary"}`,
                    onClick: () => handleViewClick("preview"),
                },
                "Preview",
            ),
            
            React.createElement(
                "button",
                {
                    className: "btn btn-secondary",
                    onClick: handleDownload,
                },
                "Download .tex File",
            ),
            // add button for compilation
            React.createElement(
                "button",
                {
                    className: "btn btn-primary",
                    onClick: onCompile,
                },
                "Compile to PDF",
            ),
            React.createElement(
                "button",
                {
                    className: "btn btn-secondary",
                    onClick: handleDownloadPDF,
                    // button will start disabled since you don't
                    // want to download a pdf that doesn't exist
                    disabled: !pdfUrl,
                },
                "Download PDF",
            ),
            React.createElement(
                "button",
                {
                    className: "btn btn-secondary",
                    onClick: handleClear,
                },
                "Clear",
            ),
            React.createElement(
                "button",
                {
                    className: `btn ${theme === "dark" ? "btn-primary" : "btn-secondary"}`,
                    onClick: onToggleTheme,
                    title: "Toggle light/dark theme",
                },
                theme === "dark" ? "Light" : "Dark",
            ),
        ),
    );
};

export default Toolbar;
