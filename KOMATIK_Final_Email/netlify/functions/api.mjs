import {getStore} from '@netlify/blobs';
import {createAPI} from '../../server/v5/api.mjs';
import {sendReport,reportPDF,rubricPDF} from '../../server/v5/reports.mjs';
import {production,storeName} from '../../server/v5/deployment.mjs';
export default (request,context)=>createAPI({
 store:getStore({name:storeName,consistency:'strong'}),env:process.env,ip:context.ip,pdf:reportPDF,rubricPDF,
 sendEmail:production?(data,key)=>sendReport(data,key,process.env):async()=>({sent:false,message:'Pratinjau: email nyata dinonaktifkan. Jawaban simulasi tersimpan.'}),
 legacyStores:production?['komatik-progress-v2','komatik-production'].map(name=>({name,store:getStore({name,consistency:'strong'})})):[]
})(request);
