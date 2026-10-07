"use client";

import { useRouter } from "next/navigation";

const SecondAbout = () => {
    const router  = useRouter()
    return (
        <div className="px-8 lg:px-32 py-12 grid lg:grid-cols-2 bg-white">
              <section className="flex justify-center pt-20  lg:order-2">
            <img src="/img/director.jpg" className="w-10/12 lg:w-6/12"
            style={{
              borderRadius:"10% 30% 10% 30%"
            }}
            data-aos="fade-right"  data-aos-delay="300"  alt="" />
           </section>
           <section className="flex items-center lg:order-1">
           <div>
           <h1 className="text-3xl font-bold" data-aos="fade-right"  data-aos-delay="500"> <span className="text-dihliz-500">
           Director's </span> Message </h1>
            <p  className="py-4" data-aos="fade-right"  data-aos-delay="700">
            Dihliz World School prepares you to achieve your goals in the rapidly and constantly changing environment of global education. 
            Structured in a serene garden, Dihliz delivers the competitive advantages and global experience of commerce, science and high school. 
            The dire need of the hour to mould ethically inspired professionals and leaders incorporated the ideas of Islamic value system in 
            substantially met and fulfilled at this garden of innovative mission and practical wisdom.

            </p>
            <button onClick={()=>router.push('/about')} className="btn btn-primary bg-dihliz-500 hover:bg-dihliz-600" 
             data-aos="fade-up"  data-aos-delay="800">Read More</button>
           </div>
           </section>
         
        </div>
    );
}

export default SecondAbout;