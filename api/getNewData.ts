import admin from 'firebase-admin';
import { db } from "./lib/admin.js";
import type { ResType,Res,steamSpaDataType,reStaetState } from "../types/index.js";

export default async function handler(req:Request, res : Res< ResType<any> >){
    const TimePosition = db.collection('steamCheck').doc("ailaTest");
    let lastSteamSpyData:steamSpaDataType[] = [];
    try{
        // 或取上一次資料刷新資料時間
        const getData = await TimePosition.get();
        if(!getData.exists){
            throw Error("更新時間錯誤，取無資料")
        }

        const statusData = getData.data() as reStaetState;
        // 更新firebase那邊 進行準備
        if(statusData.status !== "ready"){
            throw Error("更新中，不可進行更新")
        }else{
            await TimePosition.set({
                status:"check"
            }, { merge: true })
        }
        // 比較現在時間
        const nowTime : Date = new Date();
        const lastTime : Date = statusData.AtTime.toDate();
        const df = (nowTime.getTime() -  lastTime.getTime()) / 1000 /60 /60;
        console.log(`距離上次更新 ${df} 小時`)
        if(df < 6){
            throw Error("近期已更新")
        }
        // 通過 去呼叫SPA資料
        const getSteamSPA =await fetch("https://steamspy.com/api.php?request=top100in2weeks",{
            method:"GET",
        }) 
        const SteamSpaData =await getSteamSPA.json();
        // 處理資料 ccu = 最高再線人數
        lastSteamSpyData = Object.values(SteamSpaData).map((index:any)=>{
            return{
                appid:index.appid,
                ccu:index.ccu
            }
        })
        lastSteamSpyData.sort((a,b)=>b.ccu - a.ccu);
        // 更新查詢表單 按照排名
        await TimePosition.set({
                AtTime:admin.firestore.FieldValue.serverTimestamp(),
                steamSpyData:lastSteamSpyData
            }, { merge: true })
        // 抓取到資料
        // 在依序讀取Steam 資料。
        
        // 先進行測試 10筆
        console.log("間隔")
        // console.log(results);
        const test = await fetch('https://store.steampowered.com/api/appdetails?appids=10').then(r => r.json());
        console.log(test);


        return res.status(200).json({success:true,data:lastSteamSpyData})
    }catch(e){

        const msg = e instanceof Error ? e.message : String(e)
        return res.status(500).json({success:false, data:msg});

    }finally{

        await TimePosition.set({
                status:"ready"
            }, { merge: true })

    }
}