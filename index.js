const OpenAI = require('openai');
const { Configuration, OpenAIApi } = OpenAI;


require('dotenv').config({ path: './.env' })

const configuration = new Configuration({
    // organization: "org-PLcLu0w8BR5R4wppBKjKw8vk",
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = process.env.EXPRESS_PORT;
const maxTokens = process.env.EXPRESS_MAX_OPENAI_TOKENS;

const { MongoClient } = require('mongodb');

const uri = process.env.DB_URL

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function getDocumentByName(name) {
    try {
      await client.connect();
      const db = client.db('baby_data');
      const collection = db.collection('details');
  
      const document = await collection.findOne({ name: name });
  
      return document;
    } catch (error) {
      console.error('Error retrieving document', error);
    } finally {
      await client.close();
    }
  }

app.use(bodyParser.json());
app.use(cors());

app.get('/names', async (req, res) => {
    try {
      await client.connect();
      const db = client.db('baby_data');
      const collection = db.collection('details');
       const documents = await collection.find().toArray();
      const names = documents.map((document) => document.name);
       res.json(names);
    } catch (error) {
      console.error('Error retrieving names', error);
      res.status(500).json({ error: 'Error retrieving names' });
    } finally {
      await client.close();
    }
});

app.post('/', async (req, res) =>  {
    const { message } = req.body;

    const query = "What is the name mentioned in the following sentence?" + "\n" + message
    let get_name = "", name = "";
    try{
        let response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{role:"user", content: query}]
        });
        console.log("*************")
        get_name = response.data.choices[0].message.content
        console.log(get_name) // there is no...

    }catch(err){
        console.error(err);
        console.log("error while getting name")
    }
    
    if (get_name){
        const words = get_name.split(" ");
        const last_words = words[words.length - 1]
        
        const str = last_words.split('"'); 
        if (str.length == 1)
            name = str[0].replace(/[^\w]+$/, '');   
        if (str.length > 1)
            name = str[1].replace(/[^\w]+$/, '');
    }
    
    console.log(name)   //hi
    const document = await getDocumentByName(name);
    let prompt = ""
    if (document != null)
        prompt = JSON.stringify(document) + "\n" + "This is the information of " + name + "\n" + message;
    else
        prompt = message

    console.log("----------")
    console.log(prompt);
    
    try {
        const response_babii = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }]
        });
    
        if (response_babii.data.choices[0].message.content) {
            res.status(200).json({
                message: response_babii.data.choices[0].message.content
            });
        }
    } catch (error) {
        // Handle the error here
        console.error(error);
        // res.status(500).send("An error occurred.");
        // res.status(429).send(JSON.stringify({
        //     message: "Please try again after a few moments"
        // }));

        res.status(429).json({ message: "Please try again after a few moments" });

    }
});

app.listen(port, () => {
});