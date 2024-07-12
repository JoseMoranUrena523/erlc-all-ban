const fetch = require('node-fetch');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

const serverKey = 'exampleServerKey'; // Your server key, can be found in private server settings
const baseURL = 'https://api.policeroleplay.community/v1/'; // Base URL, can be found in https://apidocs.policeroleplay.community/for-developers/api-reference
const banMessage = 'You are being banned for your username containing the word "all" or "others" in the beginning. This can disrupt mods from being able to do their job.'; // Message to be sent before being banned

if (serverKey === 'exampleServerKey') {
  return console.error("You've started the automation for the first time! Please set your server key in line 5 of the script. You can also update the ban message in line 7.");
}

async function fetchJoinLogs() {
  try {
    const response = await fetch(`${baseURL}server/joinlogs`, {
      headers: { 
        'Server-Key': serverKey
      }
    });

    if (response.status === 422) {
      throw new Error("Private server is shut down (there are no players), unable to proceed with automation.");
    }
    
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const joinLogs = await response.json();
    const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
    const rateLimitReset = response.headers.get('X-RateLimit-Reset');
    return { joinLogs, rateLimitRemaining, rateLimitReset };
  } catch (error) {
    console.error('Error fetching join logs:', error);
    throw error;
  }
}

async function executeCommand(command) {
  try {
    const response = await fetch(`${baseURL}server/command`, {
      method: 'POST',
      headers: {
        'Server-Key': serverKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ command })
    });

    if (!response.ok) {
      throw new Error(`Error executing command: ${response.statusText}`);
    }

    const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
    const rateLimitReset = response.headers.get('X-RateLimit-Reset');
    return { rateLimitRemaining, rateLimitReset };
  } catch (error) {
    console.error(`Error executing command "${command}":`, error);
    throw error;
  }
}

async function processPlayers(players) {
  for (const player of players) {
    const playerName = player.Player.split(':')[0];
    const playerId = player.Player.split(':')[1];

    if (await db.get(playerId)) {
      console.log(`Player ID ${playerId} already processed. Skipping...`);
      continue;
    }

    try {
      const { rateLimitReset: rateLimitResetPM } = await executeCommand(`:pm ${playerName} ${banMessage}`);
      const resetTimePM = (parseInt(rateLimitResetPM, 10) * 1000) - Date.now() + 1000;
      await new Promise(resolve => setTimeout(resolve, resetTimePM));

      const { rateLimitReset: rateLimitResetBan } = await executeCommand(`:ban ${playerId}`);
      const resetTimeBan = (parseInt(rateLimitResetBan, 10) * 1000) - Date.now() + 1000;
      await db.set(playerId, true);

      console.log(`Executed :ban on player with ID ${playerId}.`);
      await new Promise(resolve => setTimeout(resolve, resetTimeBan));

    } catch (commandError) {
      console.error(`Error executing commands for player ${playerId}:`, commandError);
    }
  }
}

async function checkJoinLogs() {
  try {
    const { joinLogs, rateLimitReset: rateLimitReset1 } = await fetchJoinLogs();
    const resetTime1 = (parseInt(rateLimitReset1, 10) * 1000) - Date.now() + 1000;

    await new Promise(resolve => setTimeout(resolve, resetTime1));

    const playersToBan = joinLogs.filter(log => log.Join && /^(all|others)/i.test(log.Player));
    await processPlayers(playersToBan);

    checkJoinLogs();

  } catch (error) {
    console.error('Error in checkJoinLogs:', error);
    setTimeout(checkJoinLogs, 30 * 1000);
  }
}

checkJoinLogs();
