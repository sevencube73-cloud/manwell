import cron from 'node-cron';
import FlashSale from '../models/FlashSale.js';

// Job to run every minute to check for sales to activate
cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    await FlashSale.updateMany(
      { startTime: { $lte: now }, endTime: { $gt: now }, status: 'scheduled' },
      { $set: { status: 'active' } }
    );
  } catch (error) {
    console.error('Error activating flash sales:', error);
  }
});

// Job to run every minute to check for sales to end
cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    await FlashSale.updateMany(
      { endTime: { $lte: now }, status: 'active' },
      { $set: { status: 'ended' } }
    );
  } catch (error) {
    console.error('Error ending flash sales:', error);
  }
});
