const PageHeader = ({title}:{title:string}) => {
    return (
        <div>
            
            <div className="flex justify-center pt-20 pb-3" >
                    <img src="/img/icon.png" className="w-32" alt="" />
                </div>
                <h1 className="text-center text-dihliz-500 font-bold text-4xl pb-20">{title}</h1>
        </div>
    );
}

export default PageHeader;