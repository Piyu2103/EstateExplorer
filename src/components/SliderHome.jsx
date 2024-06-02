import React, { useEffect, useState } from 'react'
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { db } from '../Firebase';
import Spinner from '../components/Spinner';
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, {
    EffectFade,
    Autoplay,
    Navigation,
    Pagination,
  } from "swiper";
import "swiper/css/bundle";
import { useNavigate } from 'react-router-dom';

export default function SliderHome() {
    const [listings,setListings]=useState(null);
    const [isLoading,setIsLoading]=useState(true);
    const navigate=useNavigate();
    SwiperCore.use([Autoplay, Navigation, Pagination]);
    useEffect(()=>{
      async function fetchListings(){
          const listingRef=collection(db,"listings");
          const q=query(listingRef,orderBy("timestamp","desc"),limit(5));
          const querySnap=await getDocs(q);
          let listings=[];
          querySnap.forEach((doc)=>{
            return listings?.push({
              id:doc.id,
              data:doc.data()
            })
          })
          console.log(listings);
          setListings(listings)
          setIsLoading(false);
      }
      fetchListings();
    },[])
    if(isLoading){
      return <Spinner/>
    }
    if(listings?.length===0){
      return <></>
    }
    return (
        listings && (
            <>
        <Swiper
        modules={[EffectFade]}
        slidesPerView={1}
        navigation
        pagination={{ type: "progressbar" }}
        effect="fade"
        autoplay={{ delay: 3000 }}
      >
        {listings?.map((listing) => (
          <SwiperSlide key={listing?.id} onClick={()=>navigate(`/category/${listing?.data?.type}/${listing?.id}`)}>
            <div
              className="relative w-full overflow-hidden h-[400px]"
              style={{
                backgroundImage: `url("${listing?.data?.imgUrls[0]}")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            ></div>
            <p className='text-white absolute left-1 top-3 font-medium max-w-[90%] bg-[#457b9d] shadow-lg opacity-90 p-2 rounded-br-3xl'>
                {listing?.data?.name}
            </p>
            <p className='text-white absolute left-1 bottom-1 font-semibold max-w-[90%] bg-[#e63946] shadow-lg opacity-90 p-2 rounded-tr-3xl'>
                ${parseInt(listing?.data?.offer?listing?.data?.discountedPrice:listing?.data?.regularPrice).toLocaleString()} {listing?.data?.type==="rent" ?" / month":""}
            </p>
          </SwiperSlide>
        ))}
      </Swiper>
            </>
        )
        
    )
}
