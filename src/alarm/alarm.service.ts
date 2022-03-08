import { Injectable } from "@nestjs/common";
import * as admin from 'firebase-admin';
import { ServiceAccount } from "firebase-admin";
require("dotenv").config();

const adminConfig: ServiceAccount = {
    "projectId": process.env.FIREBASE_PROJECT_ID,
    "privateKey": process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    "clientEmail": process.env.FIREBASE_CLIENT_EMAIL,
};
admin.initializeApp({
    credential: admin.credential.cert(adminConfig),
});

let iosPayload = {
    data: {
        MyKey1: "hello"
    } 
}

@Injectable()
export class AlarmService {
    constructor(){}

    async createPayload(number: number){
        const targetToken = process.env.FIREBASE_TOKEN;
        const data = {
            token: targetToken,

            // NOTIFICATION CONTENTS
            notification: {
                title: `Test Title`,
                body: `Test Body! ${number}`,
            },

            // CUSTOM DATA
            data: {
                type: "0", // 별도 Enum 관리 필요(SW<->BE)
                post_id: `${number}`,
            }
        };
        return data;
    }
    
}