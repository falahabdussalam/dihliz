import jwt_decode from "jwt-decode";
import Cookies from "js-cookie";

const decodeToken = () => {
  const token = Cookies.get("token");
  if (token) {
    var decoded = jwt_decode(token!);
    return decoded;
  }
  return null;
};

export default decodeToken;
