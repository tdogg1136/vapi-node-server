import { OutboundScheduler } from './outboundScheduler';
import { JobQueue } from './jobQueue';

export class BackgroundProcessor {
  private scheduler: OutboundScheduler;
  private interval: NodeJS.Timeout | null = null;

  constructor() {
    // Create JobQueue instance and pass it to OutboundScheduler
    const jobQueue = new JobQueue();
    this.scheduler = new OutboundScheduler(jobQueue);
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