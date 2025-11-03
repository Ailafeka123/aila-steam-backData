import admin from 'firebase-admin';
import { db } from "./lib/admin.js";
import type { ResType,Res,steamSpaDataType,reStaetState } from "../types/index.js";

export default async function handler(req:Request, res : Res< ResType<string> >){
    const TimePosition = db.collection('steamCheck').doc("ailaTest");
    // 上次獲取的Spy資料
    let lastSteamSpyData:steamSpaDataType[] = [];
    // 上一次更新到的[第N個，id]
    let lastInputData:[number,number] = [-1,-1];
    // 統計種類， string[] < == > Set<string> 避免重複，且能全部整理。 
    let categoryList: Set<string> = new Set();
    // 關鍵字搜尋key 
    let searchTotalKey :Set<string> = new Set();

    console.log('進行查詢');
    try{
        // 或取上一次資料刷新資料時間
        const getData = await TimePosition.get();
        if(!getData.exists){
            throw Error("更新時間錯誤，取無資料")
        }
        const statusData = getData.data() as reStaetState;
        console.log('資料讀取完成')
        // 更新firebase那邊 進行準備
        if(statusData.status !== "ready"){
            throw Error("更新中，不可進行更新")
        }else{
            await TimePosition.set({
                status:"check"
            }, { merge: true })
        }

        // 確認沒再更新 抓取上一次資料
        lastInputData = statusData.lastInputData;
        categoryList = new Set(statusData.categoryList)
        searchTotalKey = new Set(statusData.searchTotalKey)
        // 比較現在時間
        const nowTime : Date = new Date();
        const lastTime : Date = statusData.AtTime.toDate();
        const df = (nowTime.getTime() -  lastTime.getTime()) / 1000 /60 /60;
        console.log(`距離上次更新 ${df} 小時`)
        // 阻擋條件 上一次更新小於6小時 且 已經更新完畢(lastInputData[0] = -1)
        if(df < 6 && lastInputData[0] === -1){
            throw Error("近期已更新")
        }
    
        // 通過 去呼叫Spy資料
        const getSteamSPA =await fetch("https://steamspy.com/api.php?request=top100in2weeks",{
            method:"GET",
        }) 
        console.log("呼叫spy成功")
        const SteamSpaData =await getSteamSPA.json();
        // 處理資料 ccu = 最高再線人數
        lastSteamSpyData = Object.values(SteamSpaData).map((index:any)=>{
            return{
                appid:index.appid,
                ccu:index.ccu
            }
        })
        // 按照ccu排序
        lastSteamSpyData.sort((a,b)=>b.ccu - a.ccu);
        console.log('排序完成')
        // 位置 id都符合 則繼續搜尋下一批資料
        console.log(lastInputData);

        if(lastInputData[0] === -1){
            console.log("lastInputData[0] 為 -1")
            console.log("更新表單");
            lastInputData = [0 , lastSteamSpyData[0].appid]
            await TimePosition.set({
                AtTime:admin.firestore.FieldValue.serverTimestamp(),
                lastInputData:lastInputData,
                steamSpyData:lastSteamSpyData
            }, { merge: true })
            
        }else{
            if(lastSteamSpyData[ lastInputData[0] ].appid === lastInputData[1]){
                console.log("繼續更新")
            }else{
                console.log("更新表單");
                lastInputData = [0 , lastSteamSpyData[0].appid]
                await TimePosition.set({
                    AtTime:admin.firestore.FieldValue.serverTimestamp(),
                    lastInputData:lastInputData,
                    steamSpyData:lastSteamSpyData
                }, { merge: true })
                
            }
        }
        
        console.log("準備呼叫steam API");
        // 抓取到資料
        // 在依序讀取Steam 資料。 目前限制一次呼叫查詢10筆資料
        const limitTime : number = ((lastInputData[0] + 10) > lastSteamSpyData.length) ? lastSteamSpyData.length : (lastInputData[0] + 10) ;
        // 依序讀取資料
        let time = 0;
        const sleep = async(ms:number):Promise<void> =>{
            return new Promise(Response => 
                setTimeout(()=>{
                    console.log('等待一秒',ms)
                    Response()
                },ms)
            );
        }
        console.log(`限制 = ${limitTime}`);
        while(lastInputData[0] < limitTime){
            console.log("讀取資料")
            try{
                const steamDataJson = await fetch(`https://store.steampowered.com/api/appdetails?appids=${lastInputData[1]}&l=tchinese`).then(r => r.json());
                const uid:string = String(lastInputData[1])
                const steamData = steamDataJson[uid];
                console.log(`第${lastInputData[0]}個`)
                console.log("名稱:",steamData.data.name.toLowerCase())
                // 處理照片清單
                const imgList:string[] = steamData.data?.screenshots.map( (index:any)=>{
                    return index.path_thumbnail
                })
                // 處理兩個分類清單
                const thiscategoryList:string[] = steamData.data?.categories.map((index:any)=>{
                    categoryList.add(index.description)
                    searchTotalKey.add(index.description)
                    return index.description;
                })
                for(let i = 0 ; i < (steamData.data?.genres.length ?? 0) ; i++){
                    categoryList.add(steamData.data?.genres[i].description)
                    searchTotalKey.add(steamData.data?.genres[i].description)
                    thiscategoryList.push(steamData.data?.genres[i].description);
                }
                // 添加關鍵字搜尋 統一小寫
                const gameName:string = steamData.data.name.toLowerCase();
                const gapList : string[] = gameName.split(/\s+/);
                // 依序添加searchKey
                const searchKeyList :string[] = Array.from(thiscategoryList);
                for(let i = 0 ; i < gapList.length ; i++){
                    const gapString :string = gapList[i]
                    for(let j = 1 ; j <= gapString.length; j++){
                        const sliceString:string = gapString.slice(0,j);
                        searchKeyList.push(sliceString)
                        searchTotalKey.add(sliceString)
                    }
                }
                console.log("更新中")
                await db.collection("steamGameData").doc(uid).set({
                    appid:steamData.data.steam_appid,
                    name:steamData.data.name,
                    free:steamData.data.is_free,
                    initialValue:steamData.data?.price_overview?.initial ?? 0,
                    finalValue:steamData.data?.price_overview?.final ?? 0,
                    ccu:lastSteamSpyData[ lastInputData[0] ].ccu,

                    requireAge:steamData.data.required_age,
                    category:thiscategoryList,
                    searchKey:searchKeyList,
                
                    screenImgList:imgList,
                    descript:steamData.data?.detailed_description ?? "",
                
                    iconImg:steamData.data?.header_image,
                    shortDescript:steamData.data?.short_description,
                
                    pcRequire:steamData.data?.pc_requirements?.minimum ?? "",
                    macRequire:steamData.data?.mac_requirements?.minimum ?? "",
                    linuxRequire:steamData.data?.linux_requirements?.minimum ?? "",
                
                    creatData:steamData.data?.release_date?.date,
                    editData:admin.firestore.FieldValue.serverTimestamp(),
                })
                console.log(new Date);
            }catch(e){
                console.log(lastInputData)
                console.log(`API拒絕`);
            }
            

            

            lastInputData[0]++;
            if(lastInputData[0] === lastSteamSpyData.length){
                break;
            }else{
                lastInputData[1] = lastSteamSpyData[lastInputData[0]]?.appid ?? -1;
            }
            time++;
            if(time > 20 ){
                console.log("觸發保險機制");
                break;
            }
            await sleep(2500);
        }
        // 一輪完畢 重製
        if(lastInputData[0] >= lastSteamSpyData.length){
            lastInputData = [-1,-1];
        }

        console.log("回歸狀態");
        await TimePosition.set({
            status:"ready",
            AtTime:admin.firestore.FieldValue.serverTimestamp(),
            lastInputData:lastInputData,
            categoryList:Array.from(categoryList),
            searchTotalKey:Array.from(searchTotalKey)
        }, { merge: true } );



        return res.status(200).json({success:true,data:"更新完成"})
    }catch(e){
        const msg = e instanceof Error ? e.message : String(e)
        return res.status(500).json({success:false, data:msg});

    }finally{
        await TimePosition.set({
            status:"ready",
        }, { merge: true } );
    }
}