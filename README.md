# GoSushi

To run locally:

1. Set your SERVERPORT environment variable. (setx SERVERPORT <numnber> or set SERVPORT=<number> or export SERVERPORT <number>). On Windows, you'll need to relaunch your cmd. Choose a number that isn't 3000 or set your PORT environment variable as well.
2. Run `node app.js` in the gosushi_server folder
3. Run `npm start` in the gosushi_client folder

Running unit tests:
    
1. Go to root folder
2. run `npm test` to run all test files
3. run `npx jasmine <filename> --random=false` to run tests in only individual files
   Filename should point to the corresponding .js file located in the `gosushi_server/dist/spec` folder

Creating unit tests:

1. All unit tests must be terminated by .test.ts and must be within the spec/tests folder.
   They can be placed within subfolders if necessary. See jasmine.test.ts for an example.

