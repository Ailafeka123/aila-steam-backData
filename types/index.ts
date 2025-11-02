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
  steamSpyData:steamSpaDataType[],
  lastInputData:[number,number],
  categoryList:string[],
  searchTotalKey:string[],
}


export interface steamGameData {
  appid:number,
  name:string,
  free:boolean,
  initialValue:number,
  finalValue:number,
  ccu:number,

  requireAge:number,
  category:string[],
  searchKey:string[],

  screenImgList:string[],
  descript:string,

  iconImg:string,
  shortDescript:string,

  pcRequire:string,
  macRequire:string,
  linuxRequire:string,

  creatData:string,
  editData:admin.firestore.Timestamp,

}