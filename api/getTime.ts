import { db } from "./lib/admin.js";
import type { ResType,Res } from "../types/index.js";
// import admin from "firebase-admin";

export default async function handler(req:Request, res : Res< ResType<string> >){
    try{
        const TimePosition = db.collection('steamCheck').doc("ailaTest");
        const getData = await TimePosition.get();
        if(!getData.exists){
            throw Error("更新時間錯誤，取無資料")
        }
        const data:string = getData.data()!.AtTime.toDate().toLocaleString("zh-TW", { timeZone: "Asia/Taipei" });
        return res.status(200).json({success : true, data:data});
    }catch(e){
        const msg = e instanceof Error ? e.message : String(e)
        return res.status(500).json({success:false, data:msg});
    }
}