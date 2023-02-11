import PageLoading from "@/components/widgets/loading";
import isLogged from "../../functions/isLogged";
import { useEffect, useState } from "react";
import AdminNavBar from "@/components/admin/admin_nav";
import { useRouter } from "next/router";
import HeadTag from "@/components/common/head";

const AdminIndex = () => {



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

const menu:Array<any> = [
    {title:"CPanel Home",ico:"🏠", link:'/cpanel'},
    {title:"Gallery",ico:"🖼️", link:'/cpanel/gallery'},
    {title:"Admissions",ico:"📄", link:'/cpanel/orders'},
    {title:"News & Events",ico:"📰", link:'/cpanel/news'},


];

const router  = useRouter();

if(!isLoaded) return <PageLoading/>
    return (
        <div className="h-screen bg-lime-50">
           <HeadTag title="Admin Panel - Dihliz World School"/>
         <AdminNavBar active="Admin Home"/>  
       
         <div className="h-40 w-full"></div>
         <h1 className="m-auto font-bold text-3xl text-center text-dihliz-500">Control Panel</h1> 
         <main className="w-full flex justify-center lg:items-center"> 
       
            <section className="grid grid-cols-2 mt-10 gap-5">
                {
                    menu.map((item,index)=>{
                        return (
                            <a key={index} 
                            onClick={(e)=>{
                                e.preventDefault();
                                router.push(item.link);
                            }}
                            className="flex flex-col items-center justify-center p-10 shadow-md bg-white font-bold rounded-md cursor-pointer hover:shadow-lg duration-500 text-center">
                               <span className="text-3xl block"> {item.ico} </span>
                                
                                {item.title}
                                </a> )})
                }
            </section>
            </main> 
        </div>
    );
}

export default AdminIndex;