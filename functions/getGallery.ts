import { ROOT_URL,API_KEY } from "@/data/const";

var qs = require('qs');

const getGallery = async()=>{
    const url = `${ROOT_URL}/gallery/get.php`;


    const res = await fetch(url,
        {
            headers: { 
                'Accept': 'application/json',
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            }
        }
        ).then(res=>res.json()).catch(err=>console.log(err));
        return res;
    
    }

    export default getGallery;