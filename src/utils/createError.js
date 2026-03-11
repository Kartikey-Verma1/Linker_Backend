const createError = (statusCode, message, extra={}) => {
    const err = new Error();
    err.statusCode = statusCode;
    err.message = message;
    err.data = extra;
    
    return err;
}

module.exports = createError;