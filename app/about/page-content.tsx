"use client";

import Footer from "@/components/common/footer";
import NavBar from "@/components/common/nav";
import PageHeader from "@/components/common/page_header";
import { useRouter } from "next/navigation";
import {BsArrowRight} from 'react-icons/bs'

const About = () => {
   
const team:Array<any> = [
    {name:"DR. MAH AZHARI", position:"",img:"mah.jpg"},
    {name:"DR. ABDUSSALAM", position:"",img:"dr-abdussalam.jpg"},
    {name:"DR. UMARUL FARUQ SAQAFI", position:"",img:"farooq-saqafi.jpg"},
    {name:"DR. ANIL SETH", position:"",img:"anil-seth.jpg"},
    {name:"MR. NOUFAL HASSAN NURANI", position:"",img:"noufal.jpg"},

];
    const router = useRouter();
    return (
        <div >
            
             <NavBar active="About"/>
             <section className="px-8 lg:px-32 bg-lime-50">
              <PageHeader title="About DIHLIZ"/>  
<section className="grid lg:grid-cols-2 ">
    <div className="px-8">
        <img src="/img/header.jpg" className="rounded-2xl" alt="" />
    </div>
    <div className="px-8 pb-20 pt-6 lg:pt-0 text-justify">
    <div className=" text-black">
    Dihilz, a phrase meaning threshold in Persian, continues the journey that GSV started more than one decade before. Dihliz World School, runs under Markaz Garden, Calicut, plans its residential school system with a new advanced approach and outstanding curriculum to expand its global connections. 
    It explores excellence in all the academic and non-academic areas to mould the students as 'ideal' in the areas concerned.
    <br /><br />
    <h2 className="text-2xl font-bold text-dihliz-500">Vision</h2>
DIHLIZ Global School was founded with a vision that called for creating, molding and developing ethically sound professionals in the fields concerned. The well designed curriculum will enlighten the young scholars to be the ideal to influence the constantly changing world order.
 <br /><br />
<h2 className="text-2xl font-bold text-dihliz-500">Mission</h2>
DIHLIZ prioritizes quality, values and ethos. It engages students in the cognitive learning processes with physical, aesthetic, spiritual and linguistic domains. DIHLIZ aims an alternative globally equipped schooling with experiential learning, which helps to discover themselves through different learning strategies.
 The spiritual domain expands their wisdom with practical learning/comprehension strategies.

    </div>

    </div>
</section>

<br />  
<br /> 
             </section>


<section className="px-8 lg:px-32 bg-white">
<PageHeader title="Dihliz Directors Board"/>  


<div className="grid lg:grid-cols-3 gap-6">
{
    team.map((member, index)=>{
        return (
            <div key={index} className="border bg-lime-50 border-lime-500 rounded-2xl p-8 grid-item flex flex-col
              justify-center items-center cursor-pointer">
                <img src={`/img/directors/${member.img}`} className="rounded-3xl w-40 h-40 mx-auto mb-3" alt="" /> 
                <h2 className="text-xl font-bold text-dihliz-500 text-center">{member.name}</h2>
                {/* <p className="text-gray-500">{member.position}</p> */}
                
            </div>
        )
    })
}
</div>
<div className="h-44"></div>
    </section>             
            

             <Footer/>
        </div>
    );
}

export default About;
