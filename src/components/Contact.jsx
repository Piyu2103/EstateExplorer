import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "../Firebase";
import { toast } from "react-toastify";

export default function Contact(props) {
  const [landlord, setLandlord] = useState(null);
  const [message, setMessage] = useState("");
  useEffect(() => {
    async function getLandlord() {
      const docRef = doc(db, "users", props?.listing?.userRef);
      const docSnap = await getDoc(docRef);
      if (docSnap?.exists()) {
        setLandlord(docSnap.data());
      } else {
        toast.error("Could not get landlord data!");
      }
    }
    getLandlord();
  }, [props?.listing]);
  function onChange(e) {
    setMessage(e.target.value);
  }
  return (
    <>
      {landlord && (
        <div className="flex flex-col w-full">
          <p className="">
            Contact {landlord?.name} for the {props?.listing?.name}
          </p>
          <div className="mt-3 mb-6">
            <textarea
              name="message"
              id="message"
              rows="2"
              value={message}
              onChange={onChange}
              className="w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 border rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600"
            />
          </div>
          <a
            href={`mailto:${landlord?.email}?Subject=${props?.listing?.name}&body=${message}`}
          >
            <button className="px-7 py-3 bg-blue-600 text-white rounded text-sm uppercase shadow-md hover:bg-blue-700 hover:shadow-lg  focus:bg-blue-700 focus:shadow-lg  active:bg-blue-700 active:shadow-lg transition duration-150 ease-in-out text-center mb-6" type="button">Send the Mail</button>
          </a>
        </div>
      )}
    </>
  );
}
