
import Footer from "@/components/common/footer";
import HeadTag from "@/components/common/head";
import NavBar from "@/components/common/nav";
import Header from "@/components/home/header";
import ServiceDetail from "@/components/services/detail_modal";
import QuoteForm from "@/components/services/quoteForm";
import { ROOT_URL } from "@/data/const";
import getContents from "@/functions/getServices";
import { useEffect, useState } from "react";

const Services = ({contents}:{contents:any})=>{
    const [productItems, setProductItems] = useState<Array<any>>([]);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [quoteItem, setQuoteItem] = useState<any>(null);

    useEffect(()=>{
        console.log('Contents:::::::');
        
        console.log(contents);
        if(contents.status==='available'){
            const items:Array<any> = contents.blogs;
            setProductItems(items);
        }
      
  
    },[]) 
    

    const categories = [
        {name:"Signage",descr:"Standard Signage elements: Aluminum Plates, 3mm thickness.  High Intensity Reflective Sheets for background. Symbols are  written by colored and transparent ink.or Reflective sticker.   Posts used for these types are 2.5' Ø or 3' Ø steel pipes, breakaway type and hot-dip galvanized. With accessories: clamps, bolts, brackets welded at the back of the signboard by spot welding."},
        {name:"Design", descr:"We design everything you need! Having bounteous artistic designers, ISRA will give life to every ideation in your mind. \nCreate logos for your company, organizations, brands, institutions, etc. with us. We will furnish the best apt and expressive logos of modern type. Our other designing services include Posters, Business cards, Flyers, Brochures, pamphlets, Social media posters, Magazine layouts, Book layouts, and portfolios. "},
        {name:"Printing", descr:"Our customized printing using the newest technologies (Offset, Digital, UV, Screen, & Laser) will suffice your need. With a bunch of highly updated designers, we will provide pleasing papers. Our printing service is vast range including"},
        {name:"Gift", descr:"Giftings share love between people. We produce handcrafted, eco-friendly, lifestyle gifts for all generations. Our gift catalog includes Plaque, Crystal, Acrylic, Wooden Stainless Steel Gifts, Brass, Aluminum, Pens, Clocks, Keychains, Mouse Pads, Tea coasters, Mugs, Bottles, Jugs, Souvenirs, Special Gifts for Birthdays, Special Anniversary gifts, Special Ramadan gifts, Special Marriage gifts etc"},
        {name:"Tag", descr:"Make tags of your choice. We provide a wide variety of tags. Our multifaceted varieties include engraved stainless steel tag, Engraved cable tag, Aluminum tag, Metal label, Phenolic engraving, Plastic and Paper. "},
        {name:"Art", descr:"We are an artful team. We curate and create artistically immaculate matters."},
        {name:"Content", descr:"Contents on your website, profiles, apps, press releases, and all other spaces attract people and earn popularity for your venture. We provide content that renders the idea of your brand, company, initiatives, etc.   "},
        {name:"Digital", descr:""},
        {name:"Photography", descr:"Our Photography Services include"},
        {name:"Event", descr:"Under an Umbrella, ISRA provides a wide variety of services related to Event Management. ISRA provides all-encompassing services related to the field"},

    ];  


return (
    <div>
         <HeadTag
     title="Services - Dihliz World School"
     description="Services provided by Dihliz World School"
     ></HeadTag>

<NavBar active="Services"/>
    <section className="lg:px-10 ">
       

<div className="">

        <div className="mx-10 lg:mx-32 my-20">
            <h1 className="flex justify-center text-4xl lg:text-5xl text-dihliz-500 font-bold my-4">Our Services</h1>
            <br />


{
    categories.map((cat, index)=>{
        return (
            <div key={index} className="border-b py-4">
                <h2 className="text-2xl text-dihliz-500 font-bold mb-3">{cat.name}</h2>
                <p>
                    {cat.descr}
                </p>
                <br />
                <section className="grid md:grid-cols-2  lg:grid-cols-3 xl:grid-cols-4 gap-6">

    
{
    productItems.filter((item)=>item.category==cat.name).map((service:any,index:number)=>{
        return (
            <div key={index} className="w-full bg-white hover:scale-110 transition-all duration-300 hover:shadow-lg  rounded-3xl border service-item cursor-pointer">
        <div className=" flex justify-center">
        <img src={ROOT_URL+"/uploads/"+service.thumb}
        className="rounded-2xl w-8/12 mt-5"
        alt="" />  </div>
       <div className="pt-4 pb-1 font-bold flex justify-center"> {service.name}</div>
       <div className="w-full flex justify-center mb-3 font-light">
        <button className="btn btn-xs bg-dihliz-500 rounded-md"
        onClick={()=>setSelectedItem(service)}
        >Know More</button></div>
            </div>
      
        );
    })
}

</section>
            </div>
        )
    })
}





        </div>
   


</div>
          </section>  
          
          {
            selectedItem && <ServiceDetail 
            open={true}
            onClose={()=>setSelectedItem(null)}
            >
<div className="grid lg:grid-cols-2 gap-6">
<div className=" flex justify-center">
        <img src={ROOT_URL+"/uploads/"+selectedItem.thumb}
        className="rounded-2xl w-9/12 border"
        alt="" />  </div>

<div>
<div className="text-xl font-bold text-pale-700">{selectedItem.name}</div>
<div className="mb-2 text-sm">{selectedItem.description}</div>

    <button className="btn btn-sm bg-dihliz-500"
    onClick={()=>setQuoteItem(selectedItem)}
    >Get Quote</button>
</div>
</div>
            </ServiceDetail>
          }
          {
            quoteItem && <QuoteForm
            open={quoteItem!=null}
            onClose={()=>setQuoteItem(null)}
            data={quoteItem}
            />
          }
    <Footer></Footer>
        </div>
    );
    }
    export default Services;

    export async function getStaticProps() {
 
        const contents = await getContents()
      
        return {
          props: {
            contents,
          },
          revalidate: 60,
        }
      }