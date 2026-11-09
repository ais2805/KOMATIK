import { getStore } from '@netlify/blobs';
import { createAPI } from '../../server/core.mjs';
import { sendReport } from '../../server/email.mjs';
export default async (request) => createAPI({store:getStore({name:'komatik-progress-v2',consistency:'strong'}),env:process.env,sendEmail:(data,key)=>sendReport(data,key,process.env)})(request);
