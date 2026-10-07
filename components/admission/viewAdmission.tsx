"use client";

import { AiOutlinePrinter } from "react-icons/ai"

const ViewAdmission = (props:any) => {


    const labelClass = "block text-sm mt-4 mb-1"
    const h3Class = "text-2xl font-bold text-dihliz-500 mt-4 uppercase"
    const containerClass = "bg-white rounded-2xl border p-10 mt-4"
    const tdClass = "font-bold pr-2"
const data = props.data;


function formatDate(date:any) {
    const dateParts = date.split("-");
    return dateParts[2] + "-" + dateParts[1] + "-" + dateParts[0]
}


    return (
        <div className="no-print">
           <input type="checkbox" id="viewAdmission" className="modal-toggle" />
<label htmlFor="viewAdmission" className="modal cursor-pointer">
  <label className="modal-box relative" htmlFor="">
{
    props.data && <div>
        <button className="btn btn-primary btn-sm text-white font-normal mb-3"
        onClick={() => window.print()}
        ><AiOutlinePrinter className="text-xl mr-2"/> Print Application</button>
          <h3 className="text-2xl font-bold text-dihliz-600">{data.name}</h3>
   

          <div> <b>Admission For:</b> {data.course}</div>
    <h3 className="font-semibold text-xl mt-6 underline">PERSONAL INFORMATIONS</h3>   

    <div className="">
       <div>
            <table>
                <tr> <td className={tdClass}>Student Name:</td> <td>{data.name}</td> </tr>
                <tr> <td className={tdClass}>Date of Birth:</td> <td>{data.dob && formatDate(data.dob)}</td> </tr>

                <tr> <td className={tdClass}>Father Name:</td> <td>{data.father}</td> </tr>
                <tr> <td className={tdClass}>Mother Name:</td> <td>{data.mother}</td> </tr>
                <tr> <td className={tdClass}>Mother Tongue:</td> <td>{data.motherTongue}</td> </tr>
                <tr> <td className={tdClass}>Permanent Addess:</td> <td>{data.permAddress}</td> </tr>
                <tr> <td className={tdClass}>Communication Address:</td> <td>{data.commAddress}</td> </tr>
                <tr> <td className={tdClass}>Primary Contact:</td> <td>{data.phone1}</td> </tr>
                <tr> <td className={tdClass}>Secondary Contact:</td> <td>{data.phone2}</td> </tr>
                <tr> <td className={tdClass}>Whatsapp:</td> <td>{data.whatsapp}</td> </tr>



            </table>
        </div> 
      
        </div>

     <h3 className="font-semibold text-xl mt-6 underline">DETAILS OF QUALIFYING EXAMINATION</h3>  
      <table>
            <tr> <td className={tdClass}>Exam Name:</td> <td>{data.examName}</td> </tr>
            <tr> <td className={tdClass}>Exam Board:</td> <td>{data.examBoard}</td> </tr>
            <tr> <td className={tdClass}>Passing Year:</td> <td>{data.passYear}</td> </tr>
            <tr> <td className={tdClass}>School Name:</td> <td>{data.schoolStudied}</td> </tr>
            <tr> <td className={tdClass}>Place:</td> <td>{data.schoolPlace}</td> </tr>

            </table>
            <b>Marks Obtained</b>
           <div className="marks-table">
           <table>
                <tr>
                    <td><b>Lang 1</b></td>
                    <td><b>Lang 2</b></td>
                    <td><b>English</b></td>
                    <td><b>Hindi</b></td>
                    <td><b>IT</b></td>
                </tr>
                <tr>
                    <td>{data.Lang1}</td>
                    <td>{data.Lang2}</td>
                    <td>{data.English}</td>
                    <td>{data.Hindi}</td>
                    <td>{data.IT}</td>

                </tr>
           
                <tr>
                    <td><b>Math</b></td>
                    <td><b>Physics</b></td>
                    <td><b>Chemistry</b></td>
                    <td><b>Biology</b></td>
                    <td><b>Social Science</b></td>
                </tr>
                <tr>
                    <td>{data.Maths}</td>
                    <td>{data.Physics}</td>
                    <td>{data.Chemistry}</td>
                    <td>{data.Biology}</td>
                    <td>{data.SocialScience}</td>
                </tr>
            </table>
           </div>


      

           {/* DETAILS OF ISLAMIC EDUCATION */}

           <h3 className="font-semibold text-xl mt-6 underline">DETAILS OF ISLAMIC EDUCATION</h3>  
           <table>
            <tr> <td className={tdClass}>Exam Name:</td> <td>{data.mdExamName}</td> </tr>
            <tr> <td className={tdClass}>Exam Board:</td> <td>{data.mdExamBoard}</td> </tr>
            <tr> <td className={tdClass}>Passing Year:</td> <td>{data.mdPassYear}</td> </tr>
            <tr> <td className={tdClass}>Madrasa Name:</td> <td>{data.madrasaStudied}</td> </tr>
            <tr> <td className={tdClass}>Place:</td> <td>{data.mdPlace}</td> </tr>
            <tr> <td className={tdClass}>No. of Surah Memorized:</td> <td>{data.surahMemorized}</td> </tr>
            </table> 
<br />



    </div>
}

  
  </label>
</label>
        </div>
    );
}

export default ViewAdmission;