// domain/interfaces/IEmailService.ts

export interface IEmailService {
  send(to: string, subject: string, body: string): Promise<void>
  sendBulk(recipients: string[], subject: string, body: string): Promise<void>
}
