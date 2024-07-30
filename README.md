# ER:LC "all" Ban

## Special thanks to those that are using my automation!
[![image](https://cdn.discordapp.com/icons/1262090668537413775/8b737d9ec3ec5fede1e2534919d9eb6e.png)](https://discord.gg/nawsakg47d)

## What is this?
This automation detects when a Roblox user joins your ER:LC private server with a username starting with "all" or "others". It then sends them a private message and proceeds to ban them. (interval cannot be updated due to rate limiting set by PRC).

## Why is this useful?
As a former private server moderator myself, I was in a mod call where a user named [allIIIIIII812812](https://www.roblox.com/users/6233238877/profile) was mass RDMing (random deathmatching) in the server. While trying to bring this user to me, I accidentally used commands that affected everyone in the server due to the username "all". This mistake resulted in me being fired from my moderating job. Knowing that others have made the same mistake as me, I made this automation (with help from [ChatGPT](https://chatgpt.com/)) to monitor join logs and automatically ban users with usernames starting with "all".
(update 06/11/24: it's not just all anymore, it's also people with others)

## Installation
### Prerequisites
- A private server with the **ERLC API** server pack.
- A VPS (Virtual Private Server) or any machine with Node.js, Git installed, and a stable internet connection to host this script (e.g., Raspberry Pi or dedicated server).

### Installation Steps
1. `git clone https://github.com/JoseMoranUrena523/erlc-all-ban`
2. `npm install pm2 -g`
3. Edit lines 5 and 7-8 of **index.js**.
4. `npm install`
5. `pm2 start index.js`

Using PM2 makes sure that the script keeps running in the background even if you close the terminal or disconnect from the server. Thank you for using this automation!
