// server.js

const express = require("express");
const fs = require("fs");
const fsp = require("fs").promises;
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");

const app = express();
const PORT = 3002;

app.use(express.json({ limit: "200kb" }));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

function runPdflatex(dir) {
    return new Promise((resolve, reject) => {
        const proc = spawn(
            "pdflatex",
            [
                "-interaction=nonstopmode",
                "-halt-on-error",
                "-no-shell-escape",
                "document.tex",
            ],
            { cwd: dir },
        );

        proc.on("error", reject);
        proc.on("close", (code) => resolve(code));
    });
}

app.post("/compile", async (req, res) => {
    const latex = req.body.latex;
    if (typeof latex !== "string") {
        return res.status(400).json({ error: "Missing LaTeX source" });
    }

    let tmpDir;
    try {
        tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), "latex-"));
        const texPath = path.join(tmpDir, "document.tex");
        await fsp.writeFile(texPath, latex, "utf8");

        const code1 = await runPdflatex(tmpDir);
        if (code1 !== 0) {
            return res
                .status(400)
                .json({ error: "pdflatex failed (first run)" });
        }
        const code2 = await runPdflatex(tmpDir);
        if (code2 !== 0) {
            return res
                .status(400)
                .json({ error: "pdflatex failed (second run)" });
        }

        const pdfPath = path.join(tmpDir, "document.pdf");
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", 'inline; filename="document.pdf"');
        const stream = fs.createReadStream(pdfPath);
        stream.pipe(res);

        const cleanup = async () => {
            try {
                await fsp.rm(tmpDir, { recursive: true, force: true });
            } catch {}
        };
        stream.on("close", cleanup);
        stream.on("end", cleanup);
        stream.on("error", cleanup);
    } catch (err) {
        if (tmpDir) {
            try {
                await fsp.rm(tmpDir, { recursive: true, force: true });
            } catch {}
        }
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
