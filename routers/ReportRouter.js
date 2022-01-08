const express = require ('express');
const ReportRouter = express.Router ();
const {PrismaClient} = require ('@prisma/client');
const prisma = new PrismaClient ();

ReportRouter.post ('/reportUser/:userId', (req, res) => {
  const reportCreator = req.user.profile;
  const targetId = Number.parseInt (req.params.userId);
  prisma.userReport
    .create ({
      data: {
        ReportCreatorId: reportCreator.UserId,
        ReportTargetId: targetId,
        ReportTitle: req.body.ReportTitle,
        ReportContent: req.body.ReportContent,
      },
    })
    .then (createReportSuccess => {
      res.send ('your report is submitted successfully');
      console.log(createReportSuccess)
    }).catch(error=>{
        res.status(500).send("something went wrong, try again later")
    });
});
