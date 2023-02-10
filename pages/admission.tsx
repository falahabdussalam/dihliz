import Footer from "@/components/common/footer";
import HeadTag from "@/components/common/head";
import NavBar from "@/components/common/nav";
import PageHeader from "@/components/common/page_header";
import { useRouter } from "next/router";

const Admission = () => {

    const router = useRouter();
    return (
        <div >
            <HeadTag title="Academics - Dihliz World School"/>
             <NavBar active="Academics"/>
             <section className="px-8 lg:px-32 bg-lime-50">
              <PageHeader title="Academics at DIHLIZ"/>  
<section className="grid lg:grid-cols-2">
    <div className="px-8 flex justify-center">
        <img src="/img/teach.svg" className="rounded-2xl w-10/12  lg:w-8/12 mover-item" alt="" />
    </div>
    <div className="px-8 pb-20 pt-6 lg:pt-0 text-justify">
    <p className=" text-black">
    Technological innovations are beyond the human imaginations now. Life becomes easier and flexible in the age of Artificial Intelligence (AI). 
    At the height of sophistication AI works as an orchestrator. 
    New age and new worlds are to be explored in all the means. 
    Let the children learn what/why it is and how is it. 
    New methodology and academic strategies are futuristic and productive rather than conventional or only theoretical. <br />
    Our curriculum is designed with future/career possibilities. We have <b>High School (CBSE)</b>, 
   <b> Higher Secondary Commerce</b> and <b>Higher Secondary Science with Integrated Islamic Studies</b> here.
</p>
    </div>
</section>

<br />  
<br /> 
             </section>

    <div className="h-44 bg-white"></div>
             <Footer/>
        </div>
    );
}

export default Admission;