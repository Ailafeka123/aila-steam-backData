export type Res<T> = {
  status: (code: number) => Res<T>;
  json: (data: T) => void;
};


export type ResType<T> =
    | {success:true,  data:T}
    | {success:false, data:string};