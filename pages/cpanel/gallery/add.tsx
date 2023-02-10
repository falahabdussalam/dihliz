import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Head from 'next/head'
import { ROOT_URL,API_KEY } from '@/data/const';
import AdminLayout from '@/components/admin/admin_layout';

const NewPhoto = () => {


const [title, setTitle] = useState<any>("");
const [photo, setPhoto] = useState<any>(null);
const [error, setError] = useState<any>(null);
const [loading, setLoading] = useState<Boolean>(false);
const router = useRouter();

  function submitPhoto(){
      if(title!=null && photo!=null){
        setError(null)
        setLoading(true)
        addNewPhoto().then(resnew=>{
                   
          if(resnew.data.status=="success"){
            setLoading(false)
              router.push('/cpanel/gallery')
          }else{
              setError("Something went wrong. Please try again later.");
          }
      });
      }else{
          if(title==null){
            setError("Please fill all the fields")

          }else{
            setError("Please upload the file.")

          }
      }
      
  }

 async function addNewPhoto(){
      const URL = `${ROOT_URL}/gallery/upload.php`;
    const formData = new FormData();
    formData.append('api',API_KEY)
    formData.append('file',photo)
    formData.append('title',title)
    return  await axios.post(URL, formData,{
        headers: {
            'content-type': 'multipart/form-data'
        }
    });
  }




    return (
        <AdminLayout title="New Photo"  label="Photo">
<Head>
    <title>New Photo | Dihliz World School</title>
</Head>

            {error && <div className="bg-red-200 text-red-700 px-3 py-2 mb-3 rounded">{error}</div>}
            <h4 className="text-dihliz-500 mb-2">Image Title</h4>
            <input type="text" onChange={(e) => {setTitle(e.target.value);
             }}
            
            className="w-full input input-bordered "
            placeholder="Title"
            />
             <br />
 
              <br />
            <h4 className="text-dihliz-500 mb-2">Select Photo</h4>
        <input type="file"
        className="input input-bordered w-full py-3"
        placeholder="Photo"
        onChange={ (e)=>setPhoto(e.target.files![0]) } 
        accept="image/jpeg,image/png"
        />    
        <span className="text-red-600 text-sm pt-1 inline-block">Upload compressed images to optimize page loading time.</span>
             <br /><br />

            <br />
             <div className="flex justify-end">
             <button
             className="bg-dihliz-500 hover:bg-dihliz-700 text-white px-6 py-3 rounded mt-3" 
             onClick={()=>submitPhoto()}
             >{loading?(
              <span>
                  <img src="/img/loading.gif" className="mx-4" style={{height:"30px"}} alt="" />
              </span>
          ):(
              <span>Upload Photo</span>
          )}</button>
             </div>
        </AdminLayout>
    );
}
 
export default NewPhoto;