import { useState,useEffect } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [time , setTime] = useState<Date|null>(null);

  const getTime = async() =>{
    const res = await fetch('/api/addStore',{
      method:"GET",
    })
    const data = await res.json();
    if(data.success){
      console.log(data);
      setTime(data.data);
    }
  }
  // 初始化
  useEffect(()=>{
    getTime();
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
                讀取錯誤
            </h2>:
            <h2>
              上次刷新時間:{time.toLocaleString()}  
            </h2>}
            <button onClick={()=>{getTime()}}>
              刷新資料
            </button>
          </section>
        </article>
      </main>
    </>
  )
}

export default App
