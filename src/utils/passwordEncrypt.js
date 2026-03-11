const bcrypt = require("bcrypt");

const passwordEncrypt = async (password) => {
    const passwordhash = await bcrypt.hash(password, 10);
    return passwordhash;
}

module.exports = passwordEncrypt;