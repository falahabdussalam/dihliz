const PrintApplcation = (props:any) => {
    const data = props.data;
    const tdClass = "font-bold pr-2"

    function formatDate(date:any) {
        const dateParts = date.split("-");
        return dateParts[2] + "-" + dateParts[1] + "-" + dateParts[0]
    }
    if (!data) return <div></div>
    return (
<section className="px-14 py-8 font-sans no-screen">
    <img src="/img/letterhead.png" alt="" /> <br />
    <h3 className="text-center text-3xl font-semibold py-3">Admission Application</h3> <br />


<div> <b>Admission For:</b> {data.course}</div>
    <h3 className="font-semibold text-xl mt-6 underline">PERSONAL INFORMATIONS</h3>   

    <div className="flex justify-between">
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
                <tr> <td className={tdClass}>Email:</td> <td>{data.email}</td> </tr>
                <tr> <td className={tdClass}>Whatsapp:</td> <td>{data.whatsapp}</td> </tr>



            </table>
        </div>
        <div>
            <div className="flex justify-between items-center px-2 h-36 w-28 border border-black text-center">Attach Passport Photo</div>
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


           <div style={{
            pageBreakAfter: 'always'
           }}></div>

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


<h4  className="font-semibold text-xl mt-6 underline text-center">Declaration</h4>
<div>
I hereby declare that all the information furnished above is true and correct to the best of my knowledge and belief.
<br />
<br />
Place: <br /> Date: <br />
<div className="text-right italic">Name & Signature of Applicant</div>
</div>
<br /> 
{/* PARENTS */}
<div>
I hereby certify that my ward and I shall follow all the rules, regulations and procedures laid down by the college
from time to time. I hereby put my signature to confirm the above declarations<br />
<br />
<div className="text-right italic">Name & Signature of Guardian</div>
</div>
<br /> 

<div className="border border-black p-10 mt-6 rounded-2xl">
    <h3 className="font-semibold text-xl underline text-center">For office use only</h3> <br />
   <ol>
         <li>Reciept No: </li>
            <li>Admission No: </li>
            <li>Date of Admission: </li>
            <li>Remarks: </li>
   </ol>
   <br />
    <br />
    <div className="flex justify-between italic">
        <div>Office Seal </div>
        <div>Signature of Principal</div>
    </div>
<br /> <br /> <br />
</div>
</section>
    );
}

export default PrintApplcation;