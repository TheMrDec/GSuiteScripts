// This script requires that you activate the Admin SDK service.
// I recommend that you set triggers to send weekly, ideally just before your users arrive for the start of their work week.

// Set this equal to your Workspace root domain For Example: 'example.org'
const emailDomain = ''
// Add your root staff OU and your 2SV recovery OU here. For Example: '/Users/Staff'
const reminderOrgUnits = ["OU1","OU2"]
// You must have the onboardingEmail document in the drive of the account that you are using to run this script and that account needs to be the root owner.
const documentName = 'onboardingEmail.pdf'

// These are used for the contents of the email. See the GMailApp API usage for more options.
const subject = "2 Step Verification Reminder"
const body = "This is an automated email reminding you to take a few minutes to set up 2 Step Verification on your account. For the safety and security of the organization, your account will only have limited access to domain resources, and after a while completely locked out of your account if you don't set up 2 Step Verification. \n\rPlease follow the steps in the attached document to get this set up and gain access to all of the available features of the Google Workspace domain.\n\rYour account will become unrestricted the day after you have set up 2SV. \r\n\r\nIf for any reason, you still do not have access to certain fetures after that time should have passed, please let us know by submitting a helpdesk ticket."
const attachment = (DriveApp.getFilesByName(documentName)).next().getAs("application/pdf")

function send2SVReminderEmail() {
  // API query limit is 500 users so we need to do multiple queries to get all users. 
  // TODO: Maybe only get users in selected OUs to reduce API call overhead for large sites
  var pageToken
  var gsuiteUsers = []
  do {
    gsuiteUserPage = AdminDirectory.Users.list({
      domain: emailDomain,
      orderBy: 'givenName',
      maxResults: 500,
      pageToken: pageToken
    });
    gsuiteUsers = gsuiteUsers.concat(gsuiteUserPage.users)
    pageToken = gsuiteUserPage.nextPageToken
  } while (pageToken);

  // Check if user exists in the OUs selected above and if they are enrolled in 2 Step Verification, send reminder if needed.
  for (const user in gsuiteUsers) {
    const currentUser = gsuiteUsers[user]
    if ( reminderOrgUnits.includes(currentUser.orgUnitPath) && currentUser.isEnrolledIn2Sv == false) {
      console.log(`Sending 2SV reminder email to ${currentUser.name.fullName}`)
      GmailApp.sendEmail(
        currentUser.primaryEmail,
        subject,
        body,
        {
          attachments: [attachment],
          noReply: true
        }
      )
    }
  }
}
