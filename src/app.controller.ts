import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ReportsService } from './reports/reports.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
  ) {}


  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  
  // startSchedule() { // 리포트 생성 함수
  //   this.reportsService.createReport();
  // }
}
