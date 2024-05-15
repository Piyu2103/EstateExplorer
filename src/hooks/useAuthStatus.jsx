import { getAuth, onAuthStateChanged } from 'firebase/auth'
import React, { useEffect, useState } from 'react'

export function useAuthStatus() {
    const [loggedIn,setLoggedIn]=useState(false)
    const [isLoading,setIsLoading]=useState(true)

    useEffect(()=>{
        const auth=getAuth()
        onAuthStateChanged(auth,(user)=>{
            if(user){
                setLoggedIn(true)   
            }
            setIsLoading(false)
        })
    },[])

  return (
   {loggedIn,isLoading}
  )
}
