// server.js
//hello world in computer font
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Hello World</title>
      <style>
        body {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background: #111;
          color: #0f0;
          font-family: monospace;
          font-size: 2rem;
        }
        #output {
          border-right: 2px solid #0f0;
          padding-right: 5px;
          white-space: pre;
          overflow: hidden;
        }
      </style>
    </head>
    <body>
      <div id="output"></div>
      <script>
        const text = "Hello, World!";
        let i = 0;
        function typeWriter() {
          if (i < text.length) {
            document.getElementById("output").textContent += text.charAt(i);
            i++;
            setTimeout(typeWriter, 150);
          }
        }
        typeWriter();
      </script>
    </body>
    </html>
  `);
});

const PORT = 3000;
server.listen(PORT, function() {
  console.log("Server running at http://localhost:" + PORT);
});
