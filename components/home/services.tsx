import {FaChalkboardTeacher, FaRegMap, FaSolarPanel} from 'react-icons/fa';
import {RiLightbulbFlashLine} from 'react-icons/ri';
import {MdAutoGraph, MdOutlineWorkOutline} from 'react-icons/md';
import { useRouter } from 'next/router';
import { BsPersonLinesFill } from 'react-icons/bs';






const Services = () => {
const router = useRouter();
    const iconClass = "text-dihliz-500 text-5xl";
    const items:Array<any>= [
        {title:"Job Oriented Skills Development", 
        description:"The courses are outlined with a futuristic vision to create a pool of highly skilled manpower for various sectors. The curriculum helps to be acquainted with the skills needed for the profession in the future.        ", 
        icon: <MdOutlineWorkOutline className={iconClass}/>},
        {title:"Holistic development approachs",
        description:"Intellectual, mental, physical, emotional, and social abilities in a child shape him to be the ideal. This holistic approach strengthens him to stand straight and face any hurdles in front of him.",
        icon: <RiLightbulbFlashLine className={iconClass}/>},
        {title:"Thematic learning strategies",
        description:"Learning is wieldy with thematic apparatus. The more of the whole can be comprehended through its selection and highlighting strategies. Connecting real life-situations with the textual ideas keep them well understood.",
        icon: <MdAutoGraph className={iconClass}/>},
        {title:"Career Mapping",
        description:"The best in the future depicts here by tools of mapping career with existing records and personalised assessments. The process utilizes a series of different strategies to articulate the future profession.",
        icon: <FaRegMap className={iconClass}/>},
        {title:"Expert Teachers",
        description:"We always value the best in the industry. A passionate, skilled, trained and experienced teacher could easily influence and develop the values, potential and skills of a student.",
        icon: <FaChalkboardTeacher className={iconClass}/>},
        {title:"Personlized Training",
        description:"A well designed curriculum ensures the growth of each student here. We design the dreams of each young resident with exposing their talent, ability and skills mentally, physically and intellectually. The individual attention with holistic approach brings out hidden talents.",
        icon: <BsPersonLinesFill className={iconClass}/>},
        
     
    
    ];
    return (
        <div className="bg-lime-500 px-8 lg:px-32 py-12 ">
                       {/* <h1 className="text-3xl font-bold text-white" data-aos="fade-left"  data-aos-delay="500">
                      Services 
                       </h1> */}
<br />
            <section className="grid lg:grid-cols-3 gap-4" data-aos="fade-up"  data-aos-delay="700">
                {
                    items.map((item,index)=>{
                        return (
                            <div className="bg-white rounded-md shadow-md p-8 grid-item  cursor-pointer" 
                            key={index}
                            >
                               {item.icon}
                    <h2 className='text-2xl text-dihliz-500 mt-2'>{item.title}</h2>
                    <p className='text-gray-400 text-sm'>{item.description}</p>
                 
                    </div>
                        )
                    })
                }
                
                 </section>
        </div>
    );
}

export default Services;