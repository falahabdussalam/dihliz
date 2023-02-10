import { ROOT_URL } from '@/data/const';
import newQuote from '@/functions/newQuote';
import { useState } from 'react';
import {IoArrowBack} from 'react-icons/io5'
import {AiOutlineFileDone} from 'react-icons/ai'

const QuoteForm = (props:any) => {
    const [name,setName] = useState<any>(null);
    const [email,setEmail] = useState<any>(null);
    const [phone,setPhone] = useState<any>(null);

    const [isSent,setIsSent] = useState<boolean>(false);
    const [sending,setSending] = useState<boolean>(false);

    if(props.open){
        return (
            <div className="bg-black bg-opacity-50  top-0 bottom-0 left-0 right-0 fixed flex justify-end items-center"
            onClick={()=>props.onClose()}
            style={{
                minHeight: '100vh',
                minWidth: '100vw',
                zIndex:"9999",
                
            }}
            >
                <div className=" bg-white p-10  shadow-2xl w-full lg:w-6/12 h-screen r-0"
                data-aos="fade-left"
                data-aos-duration="400"
                style={{
                
                    zIndex:"200"
                }}
                onClick={(e)=>e.stopPropagation()}
                >
                    <div 
                    className='rounded-xl border-2 hover:border-dihliz-400 inline-block p-2 duration-500 mb-4 '
                    onClick={()=>props.onClose()}>
                    <IoArrowBack className='text-dihliz-500 text-2xl '
                   
                    />
                    </div>
                    
                    <section className='flex'>
                       
                        
        <img src={ROOT_URL+"/uploads/"+props.data.thumb}
        className="rounded-2xl w-20 border mr-4"
        alt="" /> 
                       
                        <div>
                        <h3 className="text-gray-500 uppercase">Get Quote For</h3>
                <h1 className="font-bold text-3xl text-dihliz-400">{props.data.name}</h1>
                        </div>


                    </section>
                    <br />
                    
                    {
                        !isSent?
                        <form
                    onSubmit={(e)=>{
                        e.preventDefault();
                        setSending(true);
                        newQuote(props.data.id, name, email, phone).then((res:any)=>{
                            if(res.data.status === 'success'){
                                setIsSent(true);
                                setSending(false);
                            }
                            
                        })
                    }}
                    >
                        <p className='text-gray-400 mb-2'>Please fill the following form. </p>
<input type="text" className='input input-bordered border-2 border-dihliz-500 w-full lg:w-9/12 mb-4' placeholder='Name' onChange={(e)=>setName(e.target.value)} required/>

<input type="email" className='input input-bordered border-2 border-dihliz-500 w-full lg:w-9/12 mb-4' placeholder='Email' onChange={(e)=>setEmail(e.target.value)} required/>

<input type="number" className='input input-bordered border-2 border-dihliz-500 w-full lg:w-9/12 mb-4' placeholder='Phone Number' onChange={(e)=>setPhone(e.target.value)} required/>
<br />
<div className='flex justify-center lg:justify-start'>
<input type="submit" className='btn bg-dihliz-500' value={sending?"Sending...":"Submit"} />

</div>
</form>:<div className='bg-dihliz-50 p-5 rounded-lg text-lg lg:w-9/12 shadow'>
    <AiOutlineFileDone className='text-5xl text-dihliz-500 mb-3'/>
    
    Your Quote has been sent. We will connect you as soon as possible.
    <br />
    Thank you for your interest in us. <br /> <br />
    <button className='btn btn-sm bg-dihliz-500'
    onClick={()=>props.onClose()}
    >Back to Product</button>
</div>
                    }
                </div>
            </div>
        );
    }else{
        return (<></>);
    }
    
}
 
export default QuoteForm;
