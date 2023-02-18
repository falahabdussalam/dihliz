

import { API_KEY, ROOT_URL } from "@/data/const";
import axios from 'axios';

const updateStudent = async(id:string, course:string, name:string, father:string, fatherOcc:string, mother:string, motherOcc:string, motherTongue:string, dob:string, permAddress:string, commAddress:string, phone1:string, phone2:string,email:string, whatsapp:string, examName:string, examBoard:string, passYear:string, schoolStudied:string, schoolPlace:string, Lang1:string, Lang2:string, English:string, Hindi:string, SocialScience:string, Physics:string, Chemistry:string, Biology:string, Maths:string, IT:string, mdExamName:string, mdExamBoard:string, mdPassYear:string, madrasaStudied:string, mdPlace:string, surahMemorized:string
    ) =>{
        const URL = `${ROOT_URL}/admission/update.php`;
      const formData = new FormData();
      formData.append('api',API_KEY)
        formData.append('id',id)
        formData.append('course',course)
        formData.append('name',name)
        formData.append('father',father)
        formData.append('fatherOcc',fatherOcc)
        formData.append('mother',mother)
        formData.append('motherOcc',motherOcc)
        formData.append('motherTongue',motherTongue)
        formData.append('dob',dob)
        formData.append('permAddress',permAddress)
        formData.append('commAddress',commAddress)
        formData.append('phone1',phone1)
        formData.append('phone2',phone2)
        formData.append('email',email)
        formData.append('whatsapp',whatsapp)
        formData.append('examName',examName)
        formData.append('examBoard',examBoard)
        formData.append('passYear',passYear)
        formData.append('schoolStudied',schoolStudied)
        formData.append('schoolPlace',schoolPlace)
        formData.append('Lang1',Lang1)
        formData.append('Lang2',Lang2)
        formData.append('English',English)
        formData.append('Hindi',Hindi)
        formData.append('SocialScience',SocialScience)
        formData.append('Physics',Physics)
        formData.append('Chemistry',Chemistry)
        formData.append('Biology',Biology)
        formData.append('Maths',Maths)
        formData.append('IT',IT)
        formData.append('mdExamName',mdExamName)
        formData.append('mdExamBoard',mdExamBoard)
        formData.append('mdPassYear',mdPassYear)
        formData.append('madrasaStudied',madrasaStudied)
        formData.append('mdPlace',mdPlace)
        formData.append('surahMemorized',surahMemorized)
    
      return  await axios.post(URL, formData,{
          headers: {
            'Accept': 'application/json',
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          }
      });
    
}

export default updateStudent;
