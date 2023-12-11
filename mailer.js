const nodemailer  = require('nodemailer');
 
  // const emailDetails = localStorage.getItem('ReqDetails')
const sendmail =async (req,res ,next)=>{
  const {name ,number,time,comment} = req.body;
   console.log(req.body ,' reqbody');
   console.log(name , number);
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
    
    //  send mail  - - -- - -
    const info = await transporter.sendMail({
        from: `vinekmaurya2329@gmail.com`, // sender address
        to: "ravi@anchors.in", // list of receivers
        subject: "Request a Call back ", // Subject line
        text: `  `,// plain text body
        html:` <h2>this  is a  reminder message to contact ${name}</h2><h3>name : ${name}</h3> <h5>contact : ${number}</h5> <p>time : ${time}</p> <p> comment : ${comment}</p>`, 
      });
       
      
}
  

module.exports = sendmail;