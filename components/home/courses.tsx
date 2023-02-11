import { MdOutlineScience} from 'react-icons/md';
import { useRouter } from 'next/router';
import { BiBuildings, BiCalculator } from 'react-icons/bi';




const Courses = () => {
const router = useRouter();
    const iconClass = "text-dihliz-500 text-5xl";
    const items:Array<any>= [
        {title:"HSS SCIENCE", 
        description:"With Medical, Engineering Coaching from domain experts", 
        icon: <MdOutlineScience className={iconClass}/>},
        {title:"HSS COMMERCE",
        description:"With CA, CS, CMA Foundation from professionals",
        icon: <BiCalculator className={iconClass}/>},
        {title:"HIGH SCHOOL",
        description:"With Life Skills Training and Competitive Exam Coaching",
        icon: <BiBuildings className={iconClass}/>},
        
    
    ];
    return (
        <div className="bg-lime-50 px-8 lg:px-32 py-12 ">
                       <h1 className="text-3xl font-semibold text-lime-600 text-center" data-aos="fade-left"  data-aos-delay="500">
                      Programs Offered at DIHLIZ 
                       </h1>
<br />
            <section className="grid lg:grid-cols-3 gap-10" data-aos="fade-up"  data-aos-delay="700">
                {
                    items.map((item,index)=>{
                        return (
                            <div 
                            className="bg-white rounded-md shadow-md p-8 grid-item  cursor-pointer flex flex-col justify-center items-center text-center" 
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

export default Courses;