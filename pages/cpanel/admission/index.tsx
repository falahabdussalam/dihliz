import PageLoading from "@/components/widgets/loading";
import isLogged from "../../../functions/isLogged";
import { useEffect, useState } from "react";
import AdminNavBar from "@/components/admin/admin_nav";
import { useRouter } from "next/router";
import { API_KEY, ROOT_URL } from "@/data/const";
import HeadTag from "@/components/common/head";

const Services = () => {

    const [isLoaded,setIsLoaded] = useState<boolean>(false);
    useEffect(()=>{
      isLogged().then((res)=>{
        if(res){
            setIsLoaded(true);
        }else{
            window.location.replace('/cpanel/login')
        }
      })
    },[])

    const DATA_URL = `${ROOT_URL}/admission/getAllData.php?api=${API_KEY}`;
    const [quotes, setQuotes] = useState<Array<any>>([]);
    const [error, setError] = useState<any>(null);

    const getData = async () => {
      fetch(DATA_URL)
      .then(response => response.json())
      .then(data =>{        
        if(data.status==="available"){
          setQuotes(data.data.reverse());
        }
        else if(data.status==="empty"){
          setQuotes([]);
        }else {
          setError("Auth Error");
          
        }
      });
    }


useEffect(() => {
  getData();
},[])


const router  = useRouter();

if(!isLoaded) return <PageLoading/>
    return (
        <>
                        <HeadTag title="Admissions - Dihliz World School"/>

          <AdminNavBar active="Admission"/> 

        <div className="min-h-screen bg-lime-50 px-10 lg:px-32 pb-20">
           

         <div className="h-20 w-full"></div>
         <h1 className="m-auto font-bold text-3xl  text-dihliz-500">Admissions</h1> 
         <main className="w-full"> 
       {
        quotes.map((applic:any, index:number)=>{
          return <div key={index} 
          className="bg-white p-4 my-4 rounded shadow w-full lg:w-6/12 grid-item cursor-pointer">
           <h2 className="font-bold text-dihliz-500"> {applic.name}</h2>
            <div><small className="text-gray-500">Course: </small> {applic.course}</div>
            <div><small className="text-gray-500">Contact: </small> {applic.phone1}</div>
            <div><small className="text-gray-500">WhatsApp: </small> {applic.whatsapp}</div>
<button className="btn btn-primary btn-sm mt-3 text-white"
onClick={()=>{
  window.open(`/admission/dashboard?admPhone=${applic.phone1}&admDob=${applic.dob}`,'_blank')
}}
>View/Edit</button>

            
          </div>
       })
      }
            </main> 
        </div></>
    );
}

export default Services;