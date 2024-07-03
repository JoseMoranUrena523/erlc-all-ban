import fetch from 'node-fetch';

const serverKey = 'exampleServerKey'; // Your server key, can be found in private server settings
const baseURL = 'https://api.policeroleplay.community/v1/'; // Base URL, can be found at https://apidocs.policeroleplay.community/for-developers/api-reference
const timeToBanAfterMessage = 5; // How many seconds should the user be banned after the private message
const interval = 6; // How often to check join logs (DO NOT CHANGE, RATE LIMIT)
const banMessage = 'You are being banned for your username containing the word "all" in the beginning. This can disrupt mods from being able to do their job.'; // Message to be sent before being banned

if (serverKey === 'exampleServerKey') {
  return console.error("You've started the automation for the first time! Please set your server key in line 3 of index.js. You can also modify the interval, ban message, PRC's base URL, or the time frame between the private message and ban with lines 4-7.");
}

async function checkJoinLogs() {
  try {
    const response = await fetch(`${baseURL}server/joinlogs`, {
      headers: { 
        'Server-Key': serverKey
      }
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const joinLogs = await response.json();

    joinLogs.forEach(async (log) => {
      const player = log.Player;
      if (/^all/i.test(player)) {
        const playerId = player.split(':')[1];

        try {
          await fetch(`${baseURL}server/command`, {
            method: 'POST',
            headers: { 
              'Server-Key': serverKey,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              command: `:pm ${playerId} ${banMessage}`
            })
          });

          setTimeout(async () => {
            await fetch(`${baseURL}server/command`, {
              method: 'POST',
              headers: { 
                'Server-Key': serverKey,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                command: `:ban ${playerId}`
              })
            });
          }, timeToBanAfterMessage * 1000);
        } catch (commandError) {
          console.error(`Error sending ban commands to player ${playerId}:`, commandError);
        }
      }
    });
  } catch (error) {
    console.error('Error fetching join logs:', error);
  }
}

setInterval(checkJoinLogs, interval * 1000);
