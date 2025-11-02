import { useState,useEffect,useRef} from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [time , setTime] = useState<string|null>(null);
  const [errorText, setErrorText] = useState<String>("");
  const coldDown = useRef<boolean>(false);
  const reSetColdDown = useRef<boolean>(false);
  // 抓取當下時間
  const getTimeFunc = async() =>{
    if(coldDown.current === true) return;
    coldDown.current = true;
    try{
      const res = await fetch('/api/getTime',{
        method:"GET",
      })
      const data = await res.json();
      if(data.success){
        console.log(data);
        setTime(data.data);
      }
    }catch(e){

    }finally{
      coldDown.current = false;
    }
  }
  // 刷新steam資料
  const reSetData = async() =>{
    if(reSetColdDown.current)return;
    reSetColdDown.current = true;
    try{
      setErrorText("更新中...")
      const res = await fetch('/api/getNewData',{
        method:"GET",
      });
      const data = await res.json();

      if(data.success === false){
        setErrorText(data.data);
      }else{
        // 刷新時間
        setErrorText("更新完成")
        await getTimeFunc();
      }
    }catch(e){
      console.error(e);
    }finally{
      reSetColdDown.current = false;
    }
  }

  // 初始化 加載時間
  useEffect(()=>{
    console.log("這裡是初始化")
    getTimeFunc();
  },[])

  return (
    <>
      <main>
        <article>
          <header>
            <h2>Aila_Steam_Web 管理後臺</h2>
          </header>
          <section>
            {time === null? <h2>
                時間讀取中...
            </h2>:
            <h2>
              上次刷新時間:台灣時間(+8) {time}  
            </h2>}
            <h3>
              {errorText}
            </h3>
            <button onClick={()=>{reSetData()}}>
              刷新資料
            </button>
          </section>
        </article>
      </main>
    </>
  )
}

export default App
