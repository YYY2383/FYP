"use client";
import React from "react"
import Navbar from "../../components/navbar"
// import {db} from '../firebaseConfig'
// import {collection, addDoc} from 'firebase/firestore'


export default function Home() {
  

  return (
    <main className='main'>
      <div className='container'>
        <h1 className="appName">Food Compiler</h1>
        
        <div className = 'body'>
          <div>
            <Navbar />
          </div>

          <div className = 'head'>
            <h2>This is the HOME PAGE!!!!!</h2>
            
          </div>
        </div>
      </div>

      
    </main>
  )
}