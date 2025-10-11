import nodemailer from 'nodemailer';

const createTransporter = () => {
  return nodemailer.createTransport({
    host: smtp.gmail.com,
    port: 587,
    secure: false,
    auth: {
      user: muzamilinc@gmail.com,
      pass: ycqvqvzdpkvkwikg,
    },
  });
};

export default createTransporter;
