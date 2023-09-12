function getUserRole(altUserRoles: string[]) {
    if (altUserRoles.includes("systemAdmin")) {
      return "systemAdmin";
    } else if (altUserRoles.includes("student")) {
      return "student";
    } else if (altUserRoles.includes("teacher")) {
      return "student";
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
  export { getUserGroup, getUserRole };
  