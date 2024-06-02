import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "../Firebase";
import { Link } from "react-router-dom";
import ListingItem from "./ListingItem";

export default function Offers() {
  const [offerListings, setOfferListings] = useState(null);
  useEffect(() => {
    async function fetchListingWithOffers() {
      const offeringRef = collection(db, "listings");
      const q = query(
        offeringRef,
        where("offer", "==", true),
        orderBy("timestamp", "desc"),
        limit(4)
      );
      const querySnap = await getDocs(q);
      let offerListings = [];
      querySnap.forEach((offerListing) =>
        offerListings?.push({
          id: offerListing?.id,
          data: offerListing?.data(),
        })
      );
      setOfferListings(offerListings);
    }
    fetchListingWithOffers();
  }, []);
  return (
    <div>
      {offerListings?.length > 0 && (
        <div className="m-2 mb-6">
          <h2 className="px-3 text-2xl mt-6 font-semibold">
                Recent Offers
          </h2>
          <Link to="/offers">
            <p className="px-3 text-sm text-blue-600 hover:cursor-pointer hover:text-blue-800 transition duration-150 ease-in-out">
                Show more offers
            </p>
          </Link>
          <ul className="sm:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {offerListings?.map((listing)=>
                <ListingItem key={listing?.id} listing={listing?.data} id={listing?.id}/>
        )}
          </ul>
        </div>
      )}
    </div>
  );
}
