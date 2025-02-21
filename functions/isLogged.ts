import decodeToken from "./decode";

const isLogged = () => {
  const decoded: any = decodeToken();
  console.log("decoded", decoded);

  if (decoded === null || decoded?.email !== "sysadmin@dihlizworldschool.com") {
    return false;
  }
  return true;
};
export default isLogged;

// let token = Cookies.get('token');
//         let resp = await fetch(`${ROOT_URL}/validateJWT.php?token=${token}`).then((response) => {
//             return response.json();
//         });
//         if(resp.status=='success'){
//             return true;
//         }

//         return false;
