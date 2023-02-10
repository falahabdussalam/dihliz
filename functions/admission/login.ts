import { API_KEY, ROOT_URL } from "@/data/const";
import axios from 'axios';

const login = async(phone:string, dob:string) =>{
        const URL = `${ROOT_URL}/admission/login.php`;
      const formData = new FormData();
      formData.append('api',API_KEY)
        formData.append('phone',phone)
        formData.append('dob',dob)
    
      return  await axios.post(URL, formData,{
          headers: {
            'Accept': 'application/json',
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          }
      });
    
}

export default login;