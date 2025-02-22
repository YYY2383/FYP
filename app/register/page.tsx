"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, {useState} from "react"
import { createUserWithEmailAndPassword } from "firebase/auth";
import {db, auth} from '../firebaseConfig'
import {doc, setDoc} from 'firebase/firestore'
import { useRouter } from "next/navigation";
import Link from "next/link";


export default function Register() {
    const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      // Store user details in Firestore
      await setDoc(doc(db, "users", user.uid), {
        name: formData.name,
        email: formData.email,
        uid: user.uid,
        createdAt: new Date(),
      });

      // Redirect to home page
      router.push("/");
    } catch (error: any) {
      console.error("Error signing up:", error.message);
      alert(error.message);
    }
  };


   return (
    <main className="main">
        <div className="container">
        <h1 className="appName">Food Compiler</h1>
            <div className="body">
                <div className="registerForm">
                    <form className="form" onSubmit={handleSubmit}>
                    <p className="title">Register </p>
                        <div className="flex-column">
                            <label>Name </label>
                        </div>
                        <div className="inputForm">
                            <svg
                            height="60"
                            viewBox="0 -9 32 32"
                            width="40"
                            xmlns="http://www.w3.org/2000/svg"
                            >
                            <g id="Layer_3" data-name="Layer 3">
                                <path
                                d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5 6s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zM11 3.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5m.5 2.5a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1zm2 3a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1zm0 3a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1z"
                                ></path>
                            </g>
                            </svg>
                            <input type="text" name="name" className="input" placeholder="Enter your Name" value={formData.name} onChange={handleChange} required />
                        </div>
                        <div className="flex-column">
                            <label>Email </label>
                        </div>
                        <div className="inputForm">
                            <svg
                            height="20"
                            viewBox="0 0 32 32"
                            width="20"
                            xmlns="http://www.w3.org/2000/svg"
                            >
                            <g id="Layer_3" data-name="Layer 3">
                                <path
                                d="m30.853 13.87a15 15 0 0 0 -29.729 4.082 15.1 15.1 0 0 0 12.876 12.918 15.6 15.6 0 0 0 2.016.13 14.85 14.85 0 0 0 7.715-2.145 1 1 0 1 0 -1.031-1.711 13.007 13.007 0 1 1 5.458-6.529 2.149 2.149 0 0 1 -4.158-.759v-10.856a1 1 0 0 0 -2 0v1.726a8 8 0 1 0 .2 10.325 4.135 4.135 0 0 0 7.83.274 15.2 15.2 0 0 0 .823-7.455zm-14.853 8.13a6 6 0 1 1 6-6 6.006 6.006 0 0 1 -6 6z"
                                ></path>
                            </g>
                            </svg>
                            <input type="text" name="email" className="input" placeholder="Enter your Email" value={formData.email} onChange={handleChange} required />
                        </div>

                        <div className="flex-column">
                            <label>Password </label>
                        </div>
                        <div className="inputForm">
                            <svg
                            height="20"
                            viewBox="-64 0 512 512"
                            width="20"
                            xmlns="http://www.w3.org/2000/svg"
                            >
                            <path
                                d="m336 512h-288c-26.453125 0-48-21.523438-48-48v-224c0-26.476562 21.546875-48 48-48h288c26.453125 0 48 21.523438 48 48v224c0 26.476562-21.546875 48-48 48zm-288-288c-8.8125 0-16 7.167969-16 16v224c0 8.832031 7.1875 16 16 16h288c8.8125 0 16-7.167969 16-16v-224c0-8.832031-7.1875-16-16-16zm0 0"
                            ></path>
                            <path
                                d="m304 224c-8.832031 0-16-7.167969-16-16v-80c0-52.929688-43.070312-96-96-96s-96 43.070312-96 96v80c0 8.832031-7.167969 16-16 16s-16-7.167969-16-16v-80c0-70.59375 57.40625-128 128-128s128 57.40625 128 128v80c0 8.832031-7.167969 16-16 16zm0 0"
                            ></path>
                            </svg>
                            <input type="password" name="password" className="input" placeholder="Enter your Password" value={formData.password} onChange={handleChange} required />
                        </div>

                        <button type="submit" className="button-submit">Sign Up</button>
                            <p className="p">Already have a account? <Link href="/"><span className="span">login</span></Link></p>
                        </form>

                </div>
            </div>
        </div>
    </main>
   )
}