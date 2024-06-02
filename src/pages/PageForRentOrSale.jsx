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
import { useParams } from "react-router-dom";

export default function PageForRentOrSale() {
  const [listings, setListings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastFetchedListing, setLastFetchListing] = useState(null);
  const [noOfListingsWithCategory, setNoOfListingsWithCategory] = useState(0);
  const params=useParams()
  async function fetchCategoryListing(categoryListingLimit = 8) {
    try {
      const categoryRef = collection(db, "listings");
      const noOfListingsWithCategories = await getDocs(
        query(categoryRef, where("type", "==", params?.categoryName))
      );
      setNoOfListingsWithCategory(noOfListingsWithCategories.size);
      const q = query(
        categoryRef,
        where("type", "==", params?.categoryName),
        orderBy("timestamp", "desc"),
        limit(categoryListingLimit)
      );
      const querySnap = await getDocs(q);
      let categoryListings = [];
      querySnap?.forEach((listing) =>
        categoryListings?.push({
          id: listing?.id,
          data: listing?.data(),
        })
      );
      setLastFetchListing(querySnap.docs[querySnap.docs.length - 1]);
      setListings(categoryListings);
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
        where("type", "==", params?.categoryName),
        orderBy("timestamp", "desc"),
        startAfter(lastFetchedListing),
        limit(4)
      );
      const querySnap = await getDocs(q);
      let categoryListings = [];
      querySnap?.forEach((listing) =>
        categoryListings?.push({
          id: listing?.id,
          data: listing?.data(),
        })
      );
      setLastFetchListing(querySnap.docs[querySnap.docs.length - 1]);
      setListings((prevState) => [...prevState, ...categoryListings]);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      toast.error("No more listing found!");
    }
  }

  useEffect(() => {
    fetchCategoryListing();
  },[]);
  return (
    <div className="max-w-6xl mx-auto px-3">
      <h1 className="text-3xl text-center mt-6 font-bold">Places for {params?.categoryName}</h1>
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
          {noOfListingsWithCategory > listings?.length && lastFetchedListing && (
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
          Currently, there are no listings for ${params?.categoryName} !
        </p>
      )}
    </div>
  );
}
