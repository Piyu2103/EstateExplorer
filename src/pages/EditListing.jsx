import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Spinner from '../components/Spinner';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getAuth } from 'firebase/auth'
import {v4 as uuidv4} from "uuid"
import {  serverTimestamp,doc,getDoc, updateDoc } from "firebase/firestore";
import { db } from "../Firebase";
import { useNavigate, useParams } from "react-router";




export default function EditListing() {
const [geolocationEnabled,setGeolocationEnabled]=useState(true);
const [isLoading,setIsLoading]=useState(false)
const [Listing,setListing]=useState(null)

const [isMoreThan6Images,setIsMoreThan6Images]=useState(false)
const auth=getAuth();
const navigate=useNavigate();
const [formData, setFormData] = useState({
    type: "rent",
    name: "",
    bedrooms: 1,
    bathrooms: 1,
    parking: false,
    furnished: false,
    address: "",
    description: "",
    offer: false,
    regularPrice: 0,
    discountedPrice: 0,
    latitude:0,
    longitude:0,
    images:{}
  });
  const {
    type,
    name,
    bedrooms,
    bathrooms,
    parking,
    furnished,
    address,
    description,
    offer,
    regularPrice,
    discountedPrice,
    latitude,
    longitude,
    images
  } = formData;

  const params=useParams();

  useEffect(()=>{
    setIsLoading(true);
    async function fetchListings(){
        const docRef=doc(db,"listings",params?.listingId);
        const docSnap=await getDoc(docRef);
        if(docSnap.exists()){
            setListing(docSnap.data())
            setFormData({
                ...docSnap.data(),
                images:{}
            })
            setIsLoading(false)
        }else{
            navigate("/");
            toast.error("Listing does not exist!")
        }
    }
    fetchListings()
  },[params?.listingId,navigate])

  useEffect(()=>{
    if(Listing && Listing.userRef !== auth.currentUser.uid){
        toast.error("You can't edit the listing!")
        navigate("/")
    }
  },[navigate,Listing,auth])

  function onChange(e) {
    let boolean = null;
    if(e.target.value==="true"){
        boolean=true
    } 
    if(e.target.value==="false"){
        boolean=false;
    }
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (files?.length > 6) {
        setIsMoreThan6Images(true)
        toast.error("Please upload less than 6 images");
      } else {
        setFormData((prevState) => ({
          ...prevState,
          images: e.target.files,
        }));
      }
    }
    if(!e.target.files){
        setFormData((prevState)=>({
            ...prevState,
            [e.target.id]:boolean ?? e.target.value
        }))
    }  
  }


  async function onSubmit(e) {
    e.preventDefault();
    setIsLoading(true);

    if(name===""||address===""||regularPrice==="0"||(offer&&discountedPrice==="0")){
      setIsLoading(false);
      toast.error("Please enter the required information!")
      return;  
    }
    else if (isMoreThan6Images) {
      setIsLoading(false);
      toast.error("Please upload less than 6 images");
      return;
    } else if (+discountedPrice >= +regularPrice) {
      setIsLoading(false);
      toast.error("Please enter discounted price less than regular price");
      return;
    } else {
      let geolocation = {};
      if (geolocationEnabled) {
        const requestOptions = {
          method: "GET",
        };
        const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
          address
        )}&apiKey=${process.env.REACT_APP_GEO_APIFY_KEY}`;
        try {
          const response = await fetch(url, requestOptions);
          const data = await response.json();
          if (response.ok) {
            if (data.features && data.features.length > 0) {
              const location = data.features[0].properties;
              geolocation.lat = location.lat;
              geolocation.long = location.lon;
            } else {
              setIsLoading(false);
              toast.error("Please enter valid Address!");
              return;
            }
          } else {
            setIsLoading(false);
            setGeolocationEnabled(false);
            toast.error("Please enter the longitude and latitude also!");
            return;
          }
        } catch (error) {
          setIsLoading(false);
          setGeolocationEnabled(false);
          toast.error("Please enter the longitude and latitude also!");
          return;
        }
      } else {
        geolocation.lat = latitude;
        geolocation.long = longitude;
      }
      async function storeImage(image){
        return new Promise((resolve,reject)=>{
            const storage = getStorage();
            const filename=`${auth.currentUser.uid}-${image.name}-${uuidv4()}`
            const storageRef = ref(storage, filename);
            const uploadTask = uploadBytesResumable(storageRef, image);
            uploadTask.on(
              "state_changed",
              (snapshot) => {
                // Observe state change events such as progress, pause, and resume
                // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                const progress =
                  (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log("Upload is " + progress + "% done");
                switch (snapshot.state) {
                  case "paused":
                    console.log("Upload is paused");
                    break;
                  case "running":
                    console.log("Upload is running");
                    break;
                  default:
                    console.log("Something Went Wrong");
                    break;
                }
              },
              (error) => {
                // Handle unsuccessful uploads
                reject(error)
              },
              () => {
                // Handle successful uploads on complete
                // For instance, get the download URL: https://firebasestorage.googleapis.com/...
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                  resolve(downloadURL);
                });
              }
            );
        })
      }

      let imgUrls=null;

      if(images?.length){
      imgUrls=await Promise.all(
        [...images].map((image)=>storeImage(image)))
        .catch((error)=>{
            setIsLoading(false)
            toast.error("Images not Uploaded(Reduce size or Upload only image)!")
            return;
        })
      }
        let formDataCopy= {
            ...formData,
            userRef:auth.currentUser.uid,
            geolocation,
            timestamp:serverTimestamp()
        };
        if(imgUrls){
          formDataCopy={...formDataCopy,imgUrls};
        }
        delete formDataCopy.images;
        delete formDataCopy.latitude;
        delete formDataCopy.longitude;
        !formDataCopy.offer && delete formDataCopy.discountedPrice;
        try {
          if (geolocation) {
            await updateDoc(
              doc(db, "listings",params.listingId),
              formDataCopy
            );
            toast.success("Successfully updated the listing!");
            navigate(`/category/${formDataCopy?.type}/${params.listingId}`);
          }
        } catch (error) {
          toast.error("Listing is not created successfully");
        } finally {
          setIsLoading(false);
        }
    }
  }
  if(isLoading){
    return (<Spinner/>)
  }
  return (
    <main className="max-w-md px-2 mx-auto">
      <h1 className="text-3xl text-center mt-6 font-bold">Edit Listing</h1>
      <p className="mt-3">'*' is a required field</p>
      <form>
        <p className="text-xl mt-3 font-semibold">Sell / Rent</p>
        <div className="flex">
          <button
            type="button"
            id="type"
            value="sale"
            onClick={onChange}
            className={`px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full mr-3 ${
              type === "rent"
                ? "bg-white text-black"
                : "bg-slate-600 text-white"
            }`}
          >
            Sell
          </button>
          <button
            type="button"
            id="type"
            value="rent"
            onClick={onChange}
            className={`ml-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${
              type === "rent"
                ? "bg-slate-600 text-white"
                : "bg-white text-black"
            }`}
          >
            Rent
          </button>
        </div>
        <p className="text-xl mt-6 font-semibold">Name *</p>
        <input
          type="text"
          id="name"
          value={name}
          onChange={onChange}
          className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 mb-6"
          placeholder="Name"
          maxLength="32"
          minLength="6"
          required
        />
        <div className="flex space-x-6 justify-start mb-6">
          <div>
            <p className="text-lg font-semibold">Beds</p>
            <input
              type="number"
              id="bedrooms"
              value={bedrooms}
              onChange={onChange}
              min="1"
              max="50"
              required
              className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 text-center"
            />
          </div>
          <div>
            <p className="text-lg font-semibold">Baths</p>
            <input
              type="number"
              id="bathrooms"
              value={bathrooms}
              onChange={onChange}
              min="1"
              max="50"
              required
              className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 text-center"
            />
          </div>
        </div>
        <p className="text-xl mt-6 font-semibold">Parking spot</p>
        <div className="flex">
          <button
            type="button"
            id="parking"
            value={true}
            onClick={onChange}
            className={`px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full mr-3 ${
              !parking ? "bg-white text-black" : "bg-slate-600 text-white"
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            id="parking"
            value={false}
            onClick={onChange}
            className={`ml-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${
              !parking ? "bg-slate-600 text-white" : "bg-white text-black"
            }`}
          >
            No
          </button>
        </div>
        <p className="text-xl mt-6 font-semibold">Furnished</p>
        <div className="flex">
          <button
            type="button"
            id="furnished"
            value={true}
            onClick={onChange}
            className={`px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full mr-3 ${
              !furnished ? "bg-white text-black" : "bg-slate-600 text-white"
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            id="furnished"
            value={false}
            onClick={onChange}
            className={`ml-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${
              !furnished ? "bg-slate-600 text-white" : "bg-white text-black"
            }`}
          >
            No
          </button>
        </div>
        <p className="text-xl mt-6 font-semibold">Address *</p>
        <input
          type="text"
          id="address"
          value={address}
          onChange={onChange}
          className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 mb-6"
          placeholder="Address"
          maxLength="80"
          required
        />
        {!geolocationEnabled && (
            <div className="flex space-x-6 justify-start">
                <div className="w-full">
                    <p className="text-xl font-semibold">
                        Latitude
                    </p>
                    <input type="number" id="latitude" value={latitude} onChange={onChange} required min="-90" max="90"
                    className="w-full transition duration-150 ease-in-out px-4 py-2 text-center text-xl text-gray-300 border border-gray-300 bg-white rounded focus:text-gray-700 focus:bg-white focus:border-slate-600 mb-6"
                    />
                </div>
                <div className="w-full">
                    <p className="text-xl font-semibold">
                        Longitude
                    </p>
                    <input type="number" id="longitude" value={longitude} onChange={onChange} required min="-180" max="180"
                    className="w-full transition duration-150 ease-in-out px-4 py-2 text-center text-xl text-gray-300 border border-gray-300 bg-white rounded focus:text-gray-700 focus:bg-white focus:border-slate-600 mb-6"
                    />
                </div>
            </div>
        )}
        <p className="text-xl font-semibold">Description</p>
        <input
          type="text"
          id="description"
          value={description}
          onChange={onChange}
          className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 mb-6"
          placeholder="Description"
          maxLength="80"
        />
        <p className="text-xl font-semibold">Offer</p>
        <div className="flex mb-6">
          <button
            type="button"
            id="offer"
            value={true}
            onClick={onChange}
            className={`px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full mr-3 ${
              !offer ? "bg-white text-black" : "bg-slate-600 text-white"
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            id="offer"
            value={false}
            onClick={onChange}
            className={`ml-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${
              !offer ? "bg-slate-600 text-white" : "bg-white text-black"
            }`}
          >
            No
          </button>
        </div>
        <div className="mb-6 items-center">
          <div className="flex items-center">
            <p className="text-xl font-semibold">Regular Price *</p>
          </div>
          <div className="flex w-full justify-center items-center space-x-6">
            <input
              type="number"
              id="regularPrice"
              value={regularPrice}
              onChange={onChange}
              className="w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition duration-150 ease-in-out
              focus:text-gray-700 focus:bg-white focus:border-slate-600 text-center "
              max="400000000"
              min="50"
              required
            />
            {type === "rent" ? (
              <div className="">
                <p className="text-md w-full whitespace-nowrap">$ / Month</p>
              </div>
            ) : null}
          </div>
        </div>
        {offer && (
          <div className="mb-6 items-center">
            <div className="flex items-center">
              <p className="text-xl font-semibold">Discounted Price *</p>
            </div>
            <div className="flex w-full justify-center items-center space-x-6">
              <input
                type="number"
                id="discountedPrice"
                value={discountedPrice}
                onChange={onChange}
                className="w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition duration-150 ease-in-out
                focus:text-gray-700 focus:bg-white focus:border-slate-600 text-center"
                max="400000000"
                min="50"
                required
              />
              {type === "rent" ? (
                <div className="">
                  <p className="text-md w-full whitespace-nowrap">$ / Month</p>
                </div>
              ) : null}
            </div>
          </div>
        )}
        <div className="mb-6">
          <p className="text-xl font-semibold">Images </p>
          <p className="text-gray-600">The first image will be the cover (max 6)</p>
          <input
            type="file"
            id="images"
            onChange={onChange}
            accept=".jpg,.png,.jpeg,.avif"
            multiple
            required
            className="w-full px-3 py-1.5 text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out 
            focus:bg-white focus:border-slate-600"
          />
        </div>
        <button type="submit"
        onClick={onSubmit}
        className="w-full mb-6 px-7 py-3 bg-blue-600 text-white font-medium text-sm uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out">
                Edit Listing
        </button>
      </form>
    </main>
  );
}
