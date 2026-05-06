// infrastructure/adapters/EmailAdapter.ts

import { IEmailService } from '../../domain/interfaces/IEmailService'

export class EmailAdapter implements IEmailService {
  async send(to: string, subject: string, body: string): Promise<void> {
    // Implemented   with Nodemailer or SendGrid
    console.log(
      `Sending email to ${to}: ${subject} - ${body.substring(0, 50)}...`,
    )
  }

  async sendBulk(
    recipients: string[],
    subject: string,
    body: string,
  ): Promise<void> {
    await Promise.all(
      recipients.map((recipient) => this.send(recipient, subject, body)),
    )
  }
}
