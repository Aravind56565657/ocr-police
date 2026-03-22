exports.success = (message, data = null, meta = null) => {
    const response = { success: true, message };
    if (data) response.data = data;
    if (meta) response.meta = meta;
    return response;
};

exports.failure = (message, error = null) => {
    const response = { success: false, message };
    if (error) response.error = error;
    return response;
};
