import React, { useState } from "react";
import { getAuth, updateProfile } from "firebase/auth";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../Firebase";

export default function Profile() {
  const auth = getAuth();
  const navigate = useNavigate();
  const [changeDetails, setChangeDetails] = useState(false);
  const [formData, setFormData] = useState({
    name: auth.currentUser.displayName,
    email: auth.currentUser.email,
  });
  const { name, email } = formData;
  async function onLogout() {
    await auth.signOut();
    navigate("/");
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
  return (
    <section className="max-w-6xl mx-auto flex justify-center items-center flex-col space-y-4">
      <h1 className="text-3xl text-center mt-6 font-bold">My Profile</h1>
      <div className="w-full md:w-[50%] px-3">
        <form>
          <input
            type="text"
            id="name"
            value={name}
            disabled={!changeDetails}
            onChange={onChange}
            className={`w-full px-4 py-2 mb-6 text-xl text-gray-700 bg-white-border border-gray-300 rounded transition ease-in-out ${changeDetails && "bg-red-200 focus:bg-red-400"}`}
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
      </div>
    </section>
  );
}
