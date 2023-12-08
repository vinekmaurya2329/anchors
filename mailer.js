const nodemailer  = require('nodemailer');
 
  // const emailDetails = localStorage.getItem('ReqDetails')
const sendmail =async (req,res ,next)=>{
   console.log(req.body ,' reqbody');
  let testAccount = await nodemailer.createTestAccount();
//  connect ethereal server 
    const transporter = await  nodemailer.createTransport({
      service: "gmail",  
      host: 'smtp.gmail.com',
        secure:false,
        port: 587,
        auth: {
            // user: 'kari9@ethereal.email',
            // pass: 'cyAXm2QX65UTr1mQ8R' 
            user: process.env.EMAIL,
            pass: process.env.PASS
            // user:'vinekmaurya2329@gmail.com',
            // pass:'qmaimdzjfyxkttok' 
            
        }
    }); 
    
    //  send mail 
    const info = await transporter.sendMail({
        from: `vinek`, // sender address
        to: "aashmaurya7522@gmail.com", // list of receivers
        subject: "Request a Call back ", // Subject line
        text: " this  is a  reminder message"// plain text body
        // html:`<h4>name : ${emailDetails.name}</h4> <h5>contact : ${emailDetails.number}</h5>`, 
      });
       
      
}
  

module.exports = sendmail;