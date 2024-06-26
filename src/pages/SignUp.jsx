import React, { useState } from "react";
import Key from "../assets/images/key.jpg";
import { AiFillEyeInvisible, AiFillEye } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import OAuth from "../components/OAuth";
import {getAuth,createUserWithEmailAndPassword,updateProfile} from "firebase/auth"
import {db} from "../Firebase"
import { serverTimestamp, setDoc,doc } from "firebase/firestore";
import { toast } from "react-toastify";
export default function SignIn() {
  const [formData, setFormData] = useState({
    name:"",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const { email, password,name } = formData;
  const navigate=useNavigate();
  function onChange(e) {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  }
  async function SubmitForm(e){
    e.preventDefault();
    try {
      const auth = getAuth()
      const userCredential=await createUserWithEmailAndPassword(auth,email,password);
      updateProfile(auth.currentUser,{
        displayName:name
      })
      const user=userCredential.user
      const formDateWithoutPassword={...formData}
      delete formDateWithoutPassword.password
      formDateWithoutPassword.timestamp=serverTimestamp()
      await setDoc(doc(db,"users",user.uid),formDateWithoutPassword);
      toast.success("SignUp was successful")
      navigate("/");
    } catch (error) {
      toast.error("Something Went Wrong with the Registration Details")
    }
    
  }
  return (
    <section>
      <h1 className="text-3xl text-center mt-6 font-bold">Sign Up</h1>
      <div className="flex justify-center flex-wrap items-center px-6 py-12 max-w-6xl mx-auto">
        <div className="md:w-[67%] md: mb-6 lg:w-[50%] lg:mb-12">
          <img src={Key} alt="Key" className="w-full rounded-2xl" />
        </div>
        <div className="w-full md:w-[67%] lg:w-[40%] lg:ml-20">
          <form onSubmit={SubmitForm}>
          <input
                className="w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition ease-in-out my-6"
                type="text"
                id="name"
                value={name}
                placeholder="Full Name"
                onChange={onChange}
              />
            <input
              className="w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition ease-in-out"
              type="email"
              id="email"
              value={email}
              placeholder="Email Address"
              onChange={onChange}
            />
            <div className="relative mb-6">
              <input
                className="w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition ease-in-out my-6"
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                placeholder="Password"
                onChange={onChange}
              />
              {showPassword ? (
                <AiFillEyeInvisible
                  className="absolute right-3 top-9 text-xl cursor-pointer"
                  onClick={() => setShowPassword((prevState) => !prevState)}
                />
              ) : (
                <AiFillEye
                  className="absolute right-3 top-9 text-xl cursor-pointer"
                  onClick={() => setShowPassword((prevState) => !prevState)}
                />
              )}
            </div>
            <div className="flex justify-between whitespace-nowrap text-sm sm:text-lg mb-6">
              <p>
                Have a account?
                <Link
                  to="/sign-in"
                  className="text-red-600 hover:text-red-700 transition duration-200 ease-in-out ml-1"
                >
                  Sign In
                </Link>
              </p>
              <p>
                <Link
                  to="/forgot-password"
                  className="text-blue-600 hover:text-blue-800 transition duration-200 ease-in-out"
                >
                  Forgot Password
                </Link>
              </p>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white px-7 py-3 text-sm font-medium uppercase rounded shadow-md hover:bg-blue-700 transition duration-150 ease-in-out hover:shadow-lg active:bg-blue-800"
            >
              Sign Up
            </button>
            <div className="my-4 flex items-center before:flex-1 before:border-t before:border-gray-300  after:flex-1 after:border-t after:border-gray-300">
              <p className="text-center font-semibold mx-4">OR</p>
            </div>
            <OAuth/>
          </form>
        </div>
      </div>
    </section>
  );
}
