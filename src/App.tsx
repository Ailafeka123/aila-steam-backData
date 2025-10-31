// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const apipush = async() =>{
    const res = await fetch('/api/addStore',{
      method:"POST",
    })
    console.log(res);
  }


  return (
    <>
      <main>
        <article>
          <header>
            <h2>Aila_Steam_Web 管理後臺</h2>
          </header>
          <section>
            <button onClick={()=>{apipush()}}>
              刷新資料
            </button>
          </section>
        </article>
      </main>
    </>
  )
}

export default App
