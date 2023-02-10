import PageLoading from "@/components/widgets/loading";
import isLogged from "../../../functions/isLogged";
import { useEffect, useState } from "react";
import AdminNavBar from "@/components/admin/admin_nav";
import { useRouter } from "next/router";
import { ROOT_URL } from "@/data/const";
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

    const DATA_URL = `${ROOT_URL}/quote/get.php`;
    const [quotes, setQuotes] = useState<Array<any>>([]);
    const [error, setError] = useState<any>(null);

    const getData = async () => {
      fetch(DATA_URL)
      .then(response => response.json())
      .then(data =>{
        console.log(data);
        
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
                        <HeadTag title="Orders - Dihliz World School"/>

          <AdminNavBar active="Orders"/> 

        <div className="min-h-screen bg-pale-50 px-10 lg:px-32 pb-20">
           

         <div className="h-20 w-full"></div>
         <h1 className="m-auto font-bold text-3xl  text-dihliz-500">Quote Orders</h1> 
         <main className="w-full"> 
       {
        quotes.map((quote:any, index:number)=>{
          return <div key={index} className="bg-white p-4 my-4 rounded shadow w-full lg:w-6/12 grid-item">
           <h2 className="font-bold text-dihliz-500"> {quote.name}</h2>
            <div><small className="text-pale-700">Name: </small> {quote.custName}</div>
            <div><small className="text-pale-700">Email: </small> {quote.custEmail}</div>
            <div><small className="text-pale-700">Phone: </small> {quote.custPhone}</div>
            <div><small className="text-pale-700">Ordered At: </small> {quote.created_on}</div>
            
          </div>
       })
      }
            </main> 
        </div></>
    );
}

export default Services;