
const SocialIcons = () => {
    const links = [
        ["facebook","https://www.facebook.com/malaibar.org/"],
        ["instagram","https://www.instagram.com/malaibar_org/"],
        ["twitter","https://twitter.com/malaibarorg"],
        ["youtube","https://www.youtube.com/c/MalaibarFoundation"],
        // ["whatsapp","http://wa.me/+916235600600"],
        // ["linkedin","https://www.linkedin.com/company/markazcity"],
    ];
    return (<div className="flex">
{
    links.map(link=>(
        <a href={link[1]} key={link[0]}
        target="_blank"
        rel="noopener noreferrer"
        className="social-ico"
        > <img src={"/img/icons/"+link[0]+".svg"} alt="" width="25px" className="mx-1" 
      
        /> </a>
    ))
}
    </div>);
}
 
export default SocialIcons;