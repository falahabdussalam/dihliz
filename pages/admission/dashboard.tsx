import DoneModal from "@/components/admission/doneModel";
import Register from "@/components/admission/register";
import Footer from "@/components/common/footer";
import HeadTag from "@/components/common/head";
import NavBar from "@/components/common/nav";
import PageHeader from "@/components/common/page_header";
import getData from "@/functions/admission/getData";
import login from "@/functions/admission/login";
import updateStudent from "@/functions/admission/update";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";



const Admission = () => {
    const [error, setError] = useState<string>('');
    const [updating, setUpdating] = useState<boolean>(false);
// DATA
    const [id, setId] = useState<string>('');
    const [course, setCourse] = useState<string>('');
    const [name, setName] = useState<string>('');
    const [father, setFather] = useState<string>('');
    const [fatherOcc, setFatherOcc] = useState<string>('');
    const [mother, setMother] = useState<string>('');
    const [motherOcc, setMotherOcc] = useState<string>('');
    const [motherTongue, setMotherTongue] = useState<string>('');
    const [dob, setDob] = useState<string>('');
    const [permAddress, setPermAddress] = useState<string>('');
    const [commAddress, setCommAddress] = useState<string>('');
    const [phone1, setPhone1] = useState<string>('');
    const [phone2, setPhone2] = useState<string>('');
    const [whatsapp, setWhatsapp] = useState<string>('');
    const [examName, setExamName] = useState<string>('');
    const [examBoard, setExamBoard] = useState<string>('');
    const [passYear, setPassYear] = useState<string>('');

    const [schoolStudied, setSchoolStudied] = useState<string>('');
    const [schoolPlace, setSchoolPlace] = useState<string>('');

    const [Lang1, setLang1] = useState<string>('');
    const [Lang2, setLang2] = useState<string>('');
    const [English, setEnglish] = useState<string>('');
    const [Hindi, setHindi] = useState<string>('');
    const [SocialScience, setSocialScience] = useState<string>('');
    const [Physics, setPhysics] = useState<string>('');
    const [Chemistry, setChemistry] = useState<string>('');
    const [Biology, setBiology] = useState<string>('');
    const [Maths, setMaths] = useState<string>('');
    const [IT, setIT] = useState<string>('');
    const [mdExamName, setMdExamName] = useState<string>('');
    const [mdExamBoard, setMdExamBoard] = useState<string>('');
    const [mdPassYear, setMdPassYear] = useState<string>('');
    const [madrasaStudied, setMadrasaStudied] = useState<string>('');
    const [mdPlace, setMdPlace] = useState<string>('');
    const [surahMemorized, setSurahMemorized] = useState<string>('');
 

function update(e:any){
    e.preventDefault();
    setUpdating(true);
    updateStudent(id, course, name, father, fatherOcc, mother, motherOcc, motherTongue, dob, permAddress, commAddress, phone1, phone2, whatsapp, examName, examBoard, passYear, schoolStudied, schoolPlace, Lang1, Lang2, English, Hindi, SocialScience, Physics, Chemistry, Biology, Maths, IT, mdExamName, mdExamBoard, mdPassYear, madrasaStudied, mdPlace, surahMemorized).then((res) => {
        setUpdating(false);

        console.log(res);
        
    })
}

   
  useEffect(() => {
    let phoneData = localStorage.getItem('phone');
    let dobData = localStorage.getItem('dob');
    if(phoneData && dobData){
        

        getData().then((res) => {

            if(res){
                let data = res.data.data;
                setId(data.id);
                setCourse(data.course);
                setName(data.name);
                setFather(data.father);
                setFatherOcc(data.fatherOcc);
                setMother(data.mother);
                setMotherOcc(data.motherOcc);
                setMotherTongue(data.motherTongue);
                setDob(data.dob);
                setPermAddress(data.permAddress);
                setCommAddress(data.commAddress);
                setPhone1(data.phone1);
                setPhone2(data.phone2);
                setWhatsapp(data.whatsapp);
                setExamName(data.examName);
                setExamBoard(data.examBoard);
                setPassYear(data.passYear);
                setSchoolStudied(data.schoolStudied);
                setSchoolPlace(data.schoolPlace);
                setLang1(data.Lang1);
                setLang2(data.Lang2);
                setEnglish(data.English);
                setHindi(data.Hindi);
                setSocialScience(data.SocialScience);
                setPhysics(data.Physics);
                setChemistry(data.Chemistry);
                setBiology(data.Biology);
                setMaths(data.Maths);
                setIT(data.IT);
                setMdExamName(data.mdExamName);
                setMdExamBoard(data.mdExamBoard);
                setMdPassYear(data.mdPassYear);
                setMadrasaStudied(data.madrasaStudied);
                setMdPlace(data.mdPlace);
                setSurahMemorized(data.surahMemorized);
            }else{
            }
            
            

        })
    }else{
        router.push("/admission")
    }
  },[])
 

    const router = useRouter();

const labelClass = "block text-sm mt-4 mb-1"
const h3Class = "text-2xl font-bold text-dihliz-500 mt-4 uppercase"

    return (
        <div >
            <HeadTag title="Admission - Dihliz World School"/>
             <NavBar active="Admission"/>
             <section className="px-8 lg:px-32 bg-lime-50">
              <PageHeader title="Admission Dashboard"/>  
<form className="w-full lg:w-5/12 m-auto" onSubmit={update}>
{error.length>3 && <div className=" text-white  px-3 py-1 rounded-lg bg-red-600">{error}</div>}

    {/* COURSE APPLIED */}
    <span className={labelClass}>Course Applied</span>
    <select onChange={(e)=>setCourse(e.target.value)} value={course}  className="select select-bordered w-full">
        <option value="High School 8th">High School 8th</option>
        <option value="High School 9th">High School 9th</option>
        <option value="HSS Commerce">HSS Commerce</option>
        <option value="HSS Science">HSS Science</option>
    </select>

    {/* PERSONAL DETAILS */}
    <h3 className={h3Class}>PERSONAL DETAILS</h3>
    <span className={labelClass}>Full Name</span>
    <input onChange={(e)=>setName(e.target.value)} value={name} className="input input-bordered w-full" type="text" placeholder="Full Name"/>

    <span className={labelClass}>Father's Name</span>
    <input onChange={(e)=>setFather(e.target.value)} value={father} className="input input-bordered w-full" type="text" placeholder="Father's Name"/>

    <span className={labelClass}>Father's Occupation</span>
    <input onChange={(e)=>setFatherOcc(e.target.value)} value={fatherOcc} className="input input-bordered w-full" type="text" placeholder="Father's Occupation"/>

    <span className={labelClass}>Mother's Name</span>
    <input onChange={(e)=>setMother(e.target.value)} value={mother} className="input input-bordered w-full" type="text" placeholder="Mother's Name"/>

    <span className={labelClass}>Mother's Occupation</span>
    <input onChange={(e)=>setMotherOcc(e.target.value)} value={motherOcc}  className="input input-bordered w-full" type="text" placeholder="Mother's Occupation"/>

    <span className={labelClass}>Mother Tongue</span>
    <input onChange={(e)=>setMotherTongue(e.target.value)} value={motherTongue} className="input input-bordered w-full" type="text" placeholder="Mother Tongue"/>

    <span className={labelClass}>Date of Birth</span>
    <input onChange={(e)=>setDob(e.target.value)} value={dob} className="input input-bordered w-full" type="date" placeholder="Date of Birth"/>

    <span className={labelClass}>Permanent Address</span>
    <textarea onChange={(e)=>setPermAddress(e.target.value)} value={permAddress} className="textarea h-24 textarea-bordered w-full" placeholder="Permanent Address"></textarea>

    <span className={labelClass}>Communication Address</span>
    <textarea onChange={(e)=>setCommAddress(e.target.value)} value={commAddress} className="textarea h-24 textarea-bordered w-full" placeholder="Communication Address"></textarea>

    <span className={labelClass}>Phone 1</span>
    <input onChange={(e)=>setPhone1(e.target.value)} value={phone1} className="input input-bordered w-full" type="text" placeholder="Phone 1"/>

    <span className={labelClass}>Phone 2</span>
    <input onChange={(e)=>setPhone2(e.target.value)} value={phone2} className="input input-bordered w-full" type="text" placeholder="Phone 2"/>

    <span className={labelClass}>Whatsapp Number</span>
    <input onChange={(e)=>setWhatsapp(e.target.value)} value={whatsapp} className="input input-bordered w-full" type="text" placeholder="Whatsapp Number"/>

    {/* EDUCATIONAL DETAILS */}
    <h3 className={h3Class}>Details of Qualifying Examination</h3>
    <span className={labelClass}>Exam Name</span>
    <input onChange={(e)=>setExamName(e.target.value)} value={examName} className="input input-bordered w-full" type="text" placeholder="Exam Name"/>

    <span className={labelClass}>Exam Board</span>
    <input onChange={(e)=>setExamBoard(e.target.value)} value={examBoard} className="input input-bordered w-full" type="text" placeholder="Exam Board"/>

    <span className={labelClass}>Passing Year</span>
    <input onChange={(e)=>setPassYear(e.target.value)} value={passYear}  className="input input-bordered w-full" type="text" placeholder="Passing Year"/>

    <span className={labelClass}>School Name</span>
    <input onChange={(e)=>setSchoolStudied(e.target.value)}  value={schoolStudied}  className="input input-bordered w-full" type="text" placeholder="School Name"/>

    <span className={labelClass}>Place</span>
    <input onChange={(e)=>setSchoolPlace(e.target.value)}  value={schoolPlace} className="input input-bordered w-full" type="text" placeholder="Place"/>


{/* EXAM MARKS */}
    <h3 className={h3Class}>Marks of Qualifying Examination</h3>
    <span className={labelClass}>Language 1</span>
    <input onChange={(e)=>setLang1(e.target.value)} value={Lang1}  className="input input-bordered w-full" type="text" placeholder="Language 1"/>

    <span className={labelClass}>Language 2</span>
    <input onChange={(e)=>setLang2(e.target.value)} value={Lang2}  className="input input-bordered w-full" type="text" placeholder="Language 2"/>


    <span className={labelClass}>English</span>
    <input onChange={(e)=>setEnglish(e.target.value)}  value={English}  className="input input-bordered w-full" type="text" placeholder="English"/>

    <span className={labelClass}>Hindi</span>
    <input onChange={(e)=>setHindi(e.target.value)}  value={Hindi}  className="input input-bordered w-full" type="text" placeholder="Hindi"/>

    <span className={labelClass}>Mathematics</span>
    <input onChange={(e)=>setMaths(e.target.value)} value={Maths}  className="input input-bordered w-full" type="text" placeholder="Mathematics"/>

    <span className={labelClass}>Physics</span>
    <input onChange={(e)=>setPhysics(e.target.value)} value={Physics}  className="input input-bordered w-full" type="text" placeholder="Science"/>

    <span className={labelClass}>Chemistry</span>
    <input onChange={(e)=>setChemistry(e.target.value)} value={Chemistry}  className="input input-bordered w-full" type="text" placeholder="Chemistry"/>

    <span className={labelClass}>Biology</span>
    <input onChange={(e)=>setBiology(e.target.value)} value={Biology}  className="input input-bordered w-full" type="text" placeholder="Biology"/>

    <span className={labelClass}>IT</span>
    <input onChange={(e)=>setIT(e.target.value)} value={IT}  className="input input-bordered w-full" type="text" placeholder="Computer Science"/>

    <span className={labelClass}>Social Science</span>
    <input onChange={(e)=>setSocialScience(e.target.value)} value={SocialScience}  className="input input-bordered w-full" type="text" placeholder="Social Science"/>

   

    {/* MADRASA DETAILS */}
    <h3 className={h3Class}>Details of Islamic Education</h3>
    <span className={labelClass}>Madrasa Name</span>
    <input onChange={(e)=>setMdExamName(e.target.value)} value={mdExamName}  className="input input-bordered w-full" type="text" placeholder="Madrasa Name"/>

    <span className={labelClass}>Madrasa Board</span>
    <input onChange={(e)=>setMdExamBoard(e.target.value)} value={mdExamBoard}  className="input input-bordered w-full" type="text" placeholder="Madrasa Board"/>

    <span className={labelClass}>Passing Year</span>
    <input onChange={(e)=>setMdPassYear(e.target.value)} value={mdPassYear}  className="input input-bordered w-full" type="text" placeholder="Passing Year"/>

    <span className={labelClass}>Madrasa Name</span>
    <input onChange={(e)=>setMadrasaStudied(e.target.value)}  value={madrasaStudied}  className="input input-bordered w-full" type="text" placeholder="Madrasa Name"/>

    <span className={labelClass}>Place</span>
    <input onChange={(e)=>setMdPlace(e.target.value)} value={mdPlace}  className="input input-bordered w-full" type="text" placeholder="Place"/>

    <span className={labelClass}>No. of Surah Memorized</span>
    <input onChange={(e)=>setSurahMemorized(e.target.value)} value={surahMemorized}  className="input input-bordered w-full" type="text" placeholder="No. of Surah Memorized"/>

    
  <input type="submit" value={updating?"Updating....":"UPDATE DETAILS"} className="btn btn-primary mt-4 text-white" disabled={updating}  />

</form>
<div className="h-44"></div>
             </section>
              

             <Footer/>
            
        </div>
    );
}

export default Admission;