import cron from 'node-cron';
import { syncData } from './api/sync.js';
import dotenv from 'dotenv';

dotenv.config();

// 매일 오전 8시에 실행 (0 8 * * *)
cron.schedule('0 8 * * *', async () => {
  const now = new Date();
  console.log(`Running scheduled sync at ${now.toLocaleString()}...`);
  try {
    await syncData();
    console.log('Scheduled sync completed successfully');
  } catch (error) {
    console.error('Error during scheduled sync:', error);
  }
});

console.log('Cron job scheduled for daily sync (at 8:00 AM every day)'); 