// If you edit anything past the warning, I am not responsible for your mistakes. 
// Don't edit the script if you don't know what you're doing. (sans the group email)

// Script requires the Admin SDK Service and for the init function to be run once. 
// Each time the script runs, it will automatically kill its old triggers and make a new one for the following year.

const ASEmail = 'autosuspend@yourdomain.fillthisout'
const failsafeCues = ['admin']

//// DO NOT EDIT BELOW THIS LINE

function init() {
  // Try to create autosuspend group 
  try {
    const groupData = {
      email: ASEmail,
      name: 'autosuspend'
    }
    AdminDirectory.Groups.insert(groupData)
  } catch (err) {
    console.log(err)
  }

  // Get todays date and create trigger for this year
  const today = new Date();
  const triggerDate = new Date(`August 1, ${today.getFullYear()} 01:00:00 CST`);
  console.log(triggerDate)
  ScriptApp.newTrigger('autosuspend')
    .timeBased()
    .at(triggerDate)
    .create();
}

function autoSuspend() {
  // Get members of suspend group
  const group = GroupsApp.getGroupByEmail(ASEmail,)
  const users = group.getUsers();

  // Iterate over users, test for failsafe cues, update suspended property if safe
  for (let i = 0; i < users.length; i++) {
    const useritem = users[i];
    const email = useritem.getEmail();
    const user = AdminDirectory.Users.get(email);
    let failsafeFlag = false
    for (let c = 0; c < failsafeCues.length; c++) {
      if (email.includes(failsafeCues[c])) {
        failsafeFlag = true
      }
    }
    if (failsafeFlag = true) {
      console.log('FAILSAFE ACTIVATED!!!! ADMIN ACCOUNT SUSPENSION PREVENTED')
    } else {
      try {
        user.suspended = true;
        AdminDirectory.Users.update(user, email);
        console.log('User %s suspended successfully.', email);
      } catch (err) {
        console.log('Error suspending user %s: %s', email, err.message);
      }
    }
  }

  // Delete all triggers in the current project.
  const triggers = ScriptApp.getProjectTriggers();
  for (let i = 0; i < triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
  }

  // Get todays date and create trigger for next year
  const today = new Date();
  const triggerDate = new Date(`August 1, ${today.getFullYear() + 1} 01:00:00 CST`);
  console.log(triggerDate)
  ScriptApp.newTrigger('autosuspend')
    .timeBased()
    .at(triggerDate)
    .create();
}
