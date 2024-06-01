import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../Firebase";
import Spinner from "../components/Spinner";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, {
  EffectFade,
  Autoplay,
  Navigation,
  Pagination,
} from "swiper";
import "swiper/css/bundle";
import { FaShare, FaLocationDot } from "react-icons/fa6";
import { FaBed, FaParking, FaChair, FaBath } from "react-icons/fa";
import { getAuth } from "firebase/auth";
import Contact from "../components/Contact";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

export default function Listing() {
  const params = useParams();
  const [listing, setListing] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copyLink, setCopyLink] = useState(false);
  const [contactLandlordClicked, setContactLandlordClicked] = useState(false);
  const auth = getAuth();
  SwiperCore.use([Autoplay, Navigation, Pagination]);
  useEffect(() => {
    async function fetchListing() {
      const docRef = doc(db, "listings", params.listingId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setListing(docSnap.data());
        setIsLoading(false);
      }
    }
    fetchListing();
  }, [params.listingId]);

  if (isLoading) {
    return <Spinner />;
  }
  return (
    <main>
      <Swiper
        modules={[EffectFade]}
        slidesPerView={1}
        navigation
        pagination={{ type: "progressbar" }}
        effect="fade"
        autoplay={{ delay: 3000 }}
      >
        {listing?.imgUrls?.map((url, index) => (
          <SwiperSlide key={index}>
            <div
              className="relative w-full overflow-hidden h-[400px]"
              style={{
                backgroundImage: `url("${url}")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            ></div>
          </SwiperSlide>
        ))}
      </Swiper>
      <div
        className="fixed top-[13%] right-[3%] z-10 bg-white cursor-pointer border-2 border-gray-400 rounded-full w-12 h-12 flex justify-center items-center"
        onClick={() => {
          navigator.clipboard.writeText(window.location.href);
          setCopyLink(true);
          setTimeout(() => {
            setCopyLink(false);
          }, 2000);
        }}
      >
        <FaShare className="text-lg text-slate-500" />
      </div>
      {copyLink && (
        <p className="fixed top-[23%] right-[5%] font-semibold border-2 border-gray-400 rounded-md bg-white z-10 px-2 py-2">
          Link Copied!
        </p>
      )}
      <div className="m-4 flex flex-col md:flex-row max-w-6xl lg:mx-auto p-4 rounded-lg shadow-lg bg-white lg:space-x-5">
        <div className=" w-full ">
          <p className="text-2xl font-bold mb-3 text-blue-900 ">
            {listing?.name} - $
            {listing?.offer
              ? parseInt(listing?.discountedPrice).toLocaleString()
              : parseInt(listing?.regularPrice).toLocaleString()}
            {listing?.type === "rent" ? " / month" : null}
          </p>
          <p className="flex items-center mt-3 mb-3 font-semibold">
            <FaLocationDot className="text-green-700 mr-1" /> {listing?.address}
          </p>
          <div className="flex justify-start items-center space-x-4 w-[75%]">
            <p className="bg-red-800 w-full max-w-[200px] rounded-md p-1 text-white text-center font-semibold shadow-md">
              {listing?.type === "rent" ? "Rent" : "Sale"}
            </p>
            {listing?.offer && (
              <p className="w-full max-w-[200px] bg-green-800 rounded-md p-1 text-white text-center font-semibold shadow-md">
                $
                {(
                  parseInt(listing?.regularPrice) -
                  parseInt(listing?.discountedPrice)
                ).toLocaleString()}{" "}
                discount
              </p>
            )}
          </div>
          <p className="mt-3 mb-3">
            Description -{" "}
            <span className="font-semibold">{listing?.description}</span>
          </p>
          <ul className="flex space-x-2 items-center lg:space-x-10 text-sm font-semibold mb-6">
            <li className="flex items-center whitespace-nowrap">
              <FaBed className="text-xl mr-1" />
              {+listing.bedrooms > 1 ? `${listing?.bedrooms} Beds` : "1 Bed"}
            </li>
            <li className="flex items-center whitespace-nowrap">
              <FaBath className="text-lg mr-1" />
              {+listing.bathrooms > 1
                ? `${listing?.bathrooms} Baths`
                : "1 Bath"}
            </li>
            <li className="flex items-center whitespace-nowrap">
              <FaParking className="text-lg mr-1" />
              {listing.parking ? `Parking Spot` : "No Parking Spot"}
            </li>
            <li className="flex items-center whitespace-nowrap">
              <FaChair className="text-lg mr-1" />
              {listing.furnished ? `Furnished` : "Non Furnished"}
            </li>
          </ul>
          {listing?.userRef !== auth?.currentUser?.uid && (
            <div className="mt-6">
              {!contactLandlordClicked && (
                <button
                  className="px-7 py-3 bg-blue-600 text-white font-medium text-sm uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg w-full text-center transition duration-150 ease-in-out"
                  onClick={() => {
                    setContactLandlordClicked(true);
                  }}
                >
                  Contact Landlord
                </button>
              )}
              {contactLandlordClicked && <Contact listing={listing} />}
            </div>
          )}
        </div>
        <div className="w-full h-[200px] md:h-[400px] mt-6 md:mt-0 z-10 overflow-x-hidden md:ml-2">
          <MapContainer
            center={[listing?.geolocation?.lat, listing?.geolocation?.long]}
            zoom={13}
            scrollWheelZoom={false}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker
              position={[listing?.geolocation?.lat, listing?.geolocation?.long]}
            >
              <Popup>{listing?.address}</Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>
    </main>
  );
}
