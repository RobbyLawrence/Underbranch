# Sprint 2 Review

This sprint went moderately well. Most of the work I got done was during through a few massive pushes; although this worked for the past sprint, I didn't enjoy this, and would much prefer an iterative approach.

## Issues
I worked on the following issues:
- #13 LaTeX Compilation
- #11 Forgot Password

## Files
I mostly worked on the compilation server and "Forgot Password?" button for the past sprint. I developed the backend for our editor, found at Underbranch/compile/server.js. This works by accepting a JSON body of LaTeX code and sending back the compiled pdf as the HTTP response. I also created a small index.html to test it. The work on the "Forgot Password?" button consisted of modifying Underbranch/signin/index.html and Underbranch/signin/server.js.
Files:
- Underbranch/compile/server.js
- Underbranch/compile/index.html
- Underbranch/signin/server.js
- Underbranch/signin/index.html

## AI Usage
I was attempting to use AI to help with the LaTeX compilation side of things, but it wasn't working well at all. The model kept getting caught up on things that didn't matter and making breaking changes. In the end, I took a piece of AI-generated code that I knew worked and expanded it into what we have now. I had a similar process for the Forgot Password? button since the model wasn't comfortable with the nodemailer library, but eventually things got sorted out.

## Accomplishments
During this sprint, I wrote the backend of the compilation server, and created a test frontend to display. I ensured that the backend is protected against the majority of potential attacks that can exist within LaTeX code (that is, users can't perform arbitrary code execution). I also fixed the Forgot Password? button so that it actually sends the user's email a link to reset the password.
