import { db } from "../lib/admin";
import admin from "firebase-admin";

export default async function handler(req:Request, res:Response){
    console.log('觸發api測試');
    const data = db.collection('steamCheck').doc("ailaTest");
    console.log("進行刷新");
    data.set({
        AtTime : admin.firestore.FieldValue.serverTimestamp()
        }
    )
    console.log("完成時間刷新")
}