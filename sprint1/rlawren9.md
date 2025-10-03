# Sprint 1 Review

This sprint went well! Matthew and I got an early start to the sprint, and both wrote a lot of code on the first day that the sprint started.

I mostly worked on the signin page during the first sprint. I prototyped the Google sign-in with a basic page with a single button that interfaced with Google Cloud. After a while, I moved this code and added styling to the page. Using the Google API stumped me for a while, but I eventually figured it out.

I also set up the MySQL database, underbranch_auth, and the users table that tracks all the users.

## Issues
The issues that I worked on were:
- #12 Google API
- #10 Sign-in Page styling
- #9 Sign-in Page

In the future, I'm going to be working on #13 LaTeX Compilation and #11 Forgot Password.

## Files
I spent most of the sprint extending my HelloPlus project into the signin page, so I'm responsible for everything in the Underbranch/signin/ directory.
Files:
- Underbranch/signin/users/index.html
- Underbranch/signin/.env
- Underbranch/signin/index.html
- Underbranch/signin/server.js

## AI
I used AI for help with most of the HTML, as well as some of the JavaScript. I tried to get help from AI with some of the nginx config, but ended up having to revert all changes. Never trust AI with something important!

## Accomplishments
After everything was said and done, I've implemented a way for users to create accounts and log into said accounts. Each account and login is recorded in the MySQL database. I also added passwords; we use bcryptjs for password hashing so we aren't directly storing passwords. The MySQL database underbranch_auth and users table therein are fully up and running. I also created a subdirectory, Underbranch/signin/users/ that contains an index.html that acts as an interface for the API the other files are using. Eventually, I'll remove this, but it was nice for testing.
