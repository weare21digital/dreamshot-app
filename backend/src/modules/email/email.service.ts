import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Resend } from 'resend';
import { environmentConfig } from '../../config/config';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend | null = null;
  private isConfigured = false;

  onModuleInit() {
    this.initializeResend();
  }

  private initializeResend() {
    const apiKey = environmentConfig.email.apiKey;

    if (apiKey) {
      this.resend = new Resend(apiKey);
      this.isConfigured = true;
      this.logger.log('Email service initialized successfully with Resend');
    } else {
      this.logger.warn('Email service not configured - missing RESEND_API_KEY');
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.isConfigured || !this.resend) {
      this.logger.error('Email service not configured');
      return false;
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: environmentConfig.email.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      if (error) {
        this.logger.error(`Failed to send email to ${options.to}: ${error.message}`);
        return false;
      }

      this.logger.log(`Email sent successfully to ${options.to}: ${data?.id}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}: ${error}`);
      return false;
    }
  }

  /**
   * Send login code email for magic link auth
   */
  async sendAuthCodeEmail(email: string, code: string): Promise<boolean> {
    if (environmentConfig.email.devMode) {
      this.logger.log(`[EMAIL_DEV_MODE] Auth code for ${email}: ${code}`);
      return true;
    }

    const appName = environmentConfig.app.name;
    const headerColor = environmentConfig.email.headerColor;
    const logoUrl = environmentConfig.email.logoUrl;
    const logoHtml = logoUrl 
      ? `<img src="${logoUrl}" alt="${appName}" style="max-height: 50px; margin-bottom: 10px;" /><br/>`
      : '';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Your Login Code - ${appName}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: ${headerColor}; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .code {
            font-size: 24px;
            letter-spacing: 4px;
            font-weight: bold;
            background: #ffffff;
            padding: 12px 16px;
            display: inline-block;
            border-radius: 6px;
            border: 1px dashed ${headerColor};
          }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            ${logoHtml}
            <h1>Your Login Code</h1>
          </div>
          <div class="content">
            <p>Use the code below to finish signing in to ${appName}. This code expires in 10 minutes.</p>
            <p style="text-align: center;">
              <span class="code">${code}</span>
            </p>
            <p>If you did not request this, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            <p>This is an automated message from ${appName}, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: `Your Login Code - ${appName}`,
      html,
      text: `Your ${appName} login code is ${code}. It expires in 10 minutes.`,
    });
  }

  isServiceConfigured(): boolean {
    return this.isConfigured;
  }
}
