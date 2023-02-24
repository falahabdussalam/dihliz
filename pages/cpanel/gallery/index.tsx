

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head'
import { ROOT_URL,API_KEY } from '@/data/const';
import AdminLayout from '@/components/admin/admin_layout';
import Dialog from '@/components/widgets/dialog';

const Gallery = () => {
    const router = useRouter();

    const [error, setError] = useState<any>(null);
    const DATA_URL = ROOT_URL+"/gallery/get.php";
    const [blogs, setGallerys] = useState<Array<any>>([]);
    const [selectId, setSelectId] = useState<any>(null);

    
        const getData = async () => {
            fetch(DATA_URL)
            .then(response => response.json())
            .then(data =>{
              
              
              if(data.status==="available"){
                setGallerys(data.data.reverse());
              }
              else if(data.status==="empty"){
                setGallerys([]);
              }else {
                setError("Auth Error");
                
              }
            });
          }
    
    
    useEffect(() => {
        getData();
    },[])


    return (
        <AdminLayout title="Gallery" label="Gallery">
             <Head>
        <title>Gallery - Dihliz World School</title>
        <meta name="description" content="Gallery of Dihliz World School" />
      </Head>
          

           <section className="flex justify-between w-full pb-6">
         <div className="font-bold text-3xl  text-dihliz-500">Gallery</div> 
         <button className="btn bg-dihliz-500"
         onClick={(e)=>router.push('/cpanel/gallery/add')}
         >Add New Photo</button>
         </section>





<section >
{
              blogs!=null?blogs.length>0?(
                <div className="grid lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {
                        blogs.map((blg,index)=>{
                            return  (<section className=" bg-white border rounded-lg" key={index}>
                                <div className="flex bg-gray-100 rounded-t-lg  px-4 py-2 shadow hover:shadow-md h-52"
                                style={{
                                    backgroundImage:`url('${ROOT_URL+"/gallery/"+blg.image_link}')`,
                                    backgroundSize:"cover",
                                }}
                                >

                            
                                </div>
                                <div className='p-2'>
                                    {blg.title} <br />
                                    <button
                                    
onClick={()=>{
    setSelectId(blg.id)
}
}
className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded m-2 "
>Delete</button>
                                </div>
                               
                                   
    <DeletePhoto 
    id={selectId}
    open={selectId!=null}
    onClose={()=>setSelectId(null)}
    onSuccess = {()=>{getData();setSelectId(null);}}
    />
</section>
                                )
                            
                        })
                    }
                </div>
            ):(
                  <div>No photos</div>
              ):(
                  <div>Loading..</div>
              )
          }
</section>


        </AdminLayout>
    );
}
 
export default Gallery;

export const DeletePhoto = (props:any)=>{
    const [deleting, setDeleting] = useState(false);
    const router = useRouter();
    return (
        <div>
            <Dialog
            open={props.open}
    onClose={() =>props.onClose()}
    >
        <div className="py-6 px-4">
            Are you sure you want to delete this photo? <br />
          
<section className='flex justify-center'>

<button className="bg-green-600 hover:bg-green-700  text-white px-2 py-1 rounded mr-2 mt-2"
            onClick={() =>props.onClose()}
            >Cancel</button> 
            <button className="bg-red-600 hover:bg-red-700  text-white px-2 py-1 rounded mr-2 mt-2"
            onClick={() =>{
                setDeleting(true);
                fetch(`${ROOT_URL}/gallery/delete.php?id=${props.id}&api=${API_KEY}`)
                .then(response => response.json())
                .then(res=>{
                    props.onClose()
                    if(res.status === "success"){
                        props.onSuccess()
                    }else{
                       
                    alert("Something went wrong. Please try again later.")
                    }
                    
                });
            }}
            >Yes, Delete</button>
</section>

            
        </div>
{deleting?(
    <div className="px-4">Deleting Photo...</div>
):(
    <span></span>
)}
        </Dialog>
        </div>
    );
}