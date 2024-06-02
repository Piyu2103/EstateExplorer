import React from 'react'
import SliderHome from '../components/SliderHome'
import Offers from '../components/Offers'
import PlacesForRent from '../components/PlacesForRent'
import PlacesForSale from '../components/PlacesForSale'


export default function Home() {
  return (
    <div>
      <SliderHome/>
      <div className='max-w-6xl mx-auto pt-4 space-y-6'>
      <Offers/>
      <PlacesForSale/>
      <PlacesForRent/>
      </div>
      </div>
  )
}
