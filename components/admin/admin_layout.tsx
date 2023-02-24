import AdminNavBar from "./admin_nav";

const AdminLayout = (props:any) => {
    return (
        <>
          <AdminNavBar active={props.active}/>  
        <div className="min-h-screen bg-lime-50 px-10 lg:px-32 py-20">
           
         
{props.children}
    

        </div></>
    );
}

export default AdminLayout;