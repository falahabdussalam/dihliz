import Cookies from "js-cookie";
import { ROOT_URL } from "../data/const";
import decodeToken from "./decode";

const isLogged = async () => {
    if(decodeToken()==null){
        return false;
    }else{
        return true;
    }
}
export default isLogged;

// let token = Cookies.get('token');
//         let resp = await fetch(`${ROOT_URL}/validateJWT.php?token=${token}`).then((response) => { 
//             return response.json();
//         });
//         if(resp.status=='success'){
//             return true;
//         }
        
//         return false;