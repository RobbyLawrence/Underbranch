# Sprint 2

## Matthew Ferrari
### dwp393
### Underbranch


### What you planned to do
(Give a short bulleted list of the items you planned to do for this sprint. Include the github issue number and link to the issue)
- Add autocomplete for keywords like '\begin'. Issue number 22: [https://github.com/RobbyLawrence/Underbranch/issues/22]
- Restructured directories and fixes all paths in code that used frontend bundle files. Issue number 21: [https://github.com/RobbyLawrence/Underbranch/issues/21]
* I planned to add functionality that allows the user to select a keyword and when selected the appropirate closing brace will be added after the command.


### What you did not do
(Give a short bulleted list of the items that you planned to do, but did not accomplish)
- I didn't fully implement the autocomplete like I wanted to. I have a version working but not how I would prefer the autocomplete to function. I have autocomplete working
for the \begin keyword. I will look at libraries from monaco to see if they offer autocomplete.
- Didn't redirect and make webpage fluid. So I will plan on setting up redirects to go from home-> signin -> editor

### What problems you encountered
(List the problems you encountered)
- The code I have implemented should work for all keywords but the code does not work as intended.
- When deleting the fronend directory and rearranging the directories inside of frontend, I had some trouble getting localhost to work. I had to rearrance paths.


### Issues you worked on
(List the specific github issues that you worked on with a link to the issue (ex: [#1](https://github.com/utk-cs340-fall22/ClassInfo/issues/1) Sample Issue)
Issue 21 and 22
[#21]https://github.com/RobbyLawrence/Underbranch/issues/21

[#22]https://github.com/RobbyLawrence/Underbranch/issues/22


### Files you worked on
(Give a bulleted list of the files in your github repo that you worked on. Give the full pathname.)
* Underbranch/dist/bundle.js
* Underbranch/editor/src/LaTexEditor.js
* Underbranch/editor/server.js


### Use of AI and/or 3rd party software
(Explain how you used AI (if at all) in this sprint. Also list any 3rd party code or tools used in this sprint)
* I used AI to write the logic for autocompleting the \begin keyword.
* AI was used to ensure every pathname in the editor/src files had the correct linking path since frontend was deleted.
* AI was used to write the server.js for only using dependencies I needed.


### What you accomplished
(Give a description of the features you added or tasks you accomplished. Provide some detail here. This section will be a little longer than the bulleted lists above)
(include your name, github id, and group name here)
1. Matthew Ferrari, ferrari334, Underbranch. During this sprint we had a lot of directories and files that were building on each other but were not essential to the program. I took the uneeded files and directories, and either deleted them or re-structured them. This made our codebase cleaner and reduce redundancy.
2. The largest thing I worked on was the implementation of autocomplete for keywords in the editor. This was a troubling issue because all my resources led me to believe my logic should work and when a user types '\be' in the editor, a suggestion begin will popup and direct the user inside a pair of curly braces after the \begin. It autocompletes to \begin but doesn't put in the curly braces. When the user types an opening curly brace and enters a suggested input inside the curly brace, the brace closes and an \end{} tag is entered two lines below. So this process half works, and I am usure as to what the bug is in the logic within latexEditor.js
3.
