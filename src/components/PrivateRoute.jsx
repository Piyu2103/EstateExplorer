import React from 'react'
import { Navigate, Outlet } from 'react-router-dom';
import {useAuthStatus} from "../hooks/useAuthStatus"

export default function PrivateRoute() {
    const {loggedIn,isLoading}=useAuthStatus();
    if(isLoading){
        return (
        <h3>
            Loading
        </h3>
        )
    }
else
{
  return (
    loggedIn?<Outlet/>:<Navigate to="/sign-in"/>
    )
 
    }
}
