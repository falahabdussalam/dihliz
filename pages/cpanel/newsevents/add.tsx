import AdminLayout from '@/components/admin/admin_layout'
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Head from 'next/head'
import { API_KEY } from '@/data/const';
import { ROOT_URL } from '@/data/const';
import 'react-quill/dist/quill.snow.css';

const AddService = () => {

    const ReactQuill = typeof window === 'object' ? require('react-quill') : () => false;

const [title, setTitle] = useState<any>(null);
const [description, setDescription] = useState<any>(null);
const [thumb, setThumb] = useState<any>(null);
const [category, setCategory] = useState<any>(null);

const [error, setError] = useState<any>(null);
const [loading, setLoading] = useState<any>(false);

const router = useRouter();

const  modules = {
    toolbar: [
      [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
      [{size: []}],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, 
       {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image', 'video'],
      ['clean']
    ],
    clipboard: {
      // toggle to add extra line breaks when pasting HTML:
      matchVisual: false,
    }
  }

 

  function submitBlog(){
      if(title!=null && category!=null && thumb!=null){
        setError(null)
        setLoading(true)

        uploadThumb().then(res=>{
            if(res.data.status=="success"){
                addNewBlog(res.data.file).then(resnew=>{
                   console.log(resnew);
                   
                    if(resnew.data.status=="success"){
                      setLoading(false)
                        router.replace('/cpanel/newsevents')
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
    const URL = `${ROOT_URL}/newsevents/add.php`;
  const formData = new FormData();
  formData.append('api',API_KEY)
  formData.append('title',title)
  formData.append('body',description)
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
    "News", "Event"
];


    return (
        <AdminLayout  active="News & Events">
<Head>
    <title>Add News/Event</title>
</Head>

            {error && <div className="bg-dihliz-50 text-red-700 px-3 py-2 mb-3 rounded">{error}</div>}
            <br />
            <br />
            <h4 className="text-dihliz-700">Title</h4>
            <input type="text" onChange={(e) => {setTitle(e.target.value);
              }}
            
            className="input border-dihliz-500  w-full mb-5 "
            placeholder="News/Event Title"
            />
            <br />
            <h4 className="text-dihliz-700 ">Body</h4>

            <ReactQuill  
              value={description}
              onChange={(val:any)=>setDescription(val)}
              modules={modules}
          
              placeholder='Body'
              />



         
      
<br />
<h4 className="text-dihliz-700 ">Category</h4>
<select name="" id="" className="select border-dihliz-500 w-full mb-2"
onChange={(e) => setCategory(e.target.value)}
>
    <option disabled selected>Select a Category</option>
{
    categories.map((cat)=>{
        return (<option value={cat} className="py-3">{cat}</option>)
    })
}

</select>
<br /> 


              <br />
            <h4 className="text-dihliz-700 "> Thumbnail</h4>
        <input type="file"
        className="w-full file-input border-dihliz-500 m2-4"
        placeholder="Thumbnail"
        onChange={ (e)=>setThumb(e.target.files![0]) }
        accept="image/jpeg,image/png"
        />   

        {
            thumb && <img src={URL.createObjectURL(thumb)} className="w-3/12 mt-4 rounded-lg" />
        } 
        <span className="text-red-600 text-sm pt-1 inline-block">Image ust be in <b>1080x600</b>px resolution.</span>  
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
              <span>Submit</span>
          )}</button>
             </div>
        </AdminLayout>
    );
}
 
export default AddService;