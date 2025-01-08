    import React from "react"
    import Navbar from "../../components/navbar"

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
                        <h2>Create Your Own Unique Recipe!!</h2>
                        <p>Enter the ingredients you have in your fridge and we will provide you with a list of recipes you can make with them!</p>

                        <div className="details">
                            <div className="recipeName">
                                <label>Recipe Name:</label>
                                <input type="text" id="recipeName" name="recipeName" />
                            </div>

                            <br />
                            
                            <div className="prepTime">
                                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="remixicon">
                                    <path d="M13.7678 12.2288L15.8892 14.3501C11.293 18.9463 5.63612 20.3605 2.10059 19.6534L17.6569 4.09705L19.7783 6.21837L13.7678 12.2288Z"></path>
                                </svg>
                                <b>Prep Time: </b>
                                <div className="relative flex items-center ">
                                    <input type="number" placeholder="0" id="prepTime" name="prepTime" />
                                </div>
                                <p>minutes</p>
                            </div>

                        </div>
                </div>

                </div>
            </div>
        </main>
        )
    }