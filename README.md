- [Welcome](#welcome)
- [Download the app!](#download-the-app)
- [Updating to the latest version of the app](#updating-to-the-latest-version-of-the-app)
- [Requirements to run the project:](#requirements-to-run-the-project)
- [Setup and first run](#setup-and-first-run)
- [Subsequent run](#subsequent-run)
- [Setup to deploy the app](#setup-to-deploy-the-app)
- [Development](#development)
- [API deployment on AWS](#api-deployment-on-aws)
- [App deployment](#app-deployment)

# Welcome

Welcome to the the Volunteering App Github repo

# Download the app!

Get the test version of the app on your own phone so you can see it working in practice.

## iOS

Ask Joanna on Slack to set you up, you'll get an email invitation to download TestFlight and install the app from there.

## Android

Ask the team on Slack - one of the dev team needs to go to [the Google Play Console](https://play.google.com/console) > Volunteer app > Release > Testing > Internal testing, then they'll add your email address to the 'STA Volunteer App' Testers group (NB this must be the email address you use for the Google Play account on your phone).

Once that's done, you go to [this page](https://play.google.com/apps/internaltest/4701609055165574724) and follow instructions to download the app.

# Updating to the latest version of the app

The app is being updated regularly and while it's in private testing your phone won't automatically download the latest version. Here's what you do to get the latest version:

## iOS

[To add]

## Android

On your phone, go to the Play Store page from the app itself -- long press on the icon, choose App Info, then App details in store. Then if you see an 'Update' button click that to install the latest version on your device.

Alternatively, you can go to the link in the instructions above for installing the Android app, then to the Google Play Store page it takes you to. If there's an 'Update' button there click that to install the latest version on your device.

# Requirements to run the project:

1. Node.js LTS release
2. npm
   > npm usually is installed when Node.js is installed. type npm --version to check if it is installed after installing Node.js in Command Terminal
3. Ensure that you have read through for your particular platform: https://reactnative.dev/docs/environment-setup
4. Make sure that you have Android 10 installed and not higher.

# Setup and first run

1. Ensure that you've gone through the following link for your particular platform: https://reactnative.dev/docs/environment-setup

2. Pull the code from Git

3. Open Command terminal

4. Go to the `api` folder inside the project folder (e.g. **\Volunteer-app path\api**)

5. Copy the `.env.example` file in the api root folder and name your new file `.env` in the same folder. Fill in the empty values (`""`) in your file for any credentials/settings (API keys for STA Jira API access, AirTable, etc).

   > **Note** Credentials themselves not provided, these should be requested/provided on joining the dev group.

6. At the command prompt type `npm install` then `npm start` to start the Volunteer App API server.

7. Go to the `app` folder inside the project folder (e.g. **\Volunteer-app path\app**)

8. At the command prompt type `npm install`

   > **Note:** Inside the `app` folder there is package-lock.json. Everytime this is modified, it is advised to repeat step 6 before running the project.

   > **Note:** you may need to run `npm install --legacy-peer-deps`

9. If you are on a Mac, go to the `app/ios` folder in a terminal window. At the command prompt type `pod install`

10. Duplicate the example config file `app/src/Config/index.example.ts` and name your new file `app/src/Config/index.ts`

    > **Note** If the app has difficulty connecting to the API, you may need specify your IP address in `index.ts`. Replace `localhost` in the line `STA_BASE_URL: 'http://localhost:3000'` with your own.

11. type in command terminal: `npm run ios` or `npm run android`

# Subsequent run

1. Open Command terminal.

2. Go to the `api` folder inside the project folder (e.g. **\Volunteer-app path\api**) and enter `npm start` to start the Volunteer App API server.

3. Go to the `app` folder inside the project folder (e.g. **\Volunteer-app path\app**) and enter `npm run ios` or `npm run android`.

   > **On Android,** if you get an error message that includes `INSTALL_FAILED_UPDATE_INCOMPATIBLE` this may be because you previously installed a newer version of the app for your emulator (e.g. on a new branch or testing someone else's pull request) then you switched back to an earlier version. Uninstall the app from your emulator with the command `adb shell pm uninstall org.scottishtecharmy.volunteerapp` then run `npm run android` again.

4. Optional: Update the cached projects/resources data from Jira _(during development, you probably only need to use this if you need the very latest data from Jira or you're actively testing the caching mechanism)_. Open another command terminal window, go to the `api` folder inside the project.
   - If you want to manually update the cached data, enter this command: `node cache/run-projects.js`
     > During development, it's preferable to do this than to run the scheduled cron job described below.
   - If you want to automatically update the cached data regularly using a [cron job](https://en.wikipedia.org/wiki/Cron), enter this command instead: `node cache/run-cron-jobs.js` Leave this terminal window open as long as you want this to keep running.
     > Be careful if using this during development: if multiple developers are running this simultaneously, these could conflict if more than one person is updating the same AirTable tables at the same time.

# Setup to deploy the app

This is how you get set up ready to deploy the app to the Google Play Store (for Android) and TestFlight (for iOS) later, using [Fastlane](https://fastlane.tools/).

You don't need to worry about doing this section until you're through all the steps above and you've solved any headaches getting the API and the app running locally.

**If you're on a Mac** you can deploy the Android and iOS versions of the app.

**If you're on Windows/Linux** you can only deploy the Android version of the app (you'll always need to get another team member with a Mac to deploy the iOS version).

1. Install Fastlane: [Mac instructions in the 'Installing Fastlane' section here](https://thecodingmachine.github.io/react-native-boilerplate/docs/BetaBuild/#installing-fastlane) - [Windows/Linux instructions here](https://docs.fastlane.tools/getting-started/android/setup/)

   ## Google Play Store (Android)

2. Add `key.json` and `my-release-key.keystore` files into the `/app/android/` directory. These files contain credentials for uploading the app to the Google Play Store. Ask on Slack for another developer in the team to send you these files. Also ask them for the password for the `my-release-key.keystore` file -- save this somewhere safe (e.g. [a password manager](https://www.techradar.com/uk/best/password-manager)), you'll need it in the future to deploy the app.

   > Because these files contain sensitive access credentials we should never commit them to GitHub as our repository is open-source, anyone can see it.

   > On some systems, the terminal has a problem if the password for `my-release-key.keystore` contains symbols, so this password may need to be letters and numbers only (just make sure it's a long, strong password). If you need to change the password locally you can use this command `keytool -storepasswd -keystore path/to/my-release-key.keystore -storetype PKCS12`

3. Ask Joanna to give you Developer access to the STA Google Play Store account. That will allow you to check whether releases you deploy have uploaded successfully, and you'll be able to add new testers.

## TestFlight (iOS)

[To add]

# Development

## API

### Caching

#### Projects

Projects data comes originally from Jira. We have found the Jira API can be too slow for us to fetch data from it each time a request is made to the API (partly because of the speed of Jira's API itself, partly because we may be making multiple calls and then combining the data received).

So instead we store a cached copy of projects data, in the format we use it in our API, in our own database (currently AirTable) so that we can deliver a fast response when someone calls our API. There are scripts in the `/api/cache` directory that can be run as a [cron job](https://en.wikipedia.org/wiki/Cron) to regularly update our database from the Jira API.

Please see instructions at the end of the [Subsequent run](#subsequent-run) section above on how to run these scripts.

### Services

#### Slack

This file `/api/services/slack.js` allows you to post messages to Slack. If you want to enable posting to a new channel that we don't already post to, you need to:

1. [Create a Slack app](https://api.slack.com/start/planning) with a bot user, [approved by the owner of the Slack workspace](https://slack.com/intl/en-gb/help/articles/222386767-Manage-app-approval-for-your-workspace#h_01EC8H3AWBYEAAN5AKBTVKPC5K). This step has already been done, the Slack app is called ['Volunteer App'.](https://api.slack.com/apps/A03ALL3M137/general) If you don't have access to this, another member of the team can [add you as a 'collaborator'.](https://app.slack.com/app-settings/T011F5L41NH/A03ALL3M137/collaborators)

2. [Set up a webhook](https://api.slack.com/apps/A03ALL3M137/incoming-webhooks?) for the channel you want to post to. ([More info about Slack webhooks here.](https://api.slack.com/messaging/webhooks))

   > **Note:** this webhook URL must remain secret (don't share it openly, don't commit it to GitHub) as it enables anyone to post to that channel

3. Add the webhook as a variable in your `/api/.env` file (and in `/api/.env.example` but without the webhook URL itself). This variable must be named `SLACK_SECRET_WEBHOOK_` and then the name of the Slack channel, all in capitals and with hyphens replaced by underscores.
   > For example, if the Slack channel is called `my-awesome-channel`, the .env variable should be called `SLACK_SECRET_WEBHOOK_MY_AWESOME_CHANNEL`

# API deployment on AWS

June 2022:

In the volapp-dev-test account, an [Elastic Beanstalk](https://eu-west-2.console.aws.amazon.com/elasticbeanstalk/home?region=eu-west-2#/environments) environment called Volunteerapp-env has been created (manually for now).

You can connect your app to this environment by changing STA_BASE_URL to the load balancer address in `Volunteer-app/app/src/Config/index.ts`:

` STA_BASE_URL: 'http://volunteerapp-env.eba-ivfm2tgp.eu-west-2.elasticbeanstalk.com',`

Note - as we move this into IaC and set up some build pipelines, things like env names, app names, domain names, IP Addresses will probably change.

For support, please @ David Calder in the [volunteer-app](https://scottishtecharmy.slack.com/archives/C01SUL6K5E1) Slack channel

## Updating the app

1. Git clone Scottish-Tech-Army/Volunteer-app to your computer
2. `cd Volunteer-app/api`
3. `zip ../myapp.zip -r * .[^.]*`
4. Go to the AWS Management Console and navigate to Elastic Beanstalk.
5. In [Application versions](https://eu-west-2.console.aws.amazon.com/elasticbeanstalk/home?region=eu-west-2#/application/versions?applicationName=volunteer-app), Upload the myapp.zip that you created in step 3.
6. Now select the version label you've just created and then select Action > Deploy
7. Go to the environment dashboard and check the version label has updated and the Health is OK. If not, check the Logs (menu on the left hand side).

## Known issues

- The iOS simulator only works with the IP Address of the Load Balancer as the value of STA_BASE_URL:
  - ` STA_BASE_URL: 'http://18.134.220.155',`

# App deployment

**If you're on a Mac** you can deploy the Android and iOS versions of the app.

**If you're on Windows/Linux** you can only deploy the Android version of the app (you'll always need to get another team member with a Mac to deploy the iOS version).

1. In the pull request for the changes you're making (e.g. a new app feature), before you submit the PR for review, update the `version` name in `app/package.json`. Normally for minor features/fixes, just update the last number in the version name (e.g. `"1.0.24"` becomes `"1.0.25"`).

2. Add changelog notes - a quick summary (a line or two will usually do) of what this new version does. These should be added to the 'Unreleased' section of [app/android/app/CHANGELOG.md](app/android/app/CHANGELOG.md). You may wish to use the structure suggested by the [Keep a Changelog](https://keepachangelog.com/) project, and use subheadings to indicate additions, changes, fixes, etc.

3. Navigate to the `app/android` directory and run `fastlane pre_beta`. This will update the Android version code (a unique build number), generate a version-specific changelog (`app/android/app/fastlane/metadata/android/en-GB/changelogs/<versionCode>.txt`) from your updates in CHANGELOG.md, and update CHANGELOG.md to move the unreleased changes to the new version.

4. Get your pull request approved as you normally would. When you're ready to merge your code into the `main` branch and deploy the updated app, double-check that your version name and version code from the previous steps are still right compared to what's in `main` (somebody else could have merged in code recently and changed the version name since you last checked - if you need to, update the version name and/or version code and/or changelog files before merging).

5. In `/app/src/Config/index.ts` set `STA_BASE_URL` to point to the external URL for [the API endpoint on AWS](#api-deployment-on-aws) -- not to your localhost or its IP address, otherwise the app won't be able to connect to the API when it's installed on someone's phone.

   ## Google Play Store (Android)

6. Go to the `/app/android` directory in a terminal window and run the command `fastlane beta`. You'll be prompted twice at the beginning for passwords -- both are the password you got for the `my-release-key.keystore` file in the [Setup to deploy the app section](#setup-to-deploy-the-app) above.

   > The process can take a while (sometimes 30 minutes or more)! If it fails, try [the troubleshooting tips here](https://thecodingmachine.github.io/react-native-boilerplate/docs/BetaBuild/#troubleshooting), see [Google Play Store known issues](#google-play-store-known-issues) below or ask for help on the team Slack channel if you can't figure it out.

7. If you have access, check in the [Google Play Console](https://play.google.com/console) that the new version of the app has successfully been added (Volunteer app > Release > Internal testing) -- you should see the new version number next to 'Latest release' under 'Track summary'.

8. Download the updated version of the app to your Android phone ([see download instructions](#download-the-app) near the top of this README). On the Google Play Store screen, there should be an 'Update' button to download the latest version of the app to your device.

   ### Google Play Store known issues

   - Near the end of the deployment process an AAB file is uploaded to the Google Play Store. This can take some time (e.g. 20 minutes on slow internet connections). It should be working, unless you get a `HTTPClient::SendTimeoutError: execution expired` error message in your terminal window. If the Fastlane process fails for this reason, you may need to run it again.

   ## TestFlight (iOS)

9. In `/app/src/Config/index.ts` set `STA_BASE_URL` to point to **the IP address** for the external URL for the API endpoint on AWS, see [known issues](#known-issues) above -- not to your localhost or its IP address.

[More instructions to be added]
