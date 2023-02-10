import { API_KEY, ROOT_URL } from "@/data/const";
import axios from 'axios';

const newQuote = async(productId:any, name:string, email:string, phone:string) =>{
        const URL = `${ROOT_URL}/quote/add.php`;
      const formData = new FormData();
      formData.append('api',API_KEY)
      formData.append('productId',productId)
      formData.append('name',name)
      formData.append('email',email)
      formData.append('phone',phone)
    
      return  await axios.post(URL, formData,{
          headers: {
            'Accept': 'application/json',
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          }
      });
    
}

export default newQuote;