import { useState, useEffect } from "react"

const HomeHeader = () => {
  

        
          const [index, setIndex] = useState(0);
          useEffect(() => {
              var homeVideo = document.getElementById('homeVideo');
              homeVideo!.style.minHeight=window.innerHeight + "px";

            const intervalId = setInterval(()=>{
              setIndex(index => index + 1);
            },
              5000 
            );
            return () => clearTimeout(intervalId);
          }, []);
    return (
        <div className="relative"
        id="homeVideo"
        style={{
            width:"100%",
            overflow:"hidden"
              }}
        >
        <main 
      className="absolute bg-black w-full h-full"
      >


<section className="absolute w-full h-full"
style={{
  backgroundImage: "url('/img/bg.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center center",
    backgroundRepeat: "no-repeat",
    width:"100%",
    height:"100%",
}}></section>


<section className="absolute w-full h-full"
style={{
    width:"100%",
    height:"100%",
 
}}
>

<video autoPlay muted loop playsInline
style={{ height: "100%", width: "100%", objectFit: "cover",
}}

><source src="/bg.mp4" type="video/mp4">
    </source>
</video>

</section>



<div className="absolute bg-black bg-opacity-50 w-full h-full"></div>
    <section className="absolute w-full h-full flex justify-center items-center">
       <div className="w-full text-center">
        <img src="/img/white.png" className="w-52 m-auto" data-aos="fade-down" data-aos-delay="300" alt="Dihliz World School" />
       <h1 className="text-lime-500 font-bold text-3xl" data-aos="fade-down" data-aos-delay="500" >Dihliz World School  </h1>
        <div className="px-10 lg:w-6/12 m-auto text-center text-white" data-aos="fade-down" data-aos-delay="700" >
        A Global Gateway to the Cutting - Edge Schooling with a vision that called for creating, molding and developing 
        ethically sound professionals in the fields concerned.

        </div>
       
       <a className="btn btn-primary text-white mt-8" data-aos="fade-up" data-aos-delay="1000" 
       href="#about"
       >Explore</a>
       </div>

    </section>
 
 
      {/* <div className="absolute z-50 flex w-full justify-between bottom-4  text-white lg:px-11 px-6">
<div className=""></div>
<SocialIcons/>
      </div> */}
      </main>
      </div>
    );
}
 
export default HomeHeader;