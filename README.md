# Bigram_Language_Modeling
A small set of functions to tokenize language corpora and generate predictive bigram models, as well as test the perplexity of these models on other sets of language data.

This program consists of two main parts:

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
