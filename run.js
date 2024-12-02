import fetch from 'node-fetch';
import fs from 'fs';
import readline from 'readline';
import chalk from 'chalk';
import { HttpsProxyAgent } from 'https-proxy-agent';

// Decode email from JWT token
const decodeEmailFromToken = (token) => {
    try {
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString('utf-8'));
        return payload.username || "Unknown User";
    } catch (error) {
        console.error('Error decoding token:', error.message);
        return "Unknown User";
    }
};

// Get random quality
const getRandomQuality = () => {
    return Math.floor(Math.random() * (99 - 60 + 1)) + 60;
};

// Membaca akun (token) dari file akun.txt
const getTokens = () => {
    return fs.readFileSync('akun.txt', 'utf8').split('\n').map(line => line.trim()).filter(Boolean);
};

// Membaca proxy dari file proxy.txt (jika diperlukan)
const getProxies = () => {
    return fs.readFileSync('proxy.txt', 'utf8').split('\n').map(line => line.trim()).filter(Boolean);
};

// Fungsi untuk menambahkan delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Fungsi untuk berbagi bandwidth
const shareBandwidth = async (token, proxy = null) => {
    try {
        const quality = getRandomQuality();
        const options = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ quality }),
        };

        if (proxy) {
            options.agent = new HttpsProxyAgent(proxy);
        }

        const response = await fetch('https://api.openloop.so/bandwidth/share', options);

        if (!response.ok) {
            throw new Error(`Failed to share bandwidth! Status: ${response.statusText}`);
        }

        const data = await response.json();

        const logBandwidthShareResponse = (response) => {
            if (response && response.data && response.data.balances) {
                const balance = response.data.balances.POINT;
                const email = decodeEmailFromToken(token); // Decode email from token
                console.log(
                    `Bandwidth shared Message: ${chalk.yellow(response.message)} | Score: ${chalk.yellow(quality)} | Total Earnings: ${chalk.yellow(balance)} | Proxy: ${proxy || "None"}`
                );
            }
        };

        logBandwidthShareResponse(data);
    } catch (error) {
        console.error('Error sharing bandwidth:', error.message);
    }
};

// Fungsi utama untuk berbagi bandwidth dengan delay antar akun
const shareBandwidthForAllTokens = async (useProxy) => {
    const tokens = getTokens();
    const proxies = useProxy ? getProxies() : [];

    if (useProxy && tokens.length !== proxies.length) {
        console.error('The number of tokens and proxies do not match!');
        return;
    }

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const proxy = useProxy ? proxies[i] : null;

        try {
            await shareBandwidth(token, proxy);
            const randomDelay = Math.floor(Math.random() * (3000 - 1000 + 1)) + 1000;
            console.log(`Delaying next account for ${randomDelay / 1000} seconds...`);
            await delay(randomDelay);
        } catch (error) {
            console.error(`Error processing token: ${token}, Error: ${error.message}`);
        }
    }
};

// Fungsi untuk mendapatkan interval random antara 30-60 detik
const getRandomInterval = () => Math.floor(Math.random() * (60000 - 30000 + 1)) + 30000;

const main = async () => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    rl.question('Do you want to use proxies? (yes/no): ', async (answer) => {
        const useProxy = answer.toLowerCase() === 'yes';
        console.log(`Starting bandwidth sharing with ${useProxy ? 'proxies' : 'no proxies'}...`);
        
        while (true) {
            await shareBandwidthForAllTokens(useProxy);
            const randomInterval = getRandomInterval(); // Interval random
            console.log(`Waiting for ${randomInterval / 1000} seconds before next share...`);
            await delay(randomInterval);
        }
    });
};

main();
