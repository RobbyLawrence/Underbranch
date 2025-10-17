# Sprint 2

- Name: Paul Davis
- Github ID: pau1davis
- Group: Underbranch

### What you planned to do
* Fix editor loading error. [Issue #24](https://github.com/RobbyLawrence/Underbranch/issues/24)
* Add logo. [Issue #28](https://github.com/RobbyLawrence/Underbranch/issues/28)
* Add Monaco styling. [Issue #29](https://github.com/RobbyLawrence/Underbranch/issues/29)

### What you did not do
* Again, we met all sprint goals so I will include goals for sprint 3.
* Merge the collaborative editing feature with main branch.
* Add LaTeX compilation to main branch.
* Visual enhancements, cleanup.
### What problems you encountered
In this sprint, I had a hard time debugging the loading error. Since my changes were server side, there wasn't a good way to check the changes without pushing changes directly throught nginx, which we would like to keep to a miniumum.

### Issues you worked on
* [Editor Loading Error #24](https://github.com/RobbyLawrence/Underbranch/issues/24)
* [Add Logo #28](https://github.com/RobbyLawrence/Underbranch/issues/28)
* [Add Monaco Styling #29](https://github.com/RobbyLawrence/Underbranch/issues/29)

### Files you worked on
* Underbranch/production-server/server.js
* Underbranch/editor/index.html
* Underbranch/editor/src/LaTeXEditor.js

### Use of AI and/or 3rd party software
I didn't use AI much for this sprint. For debugging, AI is good at spotting bugs, but not fixing them. I already knew where the loading error was, so it didn't help me much on finding bugs. However, I did use it to help me make basic stylistic changes to the Monaco editor.
### What you accomplished
For this sprint, I mostly focused on maintenance. I fixed server side bugs that were introduced by other commits. I also added the logo to our website as well as visual changes to the Monaco editor. Our to-do list was underwhelming, as we made substantial progress in sprint 1.