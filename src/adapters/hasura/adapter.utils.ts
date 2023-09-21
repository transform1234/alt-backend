function getUserRole(altUserRoles: string[]) {
  if (altUserRoles.includes("systemAdmin")) {
    return "systemAdmin";
  } else if (altUserRoles.includes("student")) {
    return "student";
  } else if (altUserRoles.includes("teacher")) {
    return "teacher";
  } else return "user";
}

function getUserGroup(role: string) {
  switch (role) {
    case "systemAdmin":
      return "systemAdmin";
    case "teacher":
      return "teacher";
    default:
      return "student";
  }
}

function getUsername(obj: any) {
  return (
    obj.name.toLowerCase().replace(/ /g, "") +
    obj.dateOfBirth.replace(/\-/g, "")
  );
}

function getPassword(length: number) {
  const chars =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = length; i > 0; --i)
    result += chars[Math.floor(Math.random() * chars.length)];
  // let timestamp = Math.floor(Date.now() / 1000).toString();
  // result += timestamp;
  return result;
}

async function encryptPassword(password) {
  try {
    const buff = Buffer.from(password);
    const base64data = buff.toString("base64");
    return base64data;
  } catch (e) {
    console.log(e);
    return e;
  }
}

async function decryptPassword(encrypted) {
  try {
    const buff = Buffer.from(encrypted, "base64");
    const text = buff.toString("ascii");
    return text;
  } catch (e) {
    return e;
  }
}

async function getToken() {
  const axios = require("axios");
  const qs = require("qs");
  const data = qs.stringify({
    username: process.env.KEYCLOAK_USERNAME,
    password: process.env.KEYCLOAK_PASSWORD,
    grant_type: "password",
    client_id: "admin-cli",
  });
  const config = {
    method: "post",
    url: "https://alt.uniteframework.io/auth/realms/master/protocol/openid-connect/token",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: data,
  };

  let res;
  try {
    res = await axios(config);
  } catch (error) {
    console.log(error, "err");
  }

  return res;
}

async function createUserInKeyCloak(query, token) {
  const axios = require("axios");
  const name = query.name;
  const nameParts = name.split(" ");
  let lname = "";

  if (nameParts[2]) {
    lname = nameParts[2];
  } else if (nameParts[1]) {
    lname = nameParts[1];
  }
  if (!query.password) {
    return "User cannot be created";
  }

  const data = JSON.stringify({
    firstName: nameParts[0],
    lastName: lname,
    email: query?.email,
    enabled: "true",
    username: query.username,
    groups: [getUserGroup(query.role)],
    credentials: [
      {
        temporary: "false",
        type: "password",
        value: query.password,
      },
    ],
  });

  const config = {
    method: "post",
    url: process.env.ALTKEYCLOAK,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    data: data,
  };

  let userResponse;
  try {
    userResponse = await axios(config);
  } catch (e) {
    console.log(e, "Keycloak Creation error");
    return e;
  }

  const userString = userResponse.headers.location;
  const userId = userString.lastIndexOf("/");
  const result = userString.substring(userId + 1);

  return result;
}

export {
  getUserGroup,
  getUserRole,
  getToken,
  createUserInKeyCloak,
  getUsername,
  getPassword,
  encryptPassword,
  decryptPassword,
};
