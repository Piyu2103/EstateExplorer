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

export default function PlacesForSale() {
  const [saleListings, setSaleListings] = useState(null);
  useEffect(() => {
    async function fetchListingWithSale() {
      const rentRef = collection(db, "listings");
      const q = query(
        rentRef,
        where("type", "==", "sale"),
        orderBy("timestamp", "desc"),
        limit(4)
      );
      const querySnap = await getDocs(q);
      let saleListings = [];
      querySnap.forEach((saleListing) =>
        saleListings?.push({
          id: saleListing?.id,
          data: saleListing?.data(),
        })
      );
      setSaleListings(saleListings);
    }
    fetchListingWithSale();
  }, []);
  return (
    <div>
      {saleListings?.length > 0 && (
        <div className="m-2 mb-6">
          <h2 className="px-3 text-2xl mt-6 font-semibold">
                Places for Sale
          </h2>
          <Link to="/category/sale">
            <p className="px-3 text-sm text-blue-600 hover:cursor-pointer hover:text-blue-800 transition duration-150 ease-in-out">
                Show more sale places
            </p>
          </Link>
          <ul className="sm:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {saleListings?.map((listing)=>
                <ListingItem key={listing?.id} listing={listing?.data} id={listing?.id}/>
        )}
          </ul>
        </div>
      )}
    </div>
  );
}
