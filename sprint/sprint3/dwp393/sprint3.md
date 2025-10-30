# Sprint 3

Matthew Ferrari
ferrari334
Underbranch

### What you planned to do
(Give a short bulleted list of the items you planned to do for this sprint. Include the github issue number and link to the issue)
- implement auto completion for keywords. Issue [30][https://github.com/RobbyLawrence/Underbranch/issues/30]
- Create homepage that has home button and past projects worked on. Issue [32][https://github.com/RobbyLawrence/Underbranch/issues/32]
- Find auto complete library to replace manual keyword autocomplete. Issue [31][https://github.com/RobbyLawrence/Underbranch/issues/31]

### What you did not do
(Give a short bulleted list of the items that you planned to do, but did not accomplish)
- I was not successful in making a funtioning homepage and finding a library that supports tex keyword autocompletion.

### What problems you encountered
(List the problems you encountered)
- To make a home page we need to implement the database with the homepage to output the users name and projects. For google auth users this will be different since their information is stored in the Google api.
- I was not able to complete the autocomplete for all keywords but I found some promising libraries that may have lists of all the keywords so I can implement that into an array and semi-manually have autocompletion that doesn't rely on a provider.

### Issues you worked on
(List the specific github issues that you worked on with a link to the issue (ex: [#1](https://github.com/utk-cs340-fall22/ClassInfo/issues/1) Sample Issue)
[30](https://github.com/RobbyLawrence/Underbranch/issues/30)
[31](https://github.com/RobbyLawrence/Underbranch/issues/31)
[32](https://github.com/RobbyLawrence/Underbranch/issues/32)

### Files you worked on
(Give a bulleted list of the files in your github repo that you worked on. Give the full pathname.)
- Underbranch/editor/src/LaTeXEditor.js
- Underbranch/dist/bundle.js

### Use of AI and/or 3rd party software
(Explain how you used AI (if at all) in this sprint. Also list any 3rd party code or tools used in this sprint)
- AI helped me get the bugs out of my autocomplete logic and helped me structure the new function to properly have autocomplete for the keywords array

### What you accomplished
(Give a description of the features you added or tasks you accomplished. Provide some detail here. This section will be a little longer than the bulleted lists above)
- I successfully added autocompletion to a list of keywords in the .tex language. This doesn't cover all keywords so I will want to import a library of some sort to ensure every user has access to the full langugage suggestions.
