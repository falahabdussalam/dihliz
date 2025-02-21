import jwt_decode from "jwt-decode";

const decodeByToken = (token: string) => {
  if (token) {
    var decoded = jwt_decode(token!);
    return decoded;
  }
  return null;
};

export const isLoggedServer = (token?: string) => {
  if (!token) {
    return false;
  }
  const decoded: any = decodeByToken(token);
  console.log("decoded", decoded);

  if (decoded === null || decoded?.email !== "sysadmin@dihlizworldschool.com") {
    return false;
  }
  return true;
};
