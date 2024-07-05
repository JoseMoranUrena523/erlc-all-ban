const fetch = require('node-fetch');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

const serverKey = 'exampleServerKey'; // Your server key, can be found in private server settings
const baseURL = 'https://api.policeroleplay.community/v1/'; // Base URL, can be found at https://apidocs.policeroleplay.community/for-developers/api-reference
const banMessage = 'You are being banned for your username containing the word "all" in the beginning. This can disrupt mods from being able to do their job.'; // Message to be sent before being banned
const minInterval = 1; // Minimum interval in seconds to prevent too frequent checking (DO NOT UPDATE)

if (serverKey === 'exampleServerKey') {
  return console.error("You've started the automation for the first time! Please set your server key in line 3 of the script. You can also modify PRC's base URL or the ban message.");
}

async function checkJoinLogs() {
  await db.init();

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
    const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
    const rateLimitReset = response.headers.get('X-RateLimit-Reset');

    if (rateLimitRemaining <= 1) {
      const resetTime = rateLimitReset * 1000 - Date.now();
      console.warn(`Rate limit reached. Waiting for ${resetTime} ms before next check.`);
      setTimeout(checkJoinLogs, resetTime);
      return;
    }

    const playersToBan = joinLogs.filter(log => /^all/i.test(log.Player));
    await processPlayers(playersToBan, rateLimitRemaining);

  } catch (error) {
    console.error('Error fetching join logs:', error);
    setTimeout(checkJoinLogs, 60 * 1000); // Retry after 60 seconds in case of error
  }
}

async function processPlayers(players, rateLimitRemaining) {
  for (let i = 0; i < players.length; i++) {
    const player = players[i].Player;
    const playerName = player.split(':')[0];
    const playerId = player.split(':')[1];

    const isBanned = await db.get(playerId);
    if (isBanned) {
      console.log(`Player with ID ${playerId} is already banned.`);
      continue;
    }

    try {
      await fetch(`${baseURL}server/command`, {
        method: 'POST',
        headers: { 
          'Server-Key': serverKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          command: `:pm ${playerName} ${banMessage}`
        })
      });

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

      await db.set(playerId, true);

      const rateLimitReset = response.headers.get('X-RateLimit-Reset');
      const resetTime = rateLimitReset * 1000 - Date.now();
      if (resetTime > 0) {
        console.log(`Waiting for ${resetTime} ms due to rate limit.`);
        await new Promise(resolve => setTimeout(resolve, resetTime));
      }

    } catch (commandError) {
      console.error(`Error sending ban commands to player ${playerId}:`, commandError);
    }
  }

  let interval = Math.max(minInterval, Math.floor(60 / rateLimitRemaining));
  console.log(`Next check in ${interval} seconds`);
  setTimeout(checkJoinLogs, interval * 1000);
}

checkJoinLogs();
