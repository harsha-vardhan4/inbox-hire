import POP3 from 'poplib';
import { simpleParser } from 'mailparser';
import fs from 'fs/promises';
import path from 'path';

export async function getSettings() {
  const filePath = path.resolve(process.cwd(), 'src', 'data', 'settings.json');
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const parsed = JSON.parse(fileContent);

    console.log('✅ Loaded POP3 settings:', parsed.api?.pop3);
    return parsed;
  } catch (error) {
    console.error('❌ Failed to read or parse settings.json:', error);
    throw error;
  }
}

async function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), 'src', 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

export async function fetchEmailsFromDate(targetDate) {
  const settings = await getSettings();
  const config = settings.api.pop3;
  const filterDate = targetDate instanceof Date ? targetDate : new Date(targetDate);

  return new Promise((resolve, reject) => {
    const client = new POP3({
      hostname: config.host,
      port: config.port,
      tls: config.tls,
      mailparser: false, // we'll parse manually with mailparser
    });

    const emails = [];
    let messageCount = 0;
    let fetchedCount = 0;

    client.on('error', (err) => {
      console.error('❌ POP3 error:', err);
      reject(err);
    });

    client.on('connect', () => {
      console.log('🔌 Connected to POP3 server');
      client.login(config.auth.user, config.auth.pass);
    });

    client.on('login', (status) => {
      if (!status) {
        console.error('❌ Login failed');
        client.quit();
        return reject(new Error('Login failed'));
      }
      console.log('✅ Logged in');
      client.stat(); // get message count
    });

    client.on('stat', (status, data) => {
      if (!status) {
        console.error('❌ STAT command failed');
        client.quit();
        return reject(new Error('Failed to get message count'));
      }

      messageCount = data.count;
      console.log(`📬 Found ${messageCount} messages`);

      if (messageCount === 0) {
        client.quit();
        return resolve([]);
      }

      // Retrieve all messages
      for (let i = 1; i <= messageCount; i++) {
        client.retr(i);
      }
    });

    client.on('retr', async (status, msgnumber, data) => {
      fetchedCount++;

      if (status) {
        try {
          const parsed = await simpleParser(data);
          const emailDate = new Date(parsed.date);

          if (emailDate >= filterDate) {
            emails.push({
              subject: parsed.subject,
              from: parsed.from?.text || '',
              to: parsed.to?.text || '',
              date: parsed.date,
              messageId: parsed.messageId,
              text: parsed.text,
              html: parsed.html,
            });
          }
        } catch (err) {
          console.error(`❌ Failed to parse message #${msgnumber}:`, err);
        }
      } else {
        console.warn(`⚠️ Failed to retrieve message #${msgnumber}`);
      }

      if (fetchedCount === messageCount) {
        client.quit();
      }
    });

    client.on('quit', async (status) => {
      if (!status) {
        console.error('❌ Quit command failed');
        return reject(new Error('Failed to quit POP3 connection'));
      }
      try {
        await ensureDataDirectory();
        const outputPath = path.join(process.cwd(), 'src', 'data', 'emails.json');
        await fs.writeFile(outputPath, JSON.stringify(emails, null, 2));
        console.log(`✅ Saved ${emails.length} emails to ${outputPath}`);
        resolve(emails);
      } catch (err) {
        console.error('❌ Error saving emails:', err);
        reject(err);
      }
    });
  });
}
