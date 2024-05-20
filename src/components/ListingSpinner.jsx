import React from 'react'
import spinner from "../assets/svg/ListingSpinner.svg"

export default function ListingSpinner() {
  return (
    <div className= 'flex items-center justify-center fixed left-0 right-0 bottom-0 top-40 z-50'>
        <div>
            <img  src={spinner} alt='Loading' className='h-24'/>
        </div>
    </div>
  )
}
