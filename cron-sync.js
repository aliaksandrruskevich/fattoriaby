const { fetchAndSyncProperties } = require('./api/properties');

async function runSync() {
  console.log('Starting property sync...');
  try {
    await fetchAndSyncProperties();
    console.log('Property sync completed successfully.');
  } catch (error) {
    console.error('Error during property sync:', error);
  }
}

// Run sync immediately
runSync();

// For cron job, run every 2 hours
setInterval(runSync, 2 * 60 * 60 * 1000); // 2 hours in milliseconds
