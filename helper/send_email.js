const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "testmailmailtest2@gmail.com",
        pass: "!Test123"
    }
})

const generateOtp = () => {
    let otp  = 0; // container of otp
        //generate random 6 digit otp
        for(var i = 0;i<6;i++)
        {
            otp *= 10;
            otp += Math.floor(Math.random()*10);
        }
        return otp;
 }

const sendOtp = (email) =>{

    return new Promise((resolve,reject)=>{
        const otp = generateOtp();
    const mail = {
        from: "testmailmailtest2@gmail.com",
        to: email,
        subject: "OTP Confirmation Password Manager",
        text: "Copy the OTP given and paste it into the input box " + otp
    }

    //send the mail, if the mail sent is successful load the confirmation of otp page
    //else log the error message
    transporter.sendMail(mail,function(err,info){
        if(err) 
        { 
            reject(err);            
        }
        else 
        {
            resolve(otp);
        }
    })
    })
}

module.exports = sendOtp;