import React from 'react'
import { Navigate, Outlet } from 'react-router-dom';
import {useAuthStatus} from "../hooks/useAuthStatus"
import Spinner from './Spinner';

export default function PrivateRoute() {
    const {loggedIn,isLoading}=useAuthStatus();
    if(isLoading){
        return (
        <Spinner/>
        )
    }
else
{
  return (
    loggedIn?<Outlet/>:<Navigate to="/sign-in"/>
    )
 
    }
}
