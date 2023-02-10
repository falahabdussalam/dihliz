const Dialog = (props:any) => {
    if(props.open){
        return (
            <div className="bg-black bg-opacity-50  top-0 bottom-0 left-0 right-0 fixed flex justify-center items-center"
            onClick={()=>props.onClose()}
            style={{
                minHeight: '100vh',
                minWidth: '100vw',
                zIndex:"9999",
                
            }}
            >
                <div className="bg-white p-10 rounded-lg shadow-2xl"
                style={{
                    minWidth:"30rem",
                    zIndex:"200"
                }}
                onClick={(e)=>e.stopPropagation()}
                >
                {props.children}
                </div>
            </div>
        );
    }else{
        return (<></>);
    }
    
}
 
export default Dialog;