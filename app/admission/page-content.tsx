"use client";

import DoneModal from "@/components/admission/doneModel";
import Register from "@/components/admission/register";
import Footer from "@/components/common/footer";
import NavBar from "@/components/common/nav";
import PageHero from "@/components/common/page_hero";
import AdmissionSteps from "@/components/home/admission_steps";
import login from "@/functions/admission/login";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BsArrowRight, BsCheck2Circle } from "react-icons/bs";
import { HiOutlineMail, HiOutlinePhone } from "react-icons/hi";

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
        <div className="overflow-x-hidden bg-white">
            <NavBar active="Admission"/>
            <PageHero
                crumb="Admission"
                image="/img/academics/highschool.jpg"
                title={<>Admission at <span className="text-lime-500">Dihliz</span></>}
                subtitle="A transparent three-phase process. Confirmation of admission is sent through official mail once the process is complete."
            />

            <AdmissionSteps ctaHref="#portal"/>

            <section id="portal" className="scroll-mt-24 px-6 lg:px-32 py-24">
                <div className="grid lg:grid-cols-2 gap-8 items-stretch">
                    {/* Login */}
                    <div className="rounded-3xl bg-white p-8 lg:p-10 shadow-xl shadow-black/5 ring-1 ring-black/5" data-aos="fade-right">
                        <h2 className="text-2xl lg:text-3xl font-extrabold text-gray-900">Admission Portal</h2>
                        <p className="mt-2 text-gray-500">Already registered? Log in to continue your application.</p>

                        <form onSubmit={loginUser} className="mt-8 space-y-5">
                            {error.length>3 && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 ring-1 ring-red-100">{error}</div>}

                            <label className="block">
                                <span className="text-sm font-semibold text-gray-700">Registered Phone</span>
                                <input type="number" className="mt-2 w-full input input-bordered rounded-xl focus:border-dihliz-500 focus:outline-none" placeholder="Phone Number"
                                    onChange={(e) => setPhone(e.target.value)}
                                    required />
                            </label>
                            <label className="block">
                                <span className="text-sm font-semibold text-gray-700">Date of Birth</span>
                                <input type="date" className="mt-2 w-full input input-bordered rounded-xl focus:border-dihliz-500 focus:outline-none" placeholder="Date of Birth"
                                    onChange={(e) => setDob(e.target.value)}
                                    required />
                            </label>
                            <button type="submit" className="btn btn-primary w-full rounded-xl text-white gap-2" disabled={registering}>
                                {registering ? "Logging In..." : <>Login <BsArrowRight/></>}
                            </button>
                        </form>
                    </div>

                    {/* Register */}
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-dihliz-500 to-dihliz-600 p-8 lg:p-10 text-white" data-aos="fade-left">
                        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10"></div>
                        <div className="relative flex h-full flex-col">
                            <h2 className="text-2xl lg:text-3xl font-extrabold">New applicant?</h2>
                            <p className="mt-2 text-white/80">Register with your phone number and date of birth to begin your online application.</p>

                            <ul className="mt-8 space-y-3">
                                {["No sideway entry. Every applicant completes all three phases",
                                  "Written test and face to face interview for shortlisted applicants",
                                  "Admission confirmed via official mail"].map((item) => (
                                    <li key={item} className="flex items-start gap-3 text-sm">
                                        <BsCheck2Circle className="mt-0.5 shrink-0 text-lg text-lime-50" />
                                        {item}
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-auto pt-10">
                                <label htmlFor="register" className="btn rounded-xl w-full bg-white text-dihliz-600 hover:bg-lime-50 gap-2">
                                    Register Now <BsArrowRight/>
                                </label>
                                <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/80">
                                    <a href="tel:04952963484" className="flex items-center gap-2 hover:text-white"><HiOutlinePhone/> 0495 2963484</a>
                                    <a href="mailto:info@dihlizworldschool.com" className="flex items-center gap-2 hover:text-white"><HiOutlineMail/> info@dihlizworldschool.com</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer/>
            <Register/>
            <DoneModal/>
        </div>
    );
}

export default Admission;
