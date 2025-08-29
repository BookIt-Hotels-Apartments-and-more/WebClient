export const displayableRole = (roleId) => {
    const roles = {
    0: "Admin",
    1: "Landlord",
    2: "Traveller",
    };
    return roles[roleId] || "Unknown Role";
}