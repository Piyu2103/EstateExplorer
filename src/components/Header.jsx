import React from 'react'
import Logo from '../images/Logo.png'
import { useLocation,useNavigate } from 'react-router-dom'

export default function Header() {
    const location=useLocation()
    const navigate=useNavigate()
    function pathMathRoute(route){
        if(route===location.pathname){
            return true
        }
    }
  return (
    <div className='bg-white border-b shadow-sm sticky top-0 z-50'>
        <header className='flex justify-between items-center px-3 max-w-6xl mx-auto'>
            <div>
                <img src={Logo} alt="logo" className='h-10 cursor-pointer' width={200} onClick={()=>navigate("/")}></img>
            </div>
            <div>
                <ul className='flex space-x-10'>
                    <li className={`cursor-pointer py-3 text-sm font-semibold border-b-[3px] ${pathMathRoute("/") ? "text-black border-b-red-500":"text-gray-400 border-b-transparent"}`} onClick={()=>navigate("/")}>Home</li>
                    <li className={`cursor-pointer py-3 text-sm font-semibold border-b-[3px] ${pathMathRoute("/offers") ? "text-black border-b-red-500":"text-gray-400 border-b-transparent"}`} onClick={()=>navigate("/offers")}>Offers</li>
                    <li className={`cursor-pointer py-3 text-sm font-semibold border-b-[3px] ${pathMathRoute("/sign-in") ? "text-black border-b-red-500":"text-gray-400 border-b-transparent"}`} onClick={()=>navigate("/sign-in")}>Sign in</li>
                </ul>
            </div>
        </header>
    </div>
  )
}
