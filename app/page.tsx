"use client";
import React from "react"
import OpenAI from "openai";
import { useState } from "react";


export default function Home() {
  

  return (
    <main className='py-24'>
      <div className='container'>
        <h1 className="appName">Food Compiler</h1>
        
        <div className = 'test'>
          <div className = 'body'>
            <h2>Instructions</h2>
            <p>Enter the ingredients you have in your fridge and we will provide you with a list of recipes you can make with them!</p>
            <p>Separate each ingredient with a comma.</p>
          </div>
        </div>
      </div>

      
    </main>
  )
}