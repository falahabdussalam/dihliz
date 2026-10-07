"use client";

import registerNew from "@/functions/admission/regsiter";
import { useState } from "react";

const Register = () => {
  const [phone, setPhone] = useState<string>("");
  const [dob, setDob] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [registering, setRegistering] = useState<boolean>(false);

  function register(e: any) {
    e.preventDefault();
    if (phone.length < 9) {
      setError("Please enter a valid phone number");
    } else if (dob.length < 7) {
      setError("Pleaase select a valid date of birth");
    } else {
      setError("");
      setRegistering(true);
      registerNew(phone, dob).then((res) => {
        setRegistering(false);
        if (res.data.status == "exists") {
          setError("This number is already registered");
        } else if (res.data.status == "success") {
          document.getElementById("register")?.click();
          document.getElementById("doneModal")?.click();
          localStorage.setItem("phone", phone);
          localStorage.setItem("dob", dob);
          window.location.href = "/admission/dashboard";
        } else {
          setError("Something went wrong");
        }
      });
    }
  }

  return (
    <div>
      <input type="checkbox" id="register" className="modal-toggle" />
      <label htmlFor="register" className="modal cursor-pointer">
        <label className="modal-box relative" htmlFor="">
          <h3 className="text-2xl text-dihliz-500 font-bold">
            Register to DIHLIZ Admission Portal
          </h3>{" "}
          <br />
          <form onSubmit={register}>
            {error.length > 3 && (
              <div className=" text-white  px-3 py-1 rounded-lg bg-red-600">
                {error}
              </div>
            )}

            <span className="inline-block text-gray-500 text-sm mt-1">
              Phone No.
            </span>
            <input
              type="number"
              className="w-full input input-primary my-2"
              placeholder="Phone Number"
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <span className="inline-block text-gray-500 text-sm mt-1">
              Date of Birth of Student
            </span>
            <input
              type="date"
              className="w-full input input-primary my-2"
              placeholder="Date of Birth"
              onChange={(e) => setDob(e.target.value)}
              required
            />
            <input
              type="submit"
              className="btn btn-primary w-full text-white mt-3"
              value={registering ? "Registering..." : "Register"}
              disabled={registering}
            />
          </form>
        </label>
      </label>
    </div>
  );
};

export default Register;
