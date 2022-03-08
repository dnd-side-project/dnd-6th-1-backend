import { HttpStatus, Inject, ParseIntPipe, Res, UploadedFiles, UseGuards } from '@nestjs/common';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth,  ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { AlarmService } from './alarm.service';
require("dotenv").config();

// Payloads for Scheduler(실제 운영에서는 서버가 죽으면 데이터가 없어지기 때문에 별도 DB에 저장 및 스케줄링 필요)

const adminAlarm = require('firebase-admin')

@ApiBearerAuth('accessToken')
@UseGuards(JwtAuthGuard)
@Controller('push')
@ApiTags('푸시 알림 API')
export class AlarmController {
    constructor(
        private readonly alarmService: AlarmService
    ){}

    @Get('/push/:num') // 커뮤니티 전체 글 조회 / 카테고리별 조회 / 검색어별 조회
    // @ApiOperation({ 
    //     summary: '커뮤니티 메인화면에서 전체 글 조회 API'
    // })
    // @ApiQuery({
    //     name: 'category',
    //     required: false,
    //     description: '카테고리별',
    //     example:1,
    // })
    // @ApiQuery({
    //     name: 'keyword',
    //     required: false,
    //     description: '검색어별',
    //     example:'졸려'
    // })
    async getAllBoards(@Res() res, @Param() param){
        const { num } = param;
        const data = this.alarmService.createPayload(num);
        // payloads.push(data);
        // payloads = [...new Set(payloads.map(i=>JSON.stringify(i)))].map(JSON.parse);
        // console.log(payloads);
      
        adminAlarm.messaging().send(data)
            .then(function(response) {
            console.log('성공ㅣ', response);
            })
            .catch(function(err){
            console.log("errrrrr: ", err);
            })

        return res
            .status(200)
            .send({
                message: "✅ Push will be sent soon! Check your device.",
            });
    }
}
