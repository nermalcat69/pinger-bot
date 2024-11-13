import { Client } from 'discord.js';
import { config } from 'dotenv';
import cron from 'node-cron';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration.js';
import relativeTime from 'dayjs/plugin/relativeTime.js';

config();
dayjs.extend(duration);
dayjs.extend(relativeTime);

const client = new Client({
    intents: ['Guilds', 'DirectMessages']
});

// Constants
const TARGET_DATE = '2025-02-01';
const TARGET_USER_ID = process.env.TARGET_USER_ID;

let messageCount = 0;

if (!TARGET_USER_ID) {
    throw new Error('Missing TARGET_USER_ID!!');
}

if (!process.env.DISCORD_TOKEN) {
    throw new Error('Missing DISCORD_TOKEN!!');
}


const getRemainingHours = (targetDate) => {
    const now = dayjs();
    const diff = targetDate.diff(now);
    const hours = Math.floor(dayjs.duration(diff).asHours());
    return `${hours} hours`;
};


const sendCountdownMessage = async () => {
    try {
        const now = dayjs();
        const targetDate = dayjs(TARGET_DATE);
        const currentTimestamp = Math.floor(now.valueOf() / 1000);


        if (now.isAfter(targetDate)) {
            console.log('Target date has passed. Stopping bot...');
            process.exit(0);
        }

        const remainingTime = getRemainingHours(targetDate);
        const user = await client.users.fetch(TARGET_USER_ID);
        const message = `Time Sent:<t:${currentTimestamp}:F>\nJust letting you know that February 1st, 2025 is ${remainingTime} away!`;
        
        await user.send(message);
        messageCount++;
        
        const ordinal = (n) => {
            const s = ["th", "st", "nd", "rd"];
            const v = n % 100;
            return n + (s[(v - 20) % 10] || s[v] || s[0]);
        };
        
        console.log(`DM sent to ${user.tag} - ${ordinal(messageCount)} message`);
    } catch (error) {
        console.error('Error sending DM:', error);
    }
};


client.once('ready', () => {
    console.log(`Bot is ready! Logged in as ${client.user?.tag}`);
    
    cron.schedule('0 * * * *', sendCountdownMessage);
    
    sendCountdownMessage();
});

client.on('error', error => {
    console.error('Discord client error:', error);
});

client.login(process.env.DISCORD_TOKEN)
    .catch(error => {
        console.error('Failed to login:', error);
        process.exit(1);
    });