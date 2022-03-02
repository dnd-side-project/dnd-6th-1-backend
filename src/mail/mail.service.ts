import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
    constructor(private readonly mailerService: MailerService) {}
    public example(): void {
        this.mailerService.sendMail({
            to: 'test@nestjs.com',
            from: 'noreply@nestjs.com',
            subject: 'Testing Nest Mailermodule with template ✔',
            template: 'welcome', // The `.pug`, `.ejs` or `.hbs` extension is appended automatically.
            context: {
              // Data to be sent to template engine.
              code: 'cf1a3f828287',
              username: 'john doe',
            },
          })
          .then(() => {})
          .catch(() => {});
      }
}
