import Footer from "@/components/common/footer";
import HeadTag from "@/components/common/head";
import NavBar from "@/components/common/nav";
import PageHeader from "@/components/common/page_header";
import { useRouter } from "next/router";
import {BsArrowRight} from 'react-icons/bs'

const Academics = () => {
   const arCls =  "inline-block text-dihliz-600 mr-1";
   const arrow = <span className={arCls}>⇌</span>;
const courses:Array<any> = [
    {
        name:"HIGH SCHOOL",
        sub:"With Life Skills Training and Competitive Exam Coaching",
        img:"highschool.jpg",
        body:<div>
            The integrated Islamic senior secondary level curriculum shapes the students scientifically, academically, socially and religiously well adept and prepares students for future academic endeavours.

<br/> {arrow} CBSE Curriculum
<br/> {arrow} Comprehensively Integrated Islamic Studies
<br/> {arrow} Qur’anic Studio for Qur’an Learning
<br/> {arrow} Language Lab
<br/> {arrow} Coaching for Artificial Intelligence(AI), Robotics and National Science Olympiad(NSO)
<br/> {arrow} NTSE, Civil Service Orientation Coaching
<br/> {arrow} ‘Speed Math’ program
<br/> {arrow} Soft Skill Training
<br/> {arrow} Martial Arts
<br/> {arrow} Intensive training in reading , creative writing and public speaking
<br/> {arrow} 24x7 mentoring system
<br/> {arrow} Islamic life style
        </div>
    },
    {
        name:"HIGHER SECONDARY COMMERCE",
        sub:"With Medical, Engineering Coaching",
        img:"hssscience.jpg",
        body:<div>
            Markaz Garden Global Students’ Village provides different flavours of science stream under the supervision of well qualified faculties in a peaceful and vibrant campus. The ongoing students’ outstanding results in entrance exams like JEE, NEET, etc manifest the quality of teaching and learning in the campus.

<br/> {arrow} Intensive training for medical/engineering exams like KEAM, NEET, JEE-IIT, JIPMER, IIIT
<br/> {arrow} Classes/guidance by IIT, NIT professors, Scientists, and Academicians.
<br/> {arrow} Preparations to the national/international universities & premier institutes.
<br/> {arrow} Special training in Artificial Intelligence & Robotics.
<br/> {arrow} IELTS/TOEFL Training
<br/> {arrow} NCPL Urdu & Arabic (Central Govt.) Certificate Course
<br/> {arrow} Qur’anic Studio for Qur’an/Tajvid Learning
<br/> {arrow} Language Lab
<br/> {arrow} Training for soft skills, creative writing, public speaking and research.
<br/> {arrow} Arts, Sports, Martial Arts & Visits
<br/> {arrow} 24x7 mentoring system.
        </div>
    },
    {
        name:"HIGHER SECONDARY COMMERCE",
        sub:"With CA, CS, CMA Foundation",
        img:"hsscommerce.jpg",
        body:<div>
            Markaz Garden Global Students’ Village promises you a high range of managerial leadership acumen and outstanding career advantages

<br/> {arrow} CA/CMA/CS Foundation Coaching
<br/> {arrow} IELTS/TOEFL Training
<br/> {arrow} NCPL Urdu & Arabic Certificate (Central Govt.) Course
<br/> {arrow} Qur’anic Studio
<br/> {arrow} Comprehensively Integrated Islamic Studies
<br/> {arrow} Soft skill Training and Coaching for Public Speaking and Creative Writing
<br/> {arrow} Arts, Sports & Martial Arts
<br/> {arrow} Classes/Guidance by Professionals, Business Tycoons and University Professors
<br/> {arrow} Industrial Visit, Corporate Training & Management Summit Programs
<br/> {arrow} Integrated Islamic Management & Leadership Program
<br/> {arrow} 24x7 Mentoring System
        </div>
    }
    ,
    {
        name:"ISLAMIC SCIENCE",
        sub:"With Submissive Heart and Soul",
        img:"islamicscience.jpg",
        body:<div>
            Markaz Garden Global Students’ Village promises you a high range of managerial leadership acumen and outstanding career advantages

<br/> Allah orders justice, kindness and good conduct. He forbids injustice, immorality and oppression. Life at Dihliz under Markaz Garden Islamic Department moulds your child with the best as Allah almighty has instructed. He learns the textual as well as practical wisdom of Islam directly from the Islamic scholars with a focus in Arabic language. Islamic Science courses are designed to make better humans with authentic knowledge in the religious fields.


        </div>
    }

]
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

             <div className="bg-white"><PageHeader title="Programs offered at Dihliz"/>  </div>


{
    courses.map((course:any, index:number) => {
        return <section className={`px-8 py-16 lg:px-32   ${index%2!=0 ? ' bg-lime-50':' bg-white'}`} key={index}> 
        
        <div className={`grid lg:grid-cols-2  gap-3`}>
            <div className={` ${index%2!=0 && ' lg:order-2'  }`}>
                <img src={`/img/academics/${course.img}`} 
                className={`rounded-2xl w-11/12 mb-2 hover:scale-105 hover:shadow-2xl duration-500 `} alt="" />
            </div>
            <div className="text-black">
                <h1 className="text-3xl font-semibold text-lime-600">{course.name}</h1>
                <h3>{course.sub}</h3>
                <div>
                    {course.body}
                </div>
            </div>
        </div>
        </section>  
    })
}           
            
    <div className="h-44 bg-white"></div>
             <Footer/>
        </div>
    );
}

export default Academics;