"use client";


import Footer from "@/components/common/footer";
import NavBar from "@/components/common/nav";
import Header from "@/components/home/header";
import { ROOT_URL } from "@/data/const";
import { useEffect, useState } from "react";

const Gallery = ({contents}:{contents:any})=>{
    const [galleryItems, setGalleryItems] = useState<Array<any>>([]);
  
    useEffect(()=>{
        
        if(contents.status==='available'){
            const items:Array<any> = contents.data;
            setGalleryItems(items);
        }
      
  
    },[]) 
    




return (
    <div>
         

<NavBar active="Gallery"/>
    <section className="lg:px-10 ">
       

<div className="">

        <div className="mx-10 lg:mx-32 my-20">
            <h1 className="flex justify-center text-4xl lg:text-5xl text-dihliz-500 font-bold my-4">Gallery</h1>
            <br />
         <section className="grid lg:grid-cols-3 xl:grid-cols-4  gap-6">

         {
    galleryItems.map((service:any,index:number)=>{
        return (
            <div key={index} className="w-full hover:scale-110 transition-all duration-300 hover:shadow-lg  rounded-3xl border service-item cursor-pointer">
        <div className=" flex justify-center">
        <img src={ROOT_URL+"/gallery/"+service.image_link}
        className="rounded-2xl w-full h-full"
        alt="" />  </div>
            </div>
      
        );
    })
}
         </section>





        </div>
   


</div>
          </section>  
    <Footer></Footer>
        </div>
    );
    }
    export default Gallery;

