# GoSushi

To run locally:

1. Set your PORT environment variable. (setx PORT <numnber> or export PORT <number>). On Windows, you'll need to relaunch your cmd.
2. Run `node app.js` in the gosushi_server folder
3. Run `npm start` in the gosushi_client folder

Creating and running unit tests:
    
1. Go to gosushi_server
2. run `npm test` or `npx jasmine` to run all test files
3. run `npx jasmine spec/_filename_.test.js` to run tests in only individual files
4. All unit tests must be terminated by .test.js and must be within the spec/tests folder.
   They can be placed within subfolders if necessary. See jasmine.test.js for an example.

