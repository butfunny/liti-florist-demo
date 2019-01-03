const token = "TGl0aWZsb3Jpc3Q6SGFub2kxMjMkJQ==";
const url = "https://njl92.api.infobip.com/sms/1/text/single";
const request = require("request");


module.exports = {
    sendMessage: (formData) => {
        request.post({
            headers: {
                Authorization: `Basic ${token}`,
                "Content-Type": "application/json"
            },
            form: formData,
            url
        })
    }
};