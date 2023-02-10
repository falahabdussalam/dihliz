import Cookies from "js-cookie";

const logout = ()=>{
Cookies.remove('token');
window.location.replace('/cpanel/login');
}
export default logout;