import cron from 'node-cron';
import { syncData } from './api/sync.js';
import dotenv from 'dotenv';

dotenv.config();

// 매시간 정각에 실행 (0 * * * *)
cron.schedule('0 * * * *', async () => {
  const now = new Date();
  console.log(`Running scheduled sync at ${now.toLocaleString()}...`);
  try {
    await syncData();
    console.log('Scheduled sync completed successfully');
  } catch (error) {
    console.error('Error during scheduled sync:', error);
  }
});

console.log('Cron job scheduled for hourly sync (at minute 0 of every hour)'); 