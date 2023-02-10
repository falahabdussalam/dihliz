import PageLoading from "@/components/widgets/loading";
import isLogged from "../../../functions/isLogged";
import { useEffect, useState } from "react";
import AdminNavBar from "@/components/admin/admin_nav";
import { useRouter } from "next/router";
import { ROOT_URL,UPLOADS_URL } from "@/data/const";
import Dialog from "@/components/widgets/dialog";
import { API_KEY } from "@/data/const";

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


const router  = useRouter();


const [error, setError] = useState<any>(null);
const DATA_URL = `${ROOT_URL}/products/get.php`;
const [services, setServices] = useState<Array<any>>([]);
const [selectId, setSelectId] = useState<any>(null);


    const getData = async () => {
        fetch(DATA_URL)
        .then(response => response.json())
        .then(data =>{
          console.log(data);
          
          if(data.status==="available"){
            setServices(data.blogs);
          }
          else if(data.status==="empty"){
            setServices([]);
          }else {
            setError("Auth Error");
            
          }
        });
      }


useEffect(() => {
    getData();
},[])



if(!isLoaded) return <PageLoading/>
    return (
        <>
          <AdminNavBar active="Services"/>  
        <div className="h-screen bg-pale-50 px-10 lg:px-32">
           

         <div className="h-20 w-full"></div>

         <section className="flex justify-between w-full pb-6">
         <div className="font-bold text-3xl  text-dihliz-500">Services</div> 
         <button className="btn bg-dihliz-500"
         onClick={(e)=>router.push('/cpanel/services/add')}
         >Add New Service</button>
         </section>

    <section>
      {
        services.length>0?(
          <div className="grid lg:grid-cols-3  xl:grid-cols-4 gap-6">
            {
              services.map((service,index)=>{
                return(
                  <div key={index} className=" shadow bg-white rounded-md grid-item">
                    <div className="w-full h-44 rounded-t-md"
                    style={{
                      backgroundImage:`url(${UPLOADS_URL}/${service.thumb})`,
                      backgroundSize:"cover",
                      backgroundPosition:"center",
                    }}
                    >
                      
                    </div>
                    <div className="p-3">
                      <div className="font-bold ">{service.name}</div>
                      <div>
                        <button className="btn btn-xs rounded-sm" onClick={()=>{
                          router.push(`/cpanel/services/edit?id=${service.id}`)
                        }}>Edit</button>

                        <button className="btn btn-xs rounded-sm ml-2 bg-red-600 hover:bg-red-700" 
                        onClick={()=>{setSelectId(service.id)}}>
                          Delete</button>
                      </div>
                    
                    </div>
                    
                    </div>
                )
              })
            }
          </div>
        ):(
          <div className="pt-10">😒 Such an Empty</div>
        )
      }
    </section>
        </div>
        <DeleteService 
    id={selectId}
    open={selectId!=null}
    onClose={()=>setSelectId(null)}
    onSuccess = {()=>{getData();
      setSelectId(null)
    }}
    />     
        
        </>
    );
}

export default Services;

export const DeleteService = (props:any)=>{
  const [deleting, setDeleting] = useState(false);
  return (
      <div>
          <Dialog
          open={props.open}
  onClose={() =>props.onClose()}
  >
      <div className="py-6 px-4 ">
          Are you sure you want to delete this service? <br />
          <div className="flex justify-center">
          <button className="bg-green-600 hover:bg-green-700  text-white px-2 py-1 rounded mr-2 mt-2"
          onClick={() =>props.onClose()}
          >Cancel</button> 
          <button className="bg-red-600 hover:bg-red-700  text-white px-2 py-1 rounded mr-2 mt-2"
          onClick={() =>{
              setDeleting(true);
              fetch(`${ROOT_URL}/products/delete.php?id=${props.id}&api=${API_KEY}`)
              .then(response => response.json())
              .then(res=>{
                  props.onClose()
                  if(res.status === "success"){
                    setDeleting(false);
                      props.onSuccess()
                  }else{
                     
                  alert("Something went wrong. Please try again later.")
                  }
                  
              });
          }}
          >Yes, Delete</button>
          </div>
          
      </div>
{deleting?(
  <div className="px-4">Deleting...</div>
):(
  <span></span>
)}
      </Dialog>
      </div>
  );
}