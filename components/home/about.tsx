import { useRouter } from "next/router";

const About = () => {
    const router  = useRouter()
    return (
        <div className="px-8 lg:px-32 py-20 grid lg:grid-cols-2 bg-white" id="about">
              <section className="flex justify-center py-20">
               
            <img src="/img/about1.jpg" 
            className="w-full lg:w-7/12 rounded-2xl mover-item hover:scale-125 duration-500"  data-aos="fade-right"  data-aos-delay="300"  alt="" />
           </section>
           <section className="flex items-center">
           <div>
           <h1 className="text-3xl font-bold" data-aos="fade-right"  data-aos-delay="500">About <span className="text-dihliz-500">
          Dihliz World School</span> </h1>
            <p  className="py-4" data-aos="fade-right"  data-aos-delay="700">
            Dihilz, a phrase meaning threshold in Persian, continues the journey that GSV started more than one decade before. 
            Dihliz World School, runs under Markaz Garden, Calicut, plans its residential school system with a new advanced approach and 
            outstanding curriculum to expand its global connections. It explores excellence in all the academic and non-academic 
            areas to mould the students as 'ideal' in the areas concerned.


       
            </p>
           
<div className="flex ">
<button onClick={()=>router.push('/about')} className="btn btn-primary  text-white" 
             data-aos="fade-up"  data-aos-delay="800">Know More</button>

<button onClick={()=>
{
  window.open("https://www.youtube.com/watch?v=IN3Re5tJzFE", "_blank");
}
} className="btn btn-primary bg-lime-500 hover:bg-lime-600 ml-2 text-white" 
             data-aos="fade-up"  data-aos-delay="800">Watch Promo</button> 
</div>

           </div>
           </section>
         
        </div>
    );
}

export default About;