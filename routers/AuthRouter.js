const express = require ('express');
const bcrypt = require ('bcrypt');
const AuthRouter = express.Router ();
const {PrismaClient} = require ('@prisma/client');

const prisma = new PrismaClient ();
AuthRouter.post ('/signUp', async (req, res, next) => {
console.log(req.body)
  const UserAccount = {
    AccountName: req.body.AccountName,
    AccountPassword: req.body.AccountPassword,
  };

  const hashedPassword = await bcrypt.hash (UserAccount.AccountPassword, 12);
  prisma.userAccount.create ({
    data: {
      AccountName: req.body.AccountName,
      AccountPassword: hashedPassword,
      UserId: 1
    },
  }).then(result=>{
      res.send(result)
  });
});

module.exports = AuthRouter;
