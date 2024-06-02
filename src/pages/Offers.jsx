import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import { db } from "../Firebase";
import Spinner from "../components/Spinner";
import { toast } from "react-toastify";
import ListingItem from "../components/ListingItem";

export default function Offers() {
  const [listings, setListings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastFetchedListing, setLastFetchListing] = useState(null);
  const [noOfListingsWithOffers, setNoOfListingsWithOffers] = useState(0);
  async function fetchOfferListing(offerListingLimit = 4) {
    try {
      const offersRef = collection(db, "listings");
      const noOfListingsWithOffers = await getDocs(
        query(offersRef, where("offer", "==", true))
      );
      setNoOfListingsWithOffers(noOfListingsWithOffers.size);
      const q = query(
        offersRef,
        where("offer", "==", true),
        orderBy("timestamp", "desc"),
        limit(offerListingLimit)
      );
      const querySnap = await getDocs(q);
      let offerListings = [];
      querySnap?.forEach((listing) =>
        offerListings?.push({
          id: listing?.id,
          data: listing?.data(),
        })
      );
      setLastFetchListing(querySnap.docs[querySnap.docs.length - 1]);
      setListings(offerListings);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      toast.error("Could not fetch the listings!");
    }
  }

  async function fetchMoreListing() {
    setIsLoading(true);
    try {
      const listingRef = collection(db, "listings");
      const q = query(
        listingRef,
        where("offer", "==", true),
        orderBy("timestamp", "desc"),
        startAfter(lastFetchedListing),
        limit(4)
      );
      const querySnap = await getDocs(q);
      let offerListings = [];
      querySnap?.forEach((listing) =>
        offerListings?.push({
          id: listing?.id,
          data: listing?.data(),
        })
      );
      setLastFetchListing(querySnap.docs[querySnap.docs.length - 1]);
      setListings((prevState) => [...prevState, ...offerListings]);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      toast.error("No more listing found!");
    }
  }

  useEffect(() => {
    fetchOfferListing();
  }, []);
  return (
    <div className="max-w-6xl mx-auto px-3">
      <h1 className="text-3xl text-center mt-6 font-bold">Offers</h1>
      {isLoading ? (
        <Spinner />
      ) : listings && listings?.length > 0 ? (
        <>
          <main className="mt-6">
            <ul className="sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {listings?.map(({ data, id }) => (
                <ListingItem key={id} listing={data} id={id} />
              ))}
            </ul>
          </main>
          {noOfListingsWithOffers > listings?.length && lastFetchedListing && (
            <div className="flex justify-center items-center">
              <button
                className="bg-white px-3 py-1.5 text-gray-700 border border-gray-300 mt-6 mb-6 hover:border-slate-600 transition duration-150 ease-in-out rounded"
                onClick={() => {
                  fetchMoreListing();
                }}
              >
                Load More
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="mt-6 text-xl font-medium">
          Currently, there are no offers running!
        </p>
      )}
    </div>
  );
}
