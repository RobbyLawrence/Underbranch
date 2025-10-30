# Sprint 3 Review

This sprint went well. I focused on a few features, and wasn't able to accomplish as much as I wanted due to issues with the web server.

## Issues
I worked on the following issues:
- #13 LaTeX Compilation
- #11 Forgot Password
- #35 LaTeX Editor PDF Frame/Compilation

## Files
I focused my efforts on fixing the errors somehow propagated from nodemailer, adding a PDF frame and allowing the editor to make compile requests through a "Compile PDF" button, and fixing the web server.
Files:
 - Underbranch/signin/server.js
 - nginx-conf (which is really just a symlink to the actual nginx config on the XPS web server)
 - Underbranch/editor/src/App.js
 - Underbranch/editor/src/Toolbar.js

 ## AI Usage
 I had to do near everything by hand in this sprint. I don't just AI to get anywhere near the nginx-conf anymore. I did have to research how to create elements and handlers in React, though.

 ## Accomplishments
 During this sprint, I fixed nodemailer and added a button to compile the PDF on the website, as well a button to download said PDF.
