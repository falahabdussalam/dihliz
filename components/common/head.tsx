import Head from 'next/head'

const HeadTag = (props:any) => {
    const descr:string = "A school of excellence under Markaz Garden Group of Institutions";
    return (
        <Head>
<title>{props.title??"Dihliz World School"}</title>
<meta name="title" content={props.title??"Dihliz World School"}/>
<meta name="description" content={props.description??descr}/>

<meta property="og:type" content="website"/>
<meta property="og:url" content={props.url??"https://dihlizworldschool.com"}/>
<meta property="og:title" content={props.title??"Dihliz World School"}/>
<meta property="og:description" content={props.description??descr}/>
<meta property="og:image" content={props.image??"https://dihlizworldschool.com/thumb.jpg"}/>

<meta property="twitter:card" content="summary_large_image"/>
<meta property="twitter:url" content={props.url??"https://dihlizworldschool.com"}/>
<meta property="twitter:title" content={props.title??"Dihliz World School"}/>
<meta property="twitter:description" content={props.description??descr}/>
<meta property="twitter:image" content={props.image??"https://dihlizworldschool.com/thumb.jpg"}></meta>
<link rel="icon" href="/favicon.ico" />
        </Head>
    );
}
 
export default HeadTag;