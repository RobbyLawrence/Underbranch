const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const os = require("os");
const { exec } = require("child_process");
const path = require("path");

const app = express();
const PORT = 3002;

// Serve static files if needed
app.use("/compile", express.static(path.join(__dirname)));

// Parse JSON bodies
app.use(bodyParser.json());

function cleanupDir(dir) {
    try {
        // Node 14+ supports rmSync; fall back to rmdirSync if necessary
        if (fs.rmSync) {
            fs.rmSync(dir, { recursive: true, force: true });
        } else {
            fs.rmdirSync(dir, { recursive: true });
        }
    } catch (e) {
        console.warn("Failed to cleanup temp dir", dir, e.message || e);
    }
}

// POST /compile, compile LaTeX in an isolated temporary directory
app.post("/compile", (req, res) => {
    const latexCode = req.body.latex;
    if (!latexCode) {
        return res.status(400).send("No LaTeX code provided");
    }

    // Create a temporary directory for this compile request
    const tmpBase = os.tmpdir();
    let tmpDir;
    try {
        tmpDir = fs.mkdtempSync(path.join(tmpBase, "ub-"));
    } catch (e) {
        console.error("Failed to create temp dir", e);
        return res.status(500).send("Server error");
    }

    const texFile = path.join(tmpDir, "document.tex");
    try {
        fs.writeFileSync(texFile, latexCode);
    } catch (e) {
        console.error("Failed to write tex file", e);
        cleanupDir(tmpDir);
        return res.status(500).send("Server error");
    }

    // Run pdflatex inside the temp directory to avoid collisions between
    // concurrent requests and between different rooms/users.
    exec(
        `pdflatex -interaction=nonstopmode -halt-on-error document.tex`,
        { cwd: tmpDir, timeout: 60_000 },
        (error, stdout, stderr) => {
            if (error) {
                console.error("pdflatex failed:", stderr || stdout || error.message);
                // Return stderr if available to aid debugging
                const message = (stderr && stderr.toString()) || "Compilation failed";
                cleanupDir(tmpDir);
                return res.status(500).send(message);
            }

            const pdfFile = path.join(tmpDir, "document.pdf");
            if (!fs.existsSync(pdfFile)) {
                cleanupDir(tmpDir);
                return res.status(500).send("PDF not generated");
            }

            res.setHeader("Content-Type", "application/pdf");
            const stream = fs.createReadStream(pdfFile);
            stream.pipe(res);

            // Cleanup after the response has finished sending
            const cleanup = () => cleanupDir(tmpDir);
            stream.on("end", cleanup);
            stream.on("close", cleanup);
            stream.on("error", (err) => {
                console.error("Stream error sending PDF", err);
                cleanup();
            });
        },
    );
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
