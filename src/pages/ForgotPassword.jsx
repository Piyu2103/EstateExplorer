import React, { useState } from "react";
import Key from "../images/key.jpg";
import { Link } from "react-router-dom";
import OAuth from "../components/OAuth";
import { toast } from "react-toastify";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
export default function SignIn() {
  const [email, setEmail] = useState("");
  function onChange(e) {
    setEmail(e?.target?.value)
  }
  async function forgotPasswordSubmit(e){
    e.preventDefault();
    try {
      const auth=getAuth();
      await sendPasswordResetEmail(auth,email);
      toast.success("Email has been sent!")
    } catch (error) {
      toast.error("Email entered is not registered with us")
    }
  }
  return (
    <section>
      <h1 className="text-3xl text-center mt-6 font-bold">Forgot Password</h1>
      <div className="flex justify-center flex-wrap items-center px-6 py-12 max-w-6xl mx-auto">
        <div className="md:w-[67%] md: mb-6 lg:w-[50%] lg:mb-12">
          <img src={Key} alt="Key" className="w-full rounded-2xl" />
        </div>
        <div className="w-full md:w-[67%] lg:w-[40%] lg:ml-20">
          <form>
            <input
              className="w-full px-4 py-2 mb-6 text-xl text-gray-700 bg-white border-gray-300 rounded transition ease-in-out"
              type="email"
              id="email"
              value={email}
              placeholder="Email Address"
              onChange={onChange}
            />
            <div className="flex justify-between whitespace-nowrap text-sm sm:text-lg mb-6">
              <p>
                Don't have a account?
                <Link
                  to="/sign-up"
                  className="text-red-600 hover:text-red-700 transition duration-200 ease-in-out ml-1"
                >
                  Register
                </Link>
              </p>
              <p>
                <Link
                  to="/sign-in"
                  className="text-blue-600 hover:text-blue-800 transition duration-200 ease-in-out"
                >
                  Sign in instead
                </Link>
              </p>
            </div>
            <button
              type="submit"
              onClick={forgotPasswordSubmit}
              className="w-full bg-blue-600 text-white px-7 py-3 text-sm font-medium uppercase rounded shadow-md hover:bg-blue-700 transition duration-150 ease-in-out hover:shadow-lg active:bg-blue-800"
            >
              Send Reset Password
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
