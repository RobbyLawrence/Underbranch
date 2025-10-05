const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const { exec } = require("child_process");
const path = require("path");

const app = express();
const PORT = 3002;

// Serve static frontend files from the compile/ directory
app.use("/compile", express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname)));

// Parse JSON requests
app.use(bodyParser.json());

// POST to both /compile and /compile/ — compile LaTeX into PDF
app.post(["/compile", "/compile/"], (req, res) => {
    const latexCode = req.body.latex;
    if (!latexCode) {
        return res.status(400).send("No LaTeX code provided");
    }

    const texFile = "document.tex";
    fs.writeFileSync(texFile, latexCode);

    exec(
        `pdflatex -interaction=nonstopmode -halt-on-error ${texFile}`,
        (error, stdout, stderr) => {
            if (error) {
                console.error(stderr);
                return res.status(500).send("Compilation failed");
            }

            const pdfFile = "document.pdf";
            if (!fs.existsSync(pdfFile)) {
                return res.status(500).send("PDF not generated");
            }

            res.setHeader("Content-Type", "application/pdf");
            fs.createReadStream(pdfFile).pipe(res);
        },
    );
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
