import { OutboundScheduler } from './outboundScheduler';

export class BackgroundProcessor {
  private scheduler: OutboundScheduler;
  private interval: NodeJS.Timeout | null = null;

  constructor() {
    this.scheduler = new OutboundScheduler();
  }

  start() {
    // Check for scheduled calls every minute
    this.interval = setInterval(async () => {
      try {
        await this.scheduler.processScheduledCalls();
      } catch (error) {
        console.error('Background processing error:', error);
      }
    }, 60000); // 1 minute
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
} 