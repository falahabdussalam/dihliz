"use client";

import AdminLayout from '@/components/admin/admin_layout'
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { API_KEY } from '@/data/const';
import { ROOT_URL } from '@/data/const';

const AddService = () => {


const [title, setTitle] = useState<any>(null);
const [description, setDescription] = useState<any>(null);
const [thumb, setThumb] = useState<any>(null);
const [category, setCategory] = useState<any>(null);

const [error, setError] = useState<any>(null);
const [loading, setLoading] = useState<any>(false);

const router = useRouter();


 

  function submitBlog(){
      if(title!=null && category!=null && thumb!=null){
        setError(null)
        setLoading(true)

        uploadThumb().then(res=>{
            if(res.data.status=="success"){
                addNewBlog(res.data.file).then(resnew=>{
                   
                    if(resnew.data.status=="success"){
                      setLoading(false)
                        router.replace('/cpanel/services')
                    }else{
                        setError("Something went wrong. Please try again later.");
                    }
                });
            }else{
                setError(res.data.message)
            }
            
        });
      }else{
          if(title==null || category==null){
            setError("Please fill all the fields")

          }else{
            setError("Please upload a thumbnail.")

          }
      }
      
  }

 async function uploadThumb(){
    const formData = new FormData();
    formData.append('api',API_KEY)
    formData.append('file',thumb)
    return  await axios.post(`${ROOT_URL}/uploads/upload.php`, formData,{
        headers: {
            'content-type': 'multipart/form-data'
        }
    });
  }

  async function addNewBlog(thumbUrl:string){
    const URL = `${ROOT_URL}/products/add.php`;
  const formData = new FormData();
  formData.append('api',API_KEY)
  formData.append('name',title)
  formData.append('description',description)
  formData.append('thumb',thumbUrl)
  formData.append('category',category)

  return  await axios.post(URL, formData,{
      headers: {
        'Accept': 'application/json',
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      }
  });
}

const categories = [
    "Signage", "Design", "Printing", "Gift", "Tag", "Art", "Content", "Digital", "Photography", "Event"
];


    return (
        <AdminLayout  active="Services">


            {error && <div className="bg-red-200 text-red-700 px-3 py-2 mb-3 rounded">{error}</div>}
            <br />
            <br />
            <h4 className="text-dihliz-700">Service Name</h4>
            <input type="text" onChange={(e) => {setTitle(e.target.value);
              }}
            
            className="input  w-full mb-5"
            placeholder="Service Name"
            />
            <br />
            <h4 className="text-dihliz-700 ">Description</h4>
            <textarea 
             className="textarea  w-full mb-2"
onChange={(e) => setDescription(e.target.value)}
           placeholder='Service Description'
           ></textarea>
      
<br />
<h4 className="text-dihliz-700 ">Category</h4>
<select name="" id="" className="select  w-full mb-2"
onChange={(e) => setCategory(e.target.value)}
>
    <option disabled selected>Select a Category</option>
{
    categories.map((cat)=>{
        return (<option value={cat}>{cat}</option>)
    })
}

</select>
<br /> 


              <br />
            <h4 className="text-dihliz-700">Blog Thumbnail</h4>
        <input type="file"
        className="w-full m2-4"
        placeholder="Thumbnail"
        onChange={ (e)=>setThumb(e.target.files![0]) }
        accept="image/jpeg,image/png"
        />   

        {
            thumb && <img src={URL.createObjectURL(thumb)} className="w-3/12 mt-4 rounded-lg" />
        } 
        <span className="text-red-600 text-sm pt-1 inline-block">Image ust be in <b>1000x1000</b>px resolution.</span>  
             <br />
             
             <br />

            <br />
             <div className="flex justify-end">
             <button
             className="bg-dihliz-600 hover:bg-dihliz-700 text-white px-6 py-3 rounded mt-3" 
             onClick={()=>submitBlog()}
             >{loading?(
              <span>
                  <img src="/img/loading.gif" className="mx-4" style={{height:"30px"}} alt="" />
              </span>
          ):(
              <span>Add New Service</span>
          )}</button>
             </div>
        </AdminLayout>
    );
}
 
export default AddService;