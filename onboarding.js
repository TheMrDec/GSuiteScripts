// This script requires that you activate the Admin SDK service.
// I have designed this script to work with a daily trigger. 
// If you use anything other than a daily trigger, you will need to modify the onboardingWindowStartTime to reflect that change.

// Set this equal to your Workspace root domain. For Example: 'example.org'
const emailDomain = ''
// Set this equal to your Staff OU. For Example: '/Users/Staff'
const onboardingOrgUnit = ''
// This sets a start time of minus 24 hours. Since the script runs every 24 hours, it shouldn't double onboard users.
const onboardingWindowStartTime = (new Date(Date.now()).getTime() - (24*60*60*1000))
// You must have the onboardingEmail document in the drive of the account that you are using to run this script and that account needs to be the root owner.
const documentName = 'onboardingEmail.pdf'

// These are used for the contents of the email. See the GMailApp API usage for more options.
const subject = "Welcome to Your New Account!"
const body = "We are so glad to have you join our team! \n\rThere is something we need you to take care of real quick for us. For the safety and security of the organization, your account will only have limited access to domain resources, and after a while completely locked out of your account if you don't set up 2 Step Verification. \n\rPlease follow the steps in the attached document to get this set up and gain access to all of the available features of the Google Workspace domain!\n\rIf you happened to set up 2 Step Verification from a pop up that displayed when you first logged in, you can safely ignore this email. \r\nYour account will become unrestricted the day after you have set up 2SV. \r\n\r\nIf for any reason, you still do not have access to certain features after that time should have passed, please let us know by submitting a helpdesk ticket."
const attachment = (DriveApp.getFilesByName(documentName)).next().getAs("application/pdf")

function sendOnboardingMail(){
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

  for (const user in  gsuiteUsers) {
    const currentUser = gsuiteUsers[user]
    if ( currentUser.orgUnitPath.includes(onboardingOrgUnit) && new Date(currentUser.creationTime).getTime() > onboardingWindowStartTime) {
      console.log(`Sending onboarding email to ${currentUser.name.fullName}`)
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
