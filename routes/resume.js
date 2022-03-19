const express = require("express");
const knex = require("../dbconnection");
const moment = require('moment')
const {
  checkAuthenticated,
  checkNotAuthenticated,
} = require("../middlewares/auth");
const router = express.Router();

function uniqueId(appIdColumn) {
  const arrayOfIds = appIdColumn.map( app => app.application_id);
  if (appIdColumn != 0) {
          return Math.max(...arrayOfIds) + 1;
  }
  return 1;
}

router.get('/careers/job/:job_id/resume', async (req, res) => {
  const jobId = req.params.job_id
  const applicantDetails = await knex('job_application.applicant_details')
  const history = await knex('job_application.employment_history')
  const unique = uniqueId(applicantDetails)
  const jobs = await knex
    .select()
    .from("jobs.job_opening")
    .where("job_id",jobId);
  const admin = await knex('admin.skill')
  console.log(admin);
  // const thisDay = moment().format('L')
  // console.log(thisDay);
  res.render('resume', { jobId, jobs, history, admin, unique })
})

router.post('/careers/job/:job_id/resume', async (req, res) => {
  const jobId = req.params.job_id
  const {
    appId,
    first_name, 
    middle_name, 
    last_name, 
    gender,
    date_of_birth,
    email,
    skype,
    mobile,
    preferred_contact,
    address,
    city,
    province,
    expected_salary,
    start_date,
    preferred_interview_date_1,
    preferred_interview_date_2,
    preferred_interview_date_3,
    skill_id,
    skill_years,
    skill_self_rating,
    capability_1,
    capability_2,
    capability_3,
    year_experience,
    history_start_date_1,
    history_end_date_1,
    position_1,
    company_1,
    history_start_date_2,
    history_end_date_2,
    position_2,
    company_2,
    history_start_date_3,
    history_end_date_3,
    position_3,
    company_3,
  } = req.body
  const startDate1 = moment(history_start_date_1, 'MM/DD/YYYY')
  const endDate1 = moment(history_end_date_1, 'MM/DD/YYYY')
  const startDate2 = moment(history_start_date_2, 'MM/DD/YYYY')
  const endDate2 = moment(history_end_date_2, 'MM/DD/YYYY')
  const startDate3 = moment(history_start_date_3, 'MM/DD/YYYY')
  const endDate3 = moment(history_end_date_3, 'MM/DD/YYYY')

  const yearDiff1 = endDate1.diff(startDate1, 'years');
  const yearDiff2 = endDate2.diff(startDate2, 'years');
  const yearDiff3 = endDate3.diff(startDate3, 'years');

  const totalYears = yearDiff1 + yearDiff2 + yearDiff3

  const today = new Date()
  const thisDay = moment(today, 'MM/DD/YYYY')

  knex('job_application.applicant_details')
    .insert({
      job_id: jobId,
      application_id: appId,
      first_name,
      middle_name, 
      last_name, 
      gender,
      date_of_birth,
      email,
      skype,
      mobile,
      preferred_contact,
      address,
      city,
      province,
      expected_salary,
      start_date,
      preferred_interview_date_1,
      preferred_interview_date_2,
      preferred_interview_date_3,
      year_experience: totalYears,
      date_applied: thisDay,
      date_last_updated: thisDay 
    })
    .where('job_id', jobId)
    .then(() => {
        knex('job_application.capabilities')
          .insert({
            application_id: appId,
            capability_1,
            capability_2,
            capability_3,
          })
          .where('application_id', appId)
          .then(()=> {
              knex('job_application.employment_history')
                .insert({
                  application_id: appId,
                  history_start_date_1: startDate1,
                  history_end_date_1: endDate1,
                  position_1,
                  company_1,
                  history_start_date_2: startDate2,
                  history_end_date_2: endDate2,
                  position_2,
                  company_2,
                  history_start_date_3: startDate3,
                  history_end_date_3: endDate3,
                  position_3,
                  company_3,
                })
                .where('application_id', appId)
                .then(async ()=> {
                  const skill = await knex('admin.skill')
                  if(skill != 0){
                    for ( let i = 0; i < skill_id.length; i++) {
                      knex('job_application.applicant_rating')
                        .insert({
                          application_id: appId,
                          skill_id: skill_id[i],
                          skill_years: skill_years[i],
                          skill_self_rating: skill_self_rating[i]
                        })
                        .where('application_id', appId)
                        .then(result => result)
                    }
                  }
                })
          })
          res.redirect(`/careers/job/${jobId}/resume/application/${appId}`)
    })
})

module.exports = router