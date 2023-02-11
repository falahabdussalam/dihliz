import { API_KEY, ROOT_URL } from "@/data/const";
import axios from 'axios';

const getAllData = async() =>{
    let phone = localStorage.getItem('phone') as string;
    let dob = localStorage.getItem('dob') as string;

    if(phone && dob){
        const URL = `${ROOT_URL}/admission/getAllData.php?api=${API_KEY}`;

        return  await axios.get(URL);
    }else{
        return null;
    }
    
    
}

export default getAllData;