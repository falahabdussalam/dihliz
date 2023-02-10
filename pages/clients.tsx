import Footer from "@/components/common/footer";
import HeadTag from "@/components/common/head";
import NavBar from "@/components/common/nav";
import PageHeader from "@/components/common/page_header";
import { useRouter } from "next/router";
import {BsArrowRight} from 'react-icons/bs'

const Clients = () => {
   
const team:Array<any> = [
    {name:"Muhammed Rafi Pattasseri", position:"", body:"Muhammed Rafi is the Managing Director of ISRA, who started ISRA in 2007. His 25 years of extensive experience in the media and advertising industry as a professional artist adds to the artistry and creative nuances of the institution. He has business relationships with various multinational companies across the world."},
    {name:"Muhammed Khalid Chokli", position:"", body:"Being the Chief Executive Officer of ISRA, he leads the company with newer ideas. After a successful completion of MBA from reputed management institute in India, he moved to holds various managerial positions in different Construction, Consultation, and Real Estate industries in India and UAE. Having 10 years of experience in Business Management, he tries to fetch new achievements to the company with his distinct creative thinking."},
];
    const router = useRouter();
    return (
        <div >
            <HeadTag title="Clients - Dihliz World School"/>
             <NavBar active="Clients"/>
             <section className="px-8 lg:px-32 bg-white">
              <PageHeader title="Clients"/>  
<section className="grid lg:grid-cols-2 lg:px-32 px-10">
   <img src="/img/client1.png" alt="" />
   <img src="/img/client2.png" alt="" />
   <img src="/img/client3.png" alt="" />
   <img src="/img/client4.png" alt="" />

   
</section>

<br />  

<div className="h-44"></div>
             </section>
             <Footer/>
        </div>
    );
}

export default Clients;