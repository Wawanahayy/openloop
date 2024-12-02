import axios from 'axios';
import fs from 'fs';
import readline from 'readline';
import { exec } from 'child_process';
import chalk from 'chalk';
import fetch from 'node-fetch';
import { HttpsProxyAgent } from 'https-proxy-agent';

// Fungsi untuk mendapatkan timestamp dalam format [YYYY-MM-DD HH:MM:SS]
let currentTimestamp = '';

const updateTimestamp = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    currentTimestamp = `[${year}-${month}-${day} ${hours}:${minutes}:${seconds}]`;
};

// Update timestamp setiap detik
setInterval(updateTimestamp, 1000);

const getTimestamp = () => currentTimestamp;

const print_colored_blink = (color_code, text) => {
    // Menambahkan timestamp pada setiap log
    console.log(`${getTimestamp()} \x1b[${color_code}m\x1b[5m${text}\x1b[0m`);
};

const display_colored_text = () => {
    print_colored_blink("40;96", "============================================================");
    print_colored_blink("42;37", "=======================  J.W.P.A  ==========================");
    print_colored_blink("45;97", "================= @AirdropJP_JawaPride =====================");
    print_colored_blink("43;30", "=============== https://x.com/JAWAPRIDE_ID =================");
    print_colored_blink("41;97", "============= https://linktr.ee/Jawa_Pride_ID ==============");
    print_colored_blink("44;30", "============================================================");
};

const welcomeMessage = () => {
    console.log(`${getTimestamp()} \x1b[41m\x1b[5m  WELCOME TO  \x1b[0m \x1b[45m\x1b[31m  SCRIPT  \x1b[0m \x1b[47m\x1b[31m  JAWA PRIDE AIRDROP  \x1b[0m`);
};

// Fungsi untuk memilih warna secara acak
const getRandomColor = () => {
    const colors = ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan'];
    return colors[Math.floor(Math.random() * colors.length)];
};

const colorizeMessageWithBlink = (message) => {
    // Membagi pesan menjadi kata-kata
    const words = message.split(' ');

    // Menerapkan warna acak dan efek blink pada setiap kata
    return words.map(word => chalk[getRandomColor()].bold(word)).join(' ');
};

const loadingStep = async () => {
    welcomeMessage();
    display_colored_text();
};

const decodeEmailFromToken = (token) => {
    try {
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString('utf-8'));
        return payload.username || "Unknown User";
    } catch (error) {
        console.error(`${getTimestamp()} Error decoding token: ${error.message}`);
        return "Unknown User";
    }
};

const getRandomQuality = () => {
    return Math.floor(Math.random() * (99 - 60 + 1)) + 60;
};

const getTokens = () => {
    return fs.readFileSync('akun.txt', 'utf8').split('\n').map(line => line.trim()).filter(Boolean);
};

const getProxies = () => {
    return fs.readFileSync('proxy.txt', 'utf8').split('\n').map(line => line.trim()).filter(Boolean);
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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

        logBandwidthShareResponse(data, token, quality, proxy);
    } catch (error) {
        console.error(`${getTimestamp()} Error sharing bandwidth: ${error.message}`);
    }
};

const logBandwidthShareResponse = (response, token, quality, proxy) => {
    if (response && response.data && response.data.balances) {
        const balance = response.data.balances.POINT;

        // Periksa apakah proxy aktif dan ganti statusnya menjadi 'ACTIVE' jika aktif
        const proxyStatus = proxy ? 'ACTIVE' : 'None';

        console.log(
            `${getTimestamp()} Bandwidth shared Message: ${chalk.bgGreen.white.bold(response.message)} | ` +
            `Score: ${chalk.bgGreen.white.bold(quality)} | ` +
            `Total Earnings: ${chalk.bgGreen.white.bold(balance)} | ` +
            `Proxy: ${chalk.bgCyan.white.bold(proxyStatus)} | `
        );
    }
};

const getRandomInterval = () => Math.floor(Math.random() * (30000 - 15000 + 1)) + 15000;

const displayMessagesWithDelay = async () => {
    const messages = [
        "Welcome to JAWA PRIDE AIRDROP SCRIPT",
        "Don't Forget To join channel https://t.me/AirdropJP_JawaPride",
        "Follow twitter @JAWAPRIDE_ID { https://x.com/JAWAPRIDE_ID }",
        "More details https://linktr.ee/Jawa_Pride_ID",
        "Thanks you"
    ];

    for (const message of messages) {
        // Display message with blinking and changing colors
        const blinkMessage = colorizeMessageWithBlink(message);
        console.log(`${getTimestamp()} \x1b[5m${blinkMessage}\x1b[0m`);

        await delay(2000);
    }
};

const main = async () => {
    loadingStep();
    await delay(3000);
    await displayMessagesWithDelay();

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    
    rl.question(chalk.bgGreen.white('Do you want to use proxies? (yes/no): '), async (answer) => {
        const useProxy = answer.toLowerCase() === 'yes';
    
        console.log(`${getTimestamp()} Bandwidth sharing started with ${useProxy ? 'proxies' : 'no proxies'}`);
        
        while (true) {
            const tokens = getTokens();
            for (const token of tokens) {
                // Menunggu 3 detik setelah setiap akun
                await shareBandwidth(token, useProxy ? getProxies()[Math.floor(Math.random() * getProxies().length)] : null);
                
                // Delay 3 detik sebelum beralih ke akun berikutnya
                await delay(3000);
            }
            
            const randomInterval = getRandomInterval();
            let timeRemaining = randomInterval / 1000;

            // Menunggu dengan waktu yang terus berjalan tanpa mencetak ulang
            while (timeRemaining > 0) {
                process.stdout.write(`${getTimestamp()} Waiting for ${timeRemaining.toFixed(1)} seconds  \r`);
                timeRemaining -= 0.1;
                await delay(100);
            }

            console.log(`${getTimestamp()} Proceeding with next share...`);
        }
    });
};

main();
