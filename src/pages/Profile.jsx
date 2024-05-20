import React, { useEffect, useState } from "react";
import { getAuth, updateProfile } from "firebase/auth";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc,where } from "firebase/firestore";
import { db } from "../Firebase";
import { FcHome } from "react-icons/fc";
import { Link } from "react-router-dom";
import ListingItem from "../components/ListingItem";
import ListingSpinner from "../components/ListingSpinner";




export default function Profile() {
  const auth = getAuth();
  const navigate = useNavigate();
  const [changeDetails, setChangeDetails] = useState(false);
  const [listings,setListings]=useState(null);
  const [isLoading,setIsLoading]=useState(false);
  const [formData, setFormData] = useState({
    name: auth.currentUser.displayName,
    email: auth.currentUser.email,
  });
  const { name, email } = formData;
  async function onLogout() {    
    await auth.signOut();
    navigate("/");
  }
  async function onDelete(listingID){
      if(window.confirm("Are you sure you want to delete?")){
        await deleteDoc(doc(db,"listings",listingID))
        const updateListings=listings.filter(listing=>listing.id !==listingID)
        setListings(updateListings)
        toast.success("Successfully deleted the listing!")
      }
  }
  function onEdit(listingID){
      navigate(`/edit-listing/${listingID}`)
  }
  async function onSubmit(){
    try {
      if(auth.currentUser.displayName!==name){
        await updateProfile(auth.currentUser,{
          displayName:name,
        })
      }
      const docRef=doc(db,"users",auth.currentUser.uid)
      await updateDoc(docRef,{
        name,
      })

    } catch (error) {
      toast.error("Could not update the profile details!")
    }
  }
  function OnEdit() {
    changeDetails && onSubmit();
    setChangeDetails((prevState) => !prevState);
  }
  function onChange(e){
    setFormData((prevState)=>({
      ...prevState,
      [e.target.id]:e.target.value
    })
  )}
  useEffect(()=>{
    const fetchUserListings = async () => {
      setIsLoading(true);
      try {
        const listingRef = collection(db, "listings");
        const userListingsQuery = query(
          listingRef,
          where("userRef", "==", auth.currentUser.uid),
          orderBy("timestamp", "desc")
        );
        const querySnap = await getDocs(userListingsQuery);

        let listings = [];
        querySnap.forEach(element => {
          listings.push({
            id: element.id,
            data: element.data() // Call data() to retrieve the document data
          });
        });

        setListings(listings);
      } catch (error) {
        toast.error("Error fetching user listings")
      } finally {
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
        
      }
    };

    fetchUserListings();
  },[auth.currentUser.uid])

  useEffect(()=>{
    console.log(listings,"listings");
  },[listings])


  return (
    <>
    <section className="max-w-6xl mx-auto flex justify-center items-center flex-col space-y-4 mb-6">
      <h1 className="text-3xl text-center mt-6 font-bold">My Profile</h1>
      <div className="w-full md:w-[50%] px-3">
        <form>
          <input
            type="text"
            id="name"
            value={name}
            disabled={!changeDetails}
            onChange={onChange}
            className={`w-full px-4 py-2 mb-6 text-xl text-gray-700 bg-white-border border-gray-300 rounded transition ease-in-out ${
              changeDetails && "bg-red-200 focus:bg-red-400"
            }`}
          />
          <input
            type="email"
            id="email"
            value={email}
            disabled={!changeDetails}
            onChange={onChange}
            className={`w-full px-4 py-2 mb-6 text-xl text-gray-700 bg-white-border border-gray-300 rounded transition ease-in-out`}
          />
          <div className="flex justify-between whitespace-nowrap text-sm sm:text-lg mb-6">
            <p className="flex items-center">
              Do you want to change your name?
              <span
                onClick={OnEdit}
                className="text-red-600 hover:text-red-700 transition ease-in-out duration-200 ml-1 cursor-pointer"
              >
                {changeDetails ? "ApplyChange" : "Edit"}
              </span>
            </p>
            <p
              onClick={onLogout}
              className="text-blue-600 hover:text-blue-800 transition ease-in-out duration-200 cursor-pointer"
            >
              Sign Out
            </p>
          </div>
        </form>
        <button className="w-full bg-blue-600 text-white uppercase px-7 py-3 text-sm font-medium rounded shadow-md hover:bg-blue-700 transition duration-150 ease-in-out hover:shadow-lg active:bg-blue-800">
          <Link
            to="/create-listing"
            className="flex items-center justify-center"
          >
            <FcHome className="mr-2 text-3xl bg-red-200 rounded-full p-1 border-2" /> Sell or Rent your home
          </Link>
        </button>
      </div>
    </section>
    <div>
      {isLoading && <ListingSpinner/>}
      {!isLoading && listings?.length!==0 && (
        <>
          <h2 className="text-2xl text-center font-semibold">
            My Listings
          </h2>
          <ul className="sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl: grid-cols-5 mt-6 mb-6">
            {listings?.map((listing)=>(
              <ListingItem key={listing?.id} id={listing?.id} listing={listing?.data} onDelete={()=>onDelete(listing.id)} onEdit={()=>onEdit(listing.id)}/>
            ))}
          </ul>
        </>
      )}
    </div>
    </>

  );
}
