/* import fs for filesystem access */
var fs = require(`fs`);

/* Import my language_model module */
var language_model = require(`./language_model.js`);

/* Read the contents of LB_Train as a string (utf-8) */
var LB_Train = fs.readFileSync(`./Speeches/LB_Train.txt`,`utf-8`);
/* Create a model LB on the LB_Train corpus. Model is a standard JS object.
   See language_model.js for details*/
var LB = language_model.bigram(LB_Train);
/* Save the model as a JSON file for sharing and reuse. */
fs.writeFile('./Models/LB.json',(JSON.stringify(LB,null,`   `)), 'utf8' );

/* Read the contents of LB_Test as a string((utf-8)) */
var LB_Test = fs.readFileSync(`./Speeches/LB_Test.txt`,`utf-8`);
/* Calculate the perplexity of LB on LB_Test */
var LB_Test_Perplexity = language_model.test_model(LB,LB_Test);

/* ----------------------------------------------------------------------------- */

/* Read the contents of MB_Train as a string (utf-8) */
var MB_Train = fs.readFileSync(`./Speeches/MB_Train.txt`,`utf-8`);
/* Create a model MB on the MB_Train corpus. Model is a standard JS object.
   See language_model.js for details*/
var MB = language_model.bigram(MB_Train);
/* Save the model as a JSON file for sharing and reuse. */
fs.writeFile('./Models/MB.json',(JSON.stringify(MB,null,`   `)), 'utf8' );

/* Read the contents of MB_Test as a string((utf-8)) */
var MB_Test = fs.readFileSync(`./Speeches/MB_Test.txt`,`utf-8`);
/* Calculate the perplexity of MB on MB_Test */
var MB_Test_Perplexity = language_model.test_model(MB,MB_Test);

/* ----------------------------------------------------------------------------- */

/* Calculate the perplexity of MB on LB_Train */
var P_MB_On_LBt = language_model.test_model(MB,LB_Train);
/* Calculate the perplexity of LB on MB_Train */
var P_LB_On_MBt = language_model.test_model(LB,MB_Train);

/* ----------------------------------------------------------------------------- */

/* Create a string holding the results of our calculations */
var results =  `\na. See ./Models/LB.json\n\n` +
               `b. The perplexity of LB on LB_Test is ${LB_Test_Perplexity}\n\n` +
               `c. See ./Models/MB.json\n\n` +
               `d. The perplexity of MB on MB_Test is ${MB_Test_Perplexity}\n\n` +
               `e. The differences of the perplexities of each model on their\n`+
               `respective test corpora are not drastic, though they are notable.\n`+
               `Due to the fact that LB_Train was significantly smaller than MB_Train,\n`+
               `the perplexity of LB on LB_Test was higher than MB's was on MB_Test.\n\n` +
               `f.\n    * The perplexity of MB on LB_Train is ${P_MB_On_LBt}` +
               `\n    * The perplexity of LB on MB_Train is ${P_LB_On_MBt}\n\n`+
               `The perplexity of MB on LB_Train was actually better than that of LB\n`+
               `on LB_Test, despite being derived from a different interlocutor.\n`+
               `I suspect the sheer size of MB's base corpus is diverse enough to\n`+
               `predict LB_Train well enough.\n\nLB on MB_Train, on the other hand,\n`+
               `has a horrendous perplexity of 1787. The small size of LB's corpus\n`+
               `combined with the (wildly) different source of speaker likely makes\n`+
               `LB not a very good model.`
;

console.log(results);   /* Print the results to the console */

/* Write the results to Output/Results.txt */
fs.writeFile('./Output/Results.txt', results , 'utf8');
