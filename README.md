# Underbranch
A free-to-use web-based collaborative LaTeX editor and compiler.

## Github ID's
* Robby Lawrence - RobbyLawrence
* Matthew Ferrari - ferrari334
* Paul Davis - pau1davis
* Aaron Brown - A-aronCBrown
* Brett Dowling - Brett-Dowling


![Underbranch Logo](underbranch.png)

## How to Run/Description

LaTeX editor is fully online at www.underbranch.org/editor. Users can download either a .tex or .pdf file of the file they have edited in Underbranch. Users can compile their LaTeX document directly in the editor. Underbranch also allows for collaborative editing, meaning that users can join up in a room and write/edit the same document. Of course, users still have access to the download and compile options in a collaborative room.

## Self-Hosting
Hosting your own instance of Underbranch, while unnecessary, is still technically feasible. The instructions below will walk you through setting up a self-hosted instance of Underbranch.

# Server
We recommend any computer with at least 16 GB of RAM. This will ensure that the Node servers that `pm2` manages are able to handle requests without issues.You'll also want at least 100 GB of storage so that the compiled documents won't cause out-of-storage issues. While most Linux distros will do fine, we recommend Ubuntu Server. After imaging, run `sudo apt update`. You'll need the following packages from `apt`:
- nginx (be sure to start and enable the service as well with `sudo systemctl start nginx`, `sudo systemctl enable nginx`)
- `pm2`
- `texlive-full`
- `mysql-server` (make sure you set up a root user with a password; the programs that interact with the database should initialize all tables if they aren't already initialized)
- `certbot`
- `python3-certbot-nginx`

# Setup
After downloading and installing the correct packages, you'll need to enter your router settings and port forward port 80 and 443 to your soon-to-be web server. You can also optionally port forward port 22 for SSH access to the computer.

Following succesful port forwarding, clone this repository to wherever you've set as the root of `nginx` in your `nginx` config, usually found at `/etc/nginx/sites-available/underbranch`. You can also set up HTTPS with certbot from here.

Moving to `npm`, you'll need to go into the following directories and run `npm install`:
- `Underbranch/compile`
- `Underbranch/editor`
- `Underbranch/signin`

Finally, we have `pm2`. We run several Node servers with `pm2`. Run the following commands from the root of the project directory to finish getting `pm2` up and running:
- `pm2 start compile/server.js --name compile`
- `pm2 start signin/server.js --name signin`
- `pm2 start editor/server.js --name collab`
- `pm2 startup`
- `pm2 save`
This initializes all Node servers necessary for the project and ensures that they gracefully restart upon reboot.

## License Information
View License here - [Underbranch License](LICENSE.txt)
## Directory Overview

- **`editor/`** - React-based frontend source code with Monaco editor integration
- **`compile/`** - LaTeX compilation scripts and utilities
- **`signin/`** - User authentication and sign-in page components
- **`sprint/`** - Sprint planning and project management files
- **`index.html`** - Root landing page
- **`nginx-reload.sh`** - Server reload utility script

## Questions?
Please reach out with any quesions to admin@underbranch.org.
