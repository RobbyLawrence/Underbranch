# Sprint 2
Aaron C Brown, A-aronCBrown, Overleaf Clone

## What you planned to do
- For this sprint, I planned to expand upon the collaborative features which I had implemented during the last sprint. Specifically, I planned to allow for users to collaborate in the same "rooms" as the people they want to work with in order to introduce privacy, organization, and accesibility into the LaTex editor.
- I also planned to allow people to lock access to their rooms behind a password. This way, I can introduce security into the frontend editor.
- Lastly, I planned to take these changes from the local host and push them onto our cloudflare server / website so that anyone can use the collaborative features just by accessing the website.

## What you did not do
- I was unable to get these changes pushed to the cloudflare server / the underbranch website although they are fully functional and reproducable on local host.

## What problems you encountered
- Lack of understanding of web sockets
- Lack of understanding of existing infrastructure
- Lack of time
- managing time alotted to work, this project, extra-curriculars, etc.

## Issues you worked on
- Naming - [issue 18 - naming](https://github.com/RobbyLawrence/Underbranch/issues/18)
- Room Connections - [issue 17 - room connections](https://github.com/RobbyLawrence/Underbranch/issues/17)
- Complete LaTex Editor - [issue 25 - Complete LaTex Editor](https://github.com/RobbyLawrence/Underbranch/issues/25)

## Files you worked on
Collaboration Branch:
- **frontend/editor/dev-server.js**
- frontend/editor/index.html
- frontend/editor/package.json
- frontend/editor/package-lock.json
- **frontend/editor/src/collaborative.js**

## Use of AI and/or 3rd party software
I used Github copilot to handle high-level production and deployment of the collaborative services used on Underbranch. I would often go into the side chat bar and say "explain how web sockets work" or "Change the color of this element" or "create a script to get every part running", etc. Github Copilot, I find, is really quite useful for this type of project because it gives the user the ability to add context to their queries. For example, I might say "look at file (X) and use it as a framework for how to go about implementing file (Y)".

## What you accomplished
I was very successful in expanding upon what I was able to achieve in the first sprint! Mainly, my task was to take what was created in the first sprint and make it even more professional and useful for an end user. Specifically, this idea manifested itself as changes made to the frontend LaTex editor in the form of "room services" and password protection.
Basically, my two main accomplishments of this sprint were
- Allowing two people who want to collaborate to do so by letting people set up rooms where people in the same rooms will see the same LaTex code
- Implementing password protection for these rooms such that no one will be able to join a previously-initialized room that does not belong to them
These two main features are wildly helpful to the group project overall as it allows for my teammates to run tests on the LaTex editor simultaneously without disturbing each other.