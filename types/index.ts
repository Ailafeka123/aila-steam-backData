import type admin from 'firebase-admin';

export type Res<T> = {
  status: (code: number) => Res<T>;
  json: (data: T) => void;
};


export type ResType<T> =
    | {success:true,  data:T}
    | {success:false, data:string};


export interface steamSpaDataType {
  appid:number,
  ccu:number
}

export interface reStaetState {
  AtTime:admin.firestore.Timestamp,
  status:string,
  steamSpyData:steamSpaDataType[]
}