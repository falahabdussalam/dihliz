import Footer from "@/components/common/footer";
import HeadTag from "@/components/common/head";
import NavBar from "@/components/common/nav";
import PageHeader from "@/components/common/page_header";
import SocialIcons from "@/components/common/social";
import { useRouter } from "next/router";
import { useState } from "react";
import {HiOutlineMail,HiPhone} from 'react-icons/hi'



const Contact = () => {
 
    const router = useRouter();
    const URL = "";


    const [name, setName] = useState<any>(null);
    const [email, setEmail] = useState<any>(null);
    const [message, setMessage] = useState<any>(null);
    
    const [error, setError] = useState<any>(null);
    
    return (
        <div >
            <HeadTag title="Contact Us - Dihliz World School"/>
             <NavBar active="Contact"/>
             <section className="px-8 lg:px-32 bg-lime-50">
               
     
<main>


<PageHeader title="Connect Us"/>  
 
 <div className="w-full lg:w-8/12 m-auto">
  <div className="lg:flex bg-white  rounded-lg border ">
  <div className="">
          <iframe 
          src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d31284.865352773886!2d75.904566!3d11.43596!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x8f0dcbc58941b5cb!2sMarkaz%20Garden%20%7C%20Dihliz%20World%20School!5e0!3m2!1sen!2sin!4v1676036758575!5m2!1sen!2sin" 
          className="w-full h-64 lg:h-96"
          frameBorder="0" 
          style={{border:0}} 
          allowFullScreen={true} 
          aria-hidden="false" 
          tabIndex={0}></iframe>

        </div>
<div className="py-12 px-10 lg:px-20 text-black">


<b>Dihliz World School</b> <br />
Markaz Garden, Poonoor <br />
Calicut, Kerala, India <br />
673574
 <br /><br />
 <section className="flex items-center text-dihliz-500 mt-1">
   <HiOutlineMail className=" mr-4 text-2xl"/> <div >
   info@dihlizworldschool.com
   </div>
 </section>
 
 <section className="flex items-center text-dihliz-500 mt-1">
   <HiPhone className=" mr-4 text-2xl"/> <div >
   0495 2963484
   </div>
 </section>


</div>
  </div>




 </div>


</main>




<br /><br /><br />
             </section>
             <Footer/>
        </div>
    );
}

export default Contact;