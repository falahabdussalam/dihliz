"use client";

import DoneModal from "@/components/admission/doneModel";
import Register from "@/components/admission/register";
import Footer from "@/components/common/footer";
import NavBar from "@/components/common/nav";
import PageHeader from "@/components/common/page_header";
import login from "@/functions/admission/login";
import { useRouter } from "next/navigation";
import { useState } from "react";

const Admission = () => {
    const [phone, setPhone] = useState<string>('');
    const [dob, setDob] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [registering, setRegistering] = useState<boolean>(false);
   
  
    function loginUser(e: any){
        e.preventDefault();
       if(phone.length<9){
        setError("Please enter a valid phone number")
       }
       else if(dob.length<7){
        setError("Pleaase select a valid date of birth")
       }
       else{
        setError("");
        setRegistering(true);
        login(phone, dob).then((res) =>{
            setRegistering(false);
            
            if(res.data.status=="available"){
                localStorage.setItem("phone", phone);
                localStorage.setItem("dob", dob);
                router.push("/admission/dashboard")
            }
           else if(res.data.status=="empty"){
            setError("Not registered. Please register to continue.")
            }else{
                setError("Something went wrong")
            }
        })
       }
}   

    const router = useRouter();
    return (
        <div >
            
             <NavBar active="Admission"/>
             <section className="px-8 lg:px-32 bg-lime-50">
              <PageHeader title="Admission at DIHLIZ"/>  
<section className="grid lg:grid-cols-2">
    <div className="px-8 flex justify-center">
        <img src="/img/admission.svg" className="rounded-2xl w-10/12  lg:w-8/12 mover-item" alt="" />
    </div>
    <div className="px-8 pb-20 pt-6 lg:pt-0 text-justify">
    <p className=" text-black">
    Three phase admission process of Dihliz gives the applicant entry into the courses. 
    The phases are Online Application, Written Test and Face to Face Interview respectively. 
    No sideway entry is entertained to be admitted at any circumstances into any of the courses but compulsory to go 
    though each phases to be enrolled. 
    The confirmation of admission will be sent through official mail after the admission process.
</p>
    </div>
</section>

<br />  
<br /> 
             </section>
             <PageHeader title="Admission Portal"/>
             <section className="flex flex-col justify-center items-center ">
                <div className="w-11/12 lg:w-3/12">
                   

<form onSubmit={loginUser}>
{error.length>3 && <div className=" text-white  px-3 py-1 rounded-lg bg-red-600">{error}</div>}

<span className="inline-block text-gray-500 text-sm mt-1">Registered Phone</span>
                <input type="number" className="w-full input input-primary my-2" placeholder="Phone Number"
                onChange={(e) => setPhone(e.target.value)}
                required />
                <span className="inline-block text-gray-500 text-sm mt-1">Date of Birth</span>
                    <input type="date" className="w-full input input-primary my-2" placeholder="Date of Birth"
                    onChange={(e) => setDob(e.target.value)}
                    required />
                    <input type="submit" className="btn btn-primary w-full text-white" 
                    value={registering ? "Logging In..." : "Login"}
                    disabled={registering}
                    />
</form>

                    <br />
                    <br />
                    <div className="text-center text-dihliz-500">Not registered yet?
                    <br />
                     <div className="flex justify-center mt-2">
                     <label htmlFor="register" className="btn btn-primary bg-red-600 hover:bg-red-700 text-white">Register Now</label>

                     </div>
                    </div>
                   
                </div>
                    

                
                </section>  

    <div className="h-44 bg-white"></div>
             <Footer/>
             <Register/>
             <DoneModal/>
        </div>
    );
}

export default Admission;