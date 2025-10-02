# Sprint 1

## Matthew Ferrari
### dwp393
# Underbranch

### What you planned to do
(Give a short bulleted list of the items you planned to do for this sprint. Include the github issue number and link to the issue)
* Create frontend editor that allows for real time compilation and .tex language support. 
* Monaco text editor and language integration. 
[issue_syn] https://github.com/RobbyLawrence/Underbranch/issues/4#issue-3478180466

### What you did not do
(Give a short bulleted list of the items that you planned to do, but did not accomplish)
- add "\end{}" tag whenever "\begin{}" tag is opened.
- change real time compile to button pressed compile. Toggle option for button or real-time.
- Forward "underbranch.org" to sign in page. When sign in page validates, forward to homepage that needs to be made.


### What problems you encountered
(List the problems you encountered)
- AI made some non sense code that i adjusted and it ended up biting my tail. The AI made a file in a directory chain that I didn't think it was necessary. Well that file was being written to from another file causing the file to not load on localhost. So figuring that out took a lot of time. 
- React learning curve: I don't know react well. I have used it breifly before, there is a lot of new syntax so understanding what i'm looking at 
takes some adjusting. 
- I had trouble learning how NODEJS works with our team, specifically the helloplus assignment where we were
making code, but there were multiple server.js files. 
- Monaco editor: I had trouble implementing monaco and using it to understand tex code and have a friendly editor. 

### Issues you worked on
(List the specific github issues that you worked on with a link to the issue (ex: [#1](https://github.com/utk-cs340-fall22/ClassInfo/issues/1) Sample Issue)
- I did not use the issues feature on github, I will make sure to use it more for sprint 2. 
- I had trouble with setting up all the servers, setting up a working state of node, react, localhost. Once I was able to set all that up, I could 
work pretty well on the editor.

### Files you worked on
(Give a bulleted list of the files in your github repo that you worked on. Give the full pathname.)

- Underbranch/frontend/dist/bundle.js  This file is created by webpack and is the built output of the frontend application. 
- Underbranch/frontend/dist/bundle.js.map  This file is used for debugging. You see the source files like app.js, index.js instead of the bundled.js. 
Great for debugging. Without this, debugging bundle.js would be very hard. Cannot be seen when dev tool is turned off. 

- Underbranch/frontendend/editor/src/App.js : Main application component
- Underbranch/frontendend/editor/src/LaTexEditor.js : Monaco editor integration
- Underbranch/frontendend/editor/src/PreviewPane.js : LaTeX to html converter
- Underbranch/frontendend/editor/src/Toolbar.js     : Application toolbar component
- Underbranch/frontendend/editor/src/index.js       : Application entry point
- Underbranch/frontend/editor/index.html :  This is where the editor html page is. This takes elements from the src files and creates full editor
index.js       : Application entry point

### Use of AI and/or 3rd party software
(Explain how you used AI (if at all) in this sprint. Also list any 3rd party code or tools used in this sprint)
Claude Code was used in this project to layout a good boiler plate for a react web application. Claude code also was extremely helpful with implementing 
Monaco Library, Babel, and creating a layout for the editor. Claude helped inform me how to write react code and claude code did write most of the .jsx react code in the src files. 

### What you accomplished
(Give a description of the features you added or tasks you accomplished. Provide some detail here. This section will be a little longer than the bulleted lists above) 
I was able to create a visually appealing and working editor to pdf compiler. The editor has boilerplate code and buttons to view the editor, or preview the pdf, or split the screen to show both. The editor also allows downloading of 
files into .tex files and the ability to clear the page completely. The editor is made with React UI framework, Monaco Editor(Code editor that VS code uses), webpack5 which allows for module bundling, and Babel which translates .jsx(react js to normal .js). 
