const Toolbar = ({ viewMode, onViewModeChange, latexCode, onCompile }) => {
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
                "Download",
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
                    onClick: handleClear,
                },
                "Clear",
            ),
        ),
    );
};

export default Toolbar;
