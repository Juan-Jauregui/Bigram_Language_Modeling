/* This program consists of two main parts:

      object language_model:{
         bigram: function(source),
            // Creates a bigram model for a given language data corpus.
            // Models are returned as objects in the following form:
                  {
                     "total": #,    //Total number of bigrams in the model
                     "unique": #,   //Number of unique bigrams in the model
                     "ngrams:" {
                        //An object containing all the bigrams in the model, in
                        //the following form:
                        "word0_word1":{
                           "w0": {
                              "word": "word0",
                              "count": #  //Total incidence count of the word
                           },
                           "w1": {
                              "word": "word1",
                              "count": #  //Same. Note: TOTAL word incidence (meaning
                                             both as part of this bigram and not)
                           },
                        },
                        "word2_word3":{
                           //Same deal
                        },
                        ...
                        "wordN-1_wordN":{
                           //Same deal. Last bigram in the model.
                        }
                     },
                     "token_count": #, //Total number of individual tokens in the model
                     "gram_length": #, //Kind-of-extant; order of the n-gram.
                  }

         test_model: function(model,new_data)
            // Tests a given model (of the form described above) on a given text
            // (new_data) by calculating the model's perplexity on it. Uses the
            // Laplace Smoothing method to deal with zero-count incidences in the
            // new_data. Returns the perplexity value.
      }

      object ngram:{
         make: function(source,ngram_length),
            // Takes a plaintext set of language data and a desired n-gram order
            // (1 for unigram, 2 for bigram, 3 for trigram, etc.)

         tokenize: function(source)
            // Used in the n-gram function, but available to clients of ngram as
            // well. Takes a plaintext set of language data and turns it into an
            // array of tokens. Tokens consist of words or specific punctuation marks
            // like commas, hyphens, as well as sentence start and end tokens.
      }

*/

/* ngram holds the functions necessary to turn a speech into n-grams of a given size */
var ngram = {};

ngram.make = function ngram(source, ngram_len) {
      var token_arr = tokenize(source);
      var ngrams = {};
      for(var i = ngram_len-1; i < token_arr.length; i +=1){
         var ngram = token_arr[i];
         for(var k = 1; k < ngram_len; k+=1){
            ngram = token_arr[i-k] + `_` + ngram;
         }
         if(ngrams[ngram]) ngrams[ngram]++;
         else ngrams[ngram] = 1;
      }
      return (ngrams);
}

/* Takes a text source and pre-processes it for analysis. Returns an array of
   tokens, which are defined as words, sentence start markers, sentence end markers,
   commas */
var tokenize = function(source){
   /* Text cleanup process split into steps for easy documentation */

   /* Convert to lower case & start it off with a sentence start token (<S>) */
   var plaintext = `<S> ` + source.toLowerCase();

   /* Replace periods with a sentence end token </S> followed by a sentence start <S> */
   plaintext = plaintext.replace(/[\.]/g, ` </S> <S>`);

   /* Replace common punctuation that has syntactic significance (commas, hyphens,
      etc) with equivalent tokens */
   plaintext = plaintext.replace(/[,]/g, ` <Comma> `);
   plaintext = plaintext.replace(/[-]/g, ` <Hyphen> `);
   plaintext = plaintext.replace(/[;]/g, ` <Semicolon> `);
   plaintext = plaintext.replace(/[:]/g, ` <Colon> `);
   plaintext = plaintext.replace(/["]/g, ` <Quote> `);
   /* Single quotes are a little special - We match quotes that follow spaces,
      or that are not followed by letters. Else we`d match abbreviations like "don`t"*/
   plaintext = plaintext.replace(/( `)|(`[^a-z])/g, ` <SingleQuote> `);

   /* Sentences which end in quoted material end like this:    ."     or   .`
      This would be replaced to </S> <S> <Quote> or </S> <S> <SingleQuote>. Fix this */
   plaintext = plaintext.replace(/(<\/S> <S> <Quote>)/g, ` <Quote> </S> <S>`);
   plaintext = plaintext.replace(/(<\/S> <S> <SingleQuote>)/g, ` <SingleQuote> </S> <S>`);

   /* Catch-all removal of punctuation that we haven`t already defined */
   plaintext = plaintext.replace(
      /[^a-z </S><Comma><Hyphen><Semicolon><Colon><Quote><SingleQuote>`]/g,
      ` `);

   /* Replace any instances of 2+ spaces with 1 space. */
   plaintext = plaintext.replace(/[, ]{2,}/g, ` `).trim();  //Also trim to remove spaces at the ends.

   /* Take care of extant <S> token at the end of the text */
   if (plaintext.slice(-3) === `<S>`) plaintext = plaintext.substring(0,plaintext.length - 3);

   var tokens = plaintext.split(` `);

   /* Remove empty elements in the array. */
   var index = tokens.indexOf(``);
   while(index !== -1){
      tokens.splice(index, 1);
      index = tokens.indexOf(``);
   }

   return tokens;
}

ngram.tokenize = tokenize;

/* language_model holds all the functions necessary to create bigram language
   models from a given speech. */
var language_model = {};
var ngram_maker = ngram;

language_model.bigram = function(source){
   var tokens = general_model(source,1);
   var bigram = general_model(source, 2);

   /* Augment the basic object returned by the general_model function */
   bigram.token_count = tokens.total;
   bigram.gram_length = 2;
   for(entry in bigram.ngrams){
      var w0 = entry.substring(0,entry.indexOf(`_`));
      var w1 = entry.substring(entry.indexOf(`_`)+1);
      var pW0W1 = (tokens.ngrams[w0])? bigram.ngrams[entry]/tokens.ngrams[w0] : 0;
      var count_temp = bigram.ngrams[entry];
      /* Replace the ngrams property (originally just a key-value pair of bigrams
         and their counts) with some more info. */
      bigram.ngrams[entry] = {
         'w0': {
            'word': w0,
            'count': tokens.ngrams[w0] || 0
         },
         'w1': {
            'word': w1,
            'count': tokens.ngrams[w1] || 0
         },
         'count': count_temp,
         'prob': pW0W1
      };
   }
   return bigram;

};
/* Returns a basic n-gram model of any order for a given source. See var output
   for the format in which this object is returned. */
function general_model(source, gram_len){
   var ngrams = ngram_maker.make(source,gram_len);
   var output = {
      total: 0,   /* To be calculated */
      unique: Object.keys(ngrams).length,
      ngrams: ngrams /* Originally an object of key-value pairs: {'word1_word2': count ...} */
   };
   /* Get a count of all ngrams */
   for(token in ngrams){
      output.total += ngrams[token];
   }
   // console.log(JSON.stringify(output,null,`   `));
   return output;
}

/* Calculates the perplexity of a given model on a given language corpus. */
language_model.test_model = function(model,new_data){
   var smoothed_model = smooth_model(model,new_data);
   // console.log(JSON.stringify(smoothed_model,null,`   `));
   return calc_perplexity(smoothed_model);
}

/* Uses Laplace Smoothing to extend an existing model to fit a test corpus. To do
   this, it generates a bigram model for the new data, and if the existing model
   did not have an entry for a bigram which can be found in the new model, the
   old model is altered to be as if it had seen one instance of that bigram. its
   probability is calculated based on the size of the new corpus' token count*/
function smooth_model(model,new_data){
   var smooth = model;
   var new_tokens = general_model(new_data,1);
   var new_bigrams = language_model.bigram(new_data);
   for(gram in new_bigrams.ngrams){
      if(!(smooth.ngrams[gram])){
         smooth.total++;
         smooth.unique++;
         var w0 = gram.substring(0,gram.indexOf(`_`));
         if(!(new_tokens[w0])) smooth.token_count++;
         smooth.ngrams[gram] = {
            'w0': {
               'word': w0,
               'count': new_tokens[w0] ? new_tokens[w0] : 1
            },
            'count': 1,
            'prob': 1/(new_bigrams.token_count),
            'padded': true
         };
      }
   }
   return smooth;
}

/* Calculates the perplexity of a bigram model. Assumes Laplace Smoothing.
   To prevent underflow, uses the log2 version of the perplexity formula:
         Perplexity = 2 ^ (-1/M)*SUM(P(Wi|Wi-1))*/
function calc_perplexity(smoothed_model){
   var sP = 0; //Arithmetic sum of log2(P) where P is the probability of each bigram
   for(gram in smoothed_model.ngrams){
      sP += Math.log2(smoothed_model.ngrams[gram].prob);
   }
   return Math.pow(2,(sP)*(-1/smoothed_model.token_count));
}

/* Export the language_model object as the interface for this module. */
module.exports = language_model;
