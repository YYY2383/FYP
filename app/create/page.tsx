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

                            <div className="prepTime">
                                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor">
                                    <path d="M13.7678 12.2288L15.8892 14.3501C11.293 18.9463 5.63612 20.3605 2.10059 19.6534L17.6569 4.09705L19.7783 6.21837L13.7678 12.2288Z"></path>
                                </svg>
                                <b>Prep Time: </b>
                                <div>
                                    <input type="number" placeholder="0" id="prepTime" name="prepTime" />
                                </div>
                                <p>minutes</p>
                            </div>
                            <div className="cookTime">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12h20"></path><path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8"></path><path d="m4 8 16-4"></path><path d="m8.86 6.78-.45-1.81a2 2 0 0 1 1.45-2.43l1.94-.48a2 2 0 0 1 2.43 1.46l.45 1.8"></path></svg>
                                <b>Cook Time: </b>
                                <div>
                                    <input type="number" placeholder="0" id="cookTime" name="cookTime" />
                                </div>
                                <p>minutes</p>    
                            </div>
                            <div className="servings">
                                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8.597 3.2A1 1 0 0 0 7.04 4.289a3.49 3.49 0 0 1 .057 1.795 3.448 3.448 0 0 1-.84 1.575.999.999 0 0 0-.077.094c-.596.817-3.96 5.6-.941 10.762l.03.049a7.73 7.73 0 0 0 2.917 2.602 7.617 7.617 0 0 0 3.772.829 8.06 8.06 0 0 0 3.986-.975 8.185 8.185 0 0 0 3.04-2.864c1.301-2.2 1.184-4.556.588-6.441-.583-1.848-1.68-3.414-2.607-4.102a1 1 0 0 0-1.594.757c-.067 1.431-.363 2.551-.794 3.431-.222-2.407-1.127-4.196-2.224-5.524-1.147-1.39-2.564-2.3-3.323-2.788a8.487 8.487 0 0 1-.432-.287Z"/>
                                </svg>
                                <b>Servings: </b>
                                <div>
                                    <input type="number" placeholder="0" id="servings" name="servings" />
                                </div>
                                <p>servings</p>
                            </div>    
                        </div>
                </div>

                </div>
            </div>
        </main>
        )
    }