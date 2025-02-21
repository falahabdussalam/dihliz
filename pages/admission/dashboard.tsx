import DoneModal from "@/components/admission/doneModel";
import Register from "@/components/admission/register";
import Footer from "@/components/common/footer";
import HeadTag from "@/components/common/head";
import NavBar from "@/components/common/nav";
import PageHeader from "@/components/common/page_header";
import ToastBox from "@/components/common/toast";
import getData from "@/functions/admission/getData";
import getDataByParams from "@/functions/admission/getByParams";

import login from "@/functions/admission/login";
import updateStudent from "@/functions/admission/update";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const Admission = () => {
  const [error, setError] = useState<string>("");
  const [updating, setUpdating] = useState<boolean>(false);
  // DATA
  const [id, setId] = useState<string>("");
  const [course, setCourse] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [father, setFather] = useState<string>("");
  const [fatherOcc, setFatherOcc] = useState<string>("");
  const [mother, setMother] = useState<string>("");
  const [motherOcc, setMotherOcc] = useState<string>("");
  const [motherTongue, setMotherTongue] = useState<string>("");
  const [dob, setDob] = useState<string>("");
  const [permAddress, setPermAddress] = useState<string>("");
  const [commAddress, setCommAddress] = useState<string>("");
  const [phone1, setPhone1] = useState<string>("");
  const [phone2, setPhone2] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  const [whatsapp, setWhatsapp] = useState<string>("");
  const [examName, setExamName] = useState<string>("");
  const [examBoard, setExamBoard] = useState<string>("");
  const [passYear, setPassYear] = useState<string>("");

  const [schoolStudied, setSchoolStudied] = useState<string>("");
  const [schoolPlace, setSchoolPlace] = useState<string>("");

  const [Lang1, setLang1] = useState<string>("");
  const [Lang2, setLang2] = useState<string>("");
  const [English, setEnglish] = useState<string>("");
  const [Hindi, setHindi] = useState<string>("");
  const [SocialScience, setSocialScience] = useState<string>("");
  const [Physics, setPhysics] = useState<string>("");
  const [Chemistry, setChemistry] = useState<string>("");
  const [Biology, setBiology] = useState<string>("");
  const [Maths, setMaths] = useState<string>("");
  const [IT, setIT] = useState<string>("");
  const [mdExamName, setMdExamName] = useState<string>("");
  const [mdExamBoard, setMdExamBoard] = useState<string>("");
  const [mdPassYear, setMdPassYear] = useState<string>("");
  const [madrasaStudied, setMadrasaStudied] = useState<string>("");
  const [mdPlace, setMdPlace] = useState<string>("");
  const [surahMemorized, setSurahMemorized] = useState<string>("");

  function update(e: any) {
    e.preventDefault();

    setUpdating(true);
    updateStudent(
      id,
      course,
      name,
      father,
      fatherOcc,
      mother,
      motherOcc,
      motherTongue,
      dob,
      permAddress,
      commAddress,
      phone1,
      phone2,
      email,
      whatsapp,
      examName,
      examBoard,
      passYear,
      schoolStudied,
      schoolPlace,
      Lang1,
      Lang2,
      English,
      Hindi,
      SocialScience,
      Physics,
      Chemistry,
      Biology,
      Maths,
      IT,
      mdExamName,
      mdExamBoard,
      mdPassYear,
      madrasaStudied,
      mdPlace,
      surahMemorized
    ).then((res) => {
      setUpdating(false);

      if (res.data.status == "success") {
        if (course.length < 1) {
          toast.error("Please select the course applying for.");
        } else if (name.length < 1 || father.length < 1 || mother.length < 1) {
          toast.error("Please fill all the required fields.");
        } else {
          toast.success("Details Updated Successfully");
        }
      } else {
        toast.error("Something went wrong");
      }
    });
  }
  const router = useRouter();

  const { query } = router;

  useEffect(() => {
    setAllData();
  }, []);

  async function setAllData() {
    let asyncData;
    if (query && query.admPhone && query.admDob) {
      asyncData = await getDataByParams(query.admPhone, query.admDob);
    } else {
      let phoneData = localStorage.getItem("phone");
      let dobData = localStorage.getItem("dob");

      if (phoneData && dobData) {
        asyncData = await getData();
      } else {
        router.push("/admission");
        return;
      }
    }

    if (asyncData) {
      let data = asyncData.data.data;
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
      setEmail(data.email);
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
    } else {
    }
  }

  function formatDate(date: any) {
    const dateParts = date.split("-");
    return dateParts[2] + "-" + dateParts[1] + "-" + dateParts[0];
  }

  const labelClass = "block text-sm mt-4 mb-1";
  const h3Class = "text-2xl font-bold text-dihliz-500 mt-4 uppercase";
  const containerClass = "bg-white rounded-2xl border p-10 mt-4";
  const tdClass = "font-bold pr-2";

  return (
    <>
      <div className="no-print">
        <HeadTag title="Admission - Dihliz World School" />
        <NavBar active="Admission" />
        <section className="px-8 lg:px-32 bg-lime-50">
          <PageHeader title="Admission Dashboard" />
          <div className="flex justify-center mb-5">
            <button
              className="btn btn-primary text-white"
              onClick={() => {
                window.print();
              }}
            >
              Print/Download Application
            </button>
          </div>
          <form className="w-full lg:w-6/12  m-auto " onSubmit={update}>
            {error.length > 3 && (
              <div className=" text-white  px-3 py-1 rounded-lg bg-red-600">
                {error}
              </div>
            )}

            {/* COURSE APPLIED */}
            <section className={containerClass}>
              <span className="text-dihliz-500 text-xl mb-3 uppercase">
                Course Applied
              </span>
              <select
                onChange={(e) => setCourse(e.target.value)}
                value={course}
                className="select select-bordered w-full"
                required
              >
                <option>Select Course</option>
                <option value="High School 8th">High School 8th</option>
                <option value="High School 9th">High School 9th</option>
                <option value="HSS Commerce">HSS Commerce</option>
                <option value="HSS Science">HSS Science</option>
              </select>
            </section>

            {/* PERSONAL DETAILS */}
            <section className={containerClass}>
              <h3 className={h3Class}>PERSONAL DETAILS</h3>
              <span className={labelClass}>Full Name</span>
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                className="input input-bordered w-full"
                type="text"
                placeholder="Full Name"
                required
              />

              <span className={labelClass}>Father's Name</span>
              <input
                onChange={(e) => setFather(e.target.value)}
                value={father}
                className="input input-bordered w-full"
                type="text"
                placeholder="Father's Name"
                required
              />

              <span className={labelClass}>Father's Occupation</span>
              <input
                onChange={(e) => setFatherOcc(e.target.value)}
                value={fatherOcc}
                className="input input-bordered w-full"
                type="text"
                placeholder="Father's Occupation"
              />

              <span className={labelClass}>Mother's Name</span>
              <input
                onChange={(e) => setMother(e.target.value)}
                value={mother}
                className="input input-bordered w-full"
                type="text"
                placeholder="Mother's Name"
              />

              <span className={labelClass}>Mother's Occupation</span>
              <input
                onChange={(e) => setMotherOcc(e.target.value)}
                value={motherOcc}
                className="input input-bordered w-full"
                type="text"
                placeholder="Mother's Occupation"
              />

              <span className={labelClass}>Mother Tongue</span>
              <input
                onChange={(e) => setMotherTongue(e.target.value)}
                value={motherTongue}
                className="input input-bordered w-full"
                type="text"
                placeholder="Mother Tongue"
                required
              />

              <span className={labelClass}>Date of Birth</span>
              <input
                onChange={(e) => setDob(e.target.value)}
                value={dob}
                className="input input-bordered w-full"
                type="date"
                placeholder="Date of Birth"
                required
              />

              <span className={labelClass}>Permanent Address</span>
              <textarea
                onChange={(e) => setPermAddress(e.target.value)}
                value={permAddress}
                className="textarea h-24 textarea-bordered w-full"
                placeholder="Permanent Address"
              ></textarea>

              <span className={labelClass}>Communication Address</span>
              <textarea
                onChange={(e) => setCommAddress(e.target.value)}
                value={commAddress}
                className="textarea h-24 textarea-bordered w-full"
                placeholder="Communication Address"
              ></textarea>

              <span className={labelClass}>Phone 1</span>
              <input
                onChange={(e) => setPhone1(e.target.value)}
                value={phone1}
                className="input input-bordered w-full"
                type="text"
                placeholder="Phone 1"
                required
              />

              <span className={labelClass}>Phone 2</span>
              <input
                onChange={(e) => setPhone2(e.target.value)}
                value={phone2}
                className="input input-bordered w-full"
                type="text"
                placeholder="Phone 2"
              />

              <span className={labelClass}>Email</span>
              <input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                className="input input-bordered w-full"
                type="text"
                placeholder="Email Id"
              />

              <span className={labelClass}>Whatsapp Number</span>
              <input
                onChange={(e) => setWhatsapp(e.target.value)}
                value={whatsapp}
                className="input input-bordered w-full"
                type="text"
                placeholder="Whatsapp Number"
                required
              />

              <input
                type="submit"
                value={updating ? "Updating...." : "UPDATE DETAILS"}
                className="btn btn-primary mt-4 text-white"
                disabled={updating}
              />
            </section>
            {/* EDUCATIONAL DETAILS */}
            <section className={containerClass}>
              <h3 className={h3Class}>Details of Qualifying Examination</h3>
              <span className={labelClass}>Exam Name</span>
              <input
                onChange={(e) => setExamName(e.target.value)}
                value={examName}
                className="input input-bordered w-full"
                type="text"
                placeholder="Exam Name"
              />

              <span className={labelClass}>Exam Board</span>
              <input
                onChange={(e) => setExamBoard(e.target.value)}
                value={examBoard}
                className="input input-bordered w-full"
                type="text"
                placeholder="Exam Board"
              />

              <span className={labelClass}>Passing Year</span>
              <input
                onChange={(e) => setPassYear(e.target.value)}
                value={passYear}
                className="input input-bordered w-full"
                type="text"
                placeholder="Passing Year"
              />

              <span className={labelClass}>School Name</span>
              <input
                onChange={(e) => setSchoolStudied(e.target.value)}
                value={schoolStudied}
                className="input input-bordered w-full"
                type="text"
                placeholder="School Name"
              />

              <span className={labelClass}>Place</span>
              <input
                onChange={(e) => setSchoolPlace(e.target.value)}
                value={schoolPlace}
                className="input input-bordered w-full"
                type="text"
                placeholder="Place"
              />
              <input
                type="submit"
                value={updating ? "Updating...." : "UPDATE DETAILS"}
                className="btn btn-primary mt-4 text-white"
                disabled={updating}
              />
            </section>
            {/* EXAM MARKS */}
            <section className={containerClass}>
              <h3 className={h3Class}>Marks of Qualifying Examination</h3>
              <span className={labelClass}>Language 1</span>
              <input
                onChange={(e) => setLang1(e.target.value)}
                value={Lang1}
                className="input input-bordered w-full"
                type="text"
                placeholder="Language 1"
              />

              <span className={labelClass}>Language 2</span>
              <input
                onChange={(e) => setLang2(e.target.value)}
                value={Lang2}
                className="input input-bordered w-full"
                type="text"
                placeholder="Language 2"
              />

              <span className={labelClass}>English</span>
              <input
                onChange={(e) => setEnglish(e.target.value)}
                value={English}
                className="input input-bordered w-full"
                type="text"
                placeholder="English"
              />

              <span className={labelClass}>Hindi</span>
              <input
                onChange={(e) => setHindi(e.target.value)}
                value={Hindi}
                className="input input-bordered w-full"
                type="text"
                placeholder="Hindi"
              />

              <span className={labelClass}>Mathematics</span>
              <input
                onChange={(e) => setMaths(e.target.value)}
                value={Maths}
                className="input input-bordered w-full"
                type="text"
                placeholder="Mathematics"
              />

              <span className={labelClass}>Physics</span>
              <input
                onChange={(e) => setPhysics(e.target.value)}
                value={Physics}
                className="input input-bordered w-full"
                type="text"
                placeholder="Science"
              />

              <span className={labelClass}>Chemistry</span>
              <input
                onChange={(e) => setChemistry(e.target.value)}
                value={Chemistry}
                className="input input-bordered w-full"
                type="text"
                placeholder="Chemistry"
              />

              <span className={labelClass}>Biology</span>
              <input
                onChange={(e) => setBiology(e.target.value)}
                value={Biology}
                className="input input-bordered w-full"
                type="text"
                placeholder="Biology"
              />

              <span className={labelClass}>IT</span>
              <input
                onChange={(e) => setIT(e.target.value)}
                value={IT}
                className="input input-bordered w-full"
                type="text"
                placeholder="Computer Science"
              />

              <span className={labelClass}>Social Science</span>
              <input
                onChange={(e) => setSocialScience(e.target.value)}
                value={SocialScience}
                className="input input-bordered w-full"
                type="text"
                placeholder="Social Science"
              />

              <input
                type="submit"
                value={updating ? "Updating...." : "UPDATE DETAILS"}
                className="btn btn-primary mt-4 text-white"
                disabled={updating}
              />
            </section>
            {/* MADRASA DETAILS */}
            <section className={containerClass}>
              <h3 className={h3Class}>Details of Islamic Education</h3>
              <span className={labelClass}>Exam Name</span>
              <input
                onChange={(e) => setMdExamName(e.target.value)}
                value={mdExamName}
                className="input input-bordered w-full"
                type="text"
                placeholder="Madrasa Name"
              />

              <span className={labelClass}>Madrasa Board</span>
              <input
                onChange={(e) => setMdExamBoard(e.target.value)}
                value={mdExamBoard}
                className="input input-bordered w-full"
                type="text"
                placeholder="Madrasa Board"
              />

              <span className={labelClass}>Passing Year</span>
              <input
                onChange={(e) => setMdPassYear(e.target.value)}
                value={mdPassYear}
                className="input input-bordered w-full"
                type="text"
                placeholder="Passing Year"
              />

              <span className={labelClass}>Madrasa Name</span>
              <input
                onChange={(e) => setMadrasaStudied(e.target.value)}
                value={madrasaStudied}
                className="input input-bordered w-full"
                type="text"
                placeholder="Madrasa Name"
              />

              <span className={labelClass}>Place</span>
              <input
                onChange={(e) => setMdPlace(e.target.value)}
                value={mdPlace}
                className="input input-bordered w-full"
                type="text"
                placeholder="Place"
              />

              <span className={labelClass}>No. of Surah Memorized</span>
              <input
                onChange={(e) => setSurahMemorized(e.target.value)}
                value={surahMemorized}
                className="input input-bordered w-full"
                type="text"
                placeholder="No. of Surah Memorized"
              />

              <input
                type="submit"
                value={updating ? "Updating...." : "UPDATE DETAILS"}
                className="btn btn-primary mt-4 text-white"
                disabled={updating}
              />
            </section>
          </form>

          <div className="h-44"></div>
        </section>

        <Footer />
        <ToastBox />
      </div>
      {/* PRINT SECTION */}
      <section className="px-14 py-8 font-sans no-screen">
        <img src="/img/letterhead.png" alt="" /> <br />
        <h3 className="text-center text-3xl font-semibold py-3">
          Admission Application
        </h3>{" "}
        <br />
        <div>
          {" "}
          <b>Admission For:</b> {course}
        </div>
        <h3 className="font-semibold text-xl mt-6 underline">
          PERSONAL INFORMATIONS
        </h3>
        <div className="flex justify-between">
          <div>
            <table>
              <tr>
                {" "}
                <td className={tdClass}>Student Name:</td> <td>{name}</td>{" "}
              </tr>
              <tr>
                {" "}
                <td className={tdClass}>Date of Birth:</td>{" "}
                <td>{dob && formatDate(dob)}</td>{" "}
              </tr>

              <tr>
                {" "}
                <td className={tdClass}>Father Name:</td> <td>{father}</td>{" "}
              </tr>
              <tr>
                {" "}
                <td className={tdClass}>Mother Name:</td> <td>{mother}</td>{" "}
              </tr>
              <tr>
                {" "}
                <td className={tdClass}>Mother Tongue:</td>{" "}
                <td>{motherTongue}</td>{" "}
              </tr>
              <tr>
                {" "}
                <td className={tdClass}>Permanent Addess:</td>{" "}
                <td>{permAddress}</td>{" "}
              </tr>
              <tr>
                {" "}
                <td className={tdClass}>Communication Address:</td>{" "}
                <td>{commAddress}</td>{" "}
              </tr>
              <tr>
                {" "}
                <td className={tdClass}>Primary Contact:</td> <td>{phone1}</td>{" "}
              </tr>
              <tr>
                {" "}
                <td className={tdClass}>Secondary Contact:</td>{" "}
                <td>{phone2}</td>{" "}
              </tr>
              <tr>
                {" "}
                <td className={tdClass}>Whatsapp:</td> <td>{whatsapp}</td>{" "}
              </tr>
            </table>
          </div>
          <div>
            <div className="flex justify-between items-center px-2 h-36 w-28 border border-black text-center">
              Attach Passport Photo
            </div>
          </div>
        </div>
        <h3 className="font-semibold text-xl mt-6 underline">
          DETAILS OF QUALIFYING EXAMINATION
        </h3>
        <table>
          <tr>
            {" "}
            <td className={tdClass}>Exam Name:</td> <td>{examName}</td>{" "}
          </tr>
          <tr>
            {" "}
            <td className={tdClass}>Exam Board:</td> <td>{examBoard}</td>{" "}
          </tr>
          <tr>
            {" "}
            <td className={tdClass}>Passing Year:</td> <td>{passYear}</td>{" "}
          </tr>
          <tr>
            {" "}
            <td className={tdClass}>School Name:</td> <td>{schoolStudied}</td>{" "}
          </tr>
          <tr>
            {" "}
            <td className={tdClass}>Place:</td> <td>{schoolPlace}</td>{" "}
          </tr>
        </table>
        <b>Marks Obtained</b>
        <div className="marks-table">
          <table>
            <tr>
              <td>
                <b>Lang 1</b>
              </td>
              <td>
                <b>Lang 2</b>
              </td>
              <td>
                <b>English</b>
              </td>
              <td>
                <b>Hindi</b>
              </td>
              <td>
                <b>IT</b>
              </td>
            </tr>
            <tr>
              <td>{Lang1}</td>
              <td>{Lang2}</td>
              <td>{English}</td>
              <td>{Hindi}</td>
              <td>{IT}</td>
            </tr>

            <tr>
              <td>
                <b>Math</b>
              </td>
              <td>
                <b>Physics</b>
              </td>
              <td>
                <b>Chemistry</b>
              </td>
              <td>
                <b>Biology</b>
              </td>
              <td>
                <b>Social Science</b>
              </td>
            </tr>
            <tr>
              <td>{Maths}</td>
              <td>{Physics}</td>
              <td>{Chemistry}</td>
              <td>{Biology}</td>
              <td>{SocialScience}</td>
            </tr>
          </table>
        </div>
        <div
          style={{
            pageBreakAfter: "always",
          }}
        ></div>
        {/* DETAILS OF ISLAMIC EDUCATION */}
        <h3 className="font-semibold text-xl mt-6 underline">
          DETAILS OF ISLAMIC EDUCATION
        </h3>
        <table>
          <tr>
            {" "}
            <td className={tdClass}>Exam Name:</td> <td>{mdExamName}</td>{" "}
          </tr>
          <tr>
            {" "}
            <td className={tdClass}>Exam Board:</td> <td>{mdExamBoard}</td>{" "}
          </tr>
          <tr>
            {" "}
            <td className={tdClass}>Passing Year:</td> <td>{mdPassYear}</td>{" "}
          </tr>
          <tr>
            {" "}
            <td className={tdClass}>Madrasa Name:</td> <td>{madrasaStudied}</td>{" "}
          </tr>
          <tr>
            {" "}
            <td className={tdClass}>Place:</td> <td>{mdPlace}</td>{" "}
          </tr>
          <tr>
            {" "}
            <td className={tdClass}>No. of Surah Memorized:</td>{" "}
            <td>{surahMemorized}</td>{" "}
          </tr>
        </table>
        <br />
        <h4 className="font-semibold text-xl mt-6 underline text-center">
          Declaration
        </h4>
        <div>
          I hereby declare that all the information furnished above is true and
          correct to the best of my knowledge and belief.
          <br />
          <br />
          Place: <br /> Date: <br />
          <div className="text-right italic">Name & Signature of Applicant</div>
        </div>
        <br />
        {/* PARENTS */}
        <div>
          I hereby certify that my ward and I shall follow all the rules,
          regulations and procedures laid down by the college from time to time.
          I hereby put my signature to confirm the above declarations
          <br />
          <br />
          <div className="text-right italic">Name & Signature of Guardian</div>
        </div>
        <br />
        <div className="border border-black p-10 mt-6 rounded-2xl">
          <h3 className="font-semibold text-xl underline text-center">
            For office use only
          </h3>{" "}
          <br />
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
    </>
  );
};

export default Admission;
