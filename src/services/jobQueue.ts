interface Job {
  id: string;
  type: string;
  data: any;
  scheduledFor: Date;
  retries: number;
  maxRetries: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

export class JobQueue {
  private jobs: Job[] = [];
  private isProcessing: boolean = false;
  private interval: NodeJS.Timeout | null = null;

  constructor() {
    this.start();
  }

  addJob(type: string, data: any, scheduledFor?: Date): string {
    const job: Job = {
      id: this.generateJobId(),
      type,
      data,
      scheduledFor: scheduledFor || new Date(),
      retries: 0,
      maxRetries: 3,
      status: 'pending'
    };

    this.jobs.push(job);
    console.log(`Job added: ${job.id} (${type})`);
    return job.id;
  }

  private async processJobs() {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    const now = new Date();
    const dueJobs = this.jobs.filter(
      job => job.status === 'pending' && job.scheduledFor <= now
    );

    for (const job of dueJobs) {
      try {
        await this.executeJob(job);
      } catch (error) {
        console.error(`Job ${job.id} failed:`, error);
        await this.handleJobFailure(job, error);
      }
    }

    this.isProcessing = false;
  }

  private async executeJob(job: Job) {
    console.log(`Executing job: ${job.id} (${job.type})`);
    job.status = 'running';

    switch (job.type) {
      case 'outbound_call':
        await this.executeOutboundCall(job.data);
        break;
      case 'hubspot_sync':
        await this.executeHubSpotSync(job.data);
        break;
      case 'follow_up_call':
        await this.executeFollowUpCall(job.data);
        break;
      default:
        throw new Error(`Unknown job type: ${job.type}`);
    }

    job.status = 'completed';
    console.log(`Job completed: ${job.id}`);
  }

  private async executeOutboundCall(data: any) {
    // Implementation for outbound call
    console.log('Executing outbound call:', data);
  }

  private async executeHubSpotSync(data: any) {
    // Implementation for HubSpot sync
    console.log('Executing HubSpot sync:', data);
  }

  private async executeFollowUpCall(data: any) {
    // Implementation for follow-up call
    console.log('Executing follow-up call:', data);
  }

  private async handleJobFailure(job: Job, error: Error) {
    job.retries++;
    
    if (job.retries >= job.maxRetries) {
      job.status = 'failed';
      console.error(`Job ${job.id} failed permanently after ${job.maxRetries} retries`);
    } else {
      job.status = 'pending';
      // Reschedule for 5 minutes later
      job.scheduledFor = new Date(Date.now() + 5 * 60 * 1000);
      console.log(`Job ${job.id} rescheduled for retry ${job.retries}/${job.maxRetries}`);
    }
  }

  private generateJobId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private start() {
    this.interval = setInterval(() => {
      this.processJobs();
    }, 10000); // Check every 10 seconds
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  getJobStatus(jobId: string): Job | null {
    return this.jobs.find(job => job.id === jobId) || null;
  }

  getPendingJobs(): Job[] {
    return this.jobs.filter(job => job.status === 'pending');
  }
} 