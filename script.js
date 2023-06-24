onload = function() {
    var chat = {
      messageToSend: '',
      init: async function() {
        this.chatTree = new ChatTree();
        await this.chatTree.init();
        this.cacheDOM();
        this.bindEvents();
        await this.render();
      },
      cacheDOM: function() {
        this.$chatHistory = $('.chat-history');
        this.$button = $('button');
        this.$textarea = $('#message-to-send');
        this.$chatHistoryList =  this.$chatHistory.find('ul');
      },
      bindEvents: function() {
        this.$button.on('click', this.addMessage.bind(this));
        this.$textarea.on('keyup', this.addMessageEnter.bind(this));
      },
      render: async function() {
        this.scrollToBottom();
        if (this.messageToSend.trim() !== '') {
          var template = Handlebars.compile($("#message-template").html());
          var context = {
            messageOutput: this.messageToSend,
            time: this.getCurrentTime()
          };
  
          this.input = this.messageToSend;
          this.$chatHistoryList.append(template(context));
          this.scrollToBottom();
          this.$textarea.val('');
  
          // responses
          var templateResponse = Handlebars.compile($("#message-response-template").html());
          var contextResponse = {
            response: await this.chatTree.getMessage(this.input),
            time: this.getCurrentTime()
          };
  
          setTimeout(function() {
            this.$chatHistoryList.append(templateResponse(contextResponse));
            this.scrollToBottom();
          }.bind(this), 1000);
  
        }
      },
      addMessage: function() {
        this.messageToSend = this.$textarea.val();
        this.render();
      },
      addMessageEnter: function(event) {
        // enter was pressed
        if (event.keyCode === 13) {
          this.addMessage();
        }
      },
      scrollToBottom: function() {
        this.$chatHistory.scrollTop(this.$chatHistory[0].scrollHeight);
      },
      getCurrentTime: function() {
        return new Date().toLocaleTimeString().replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, "$1$3");
      }
    };
  
    chat.init();
  };
  
  class ChatTree {
    constructor() {
    }
  
    async init() {
      this.firstMsg = true;
      return "Chat has now been terminated. Send 'hi' to begin the chat again!";
    }
  
    async getMessage(input) {
      let resp = '';
  
      if (this.firstMsg) {
        this.firstMsg = false;
        resp += "Hey there buddy<br>";
      } else {
        if (input.trim() === "Reset") {
          return this.init();
        }
  
        if (isNaN(parseInt(input)) || parseInt(input) <= 0 || parseInt(input) > 4) {
          return 'It seems like you gave a wrong input! Go ahead, try again!';
        }
  
        if (parseInt(input) === 3) {
          const weather = await getWeather();
          resp += weather;
        }
      }
  
      if (parseInt(input) === 1) {
        const joke = await getJoke();
        resp += joke;
      } else if (parseInt(input) === 2) {
        const news = await getNews();
        resp += news;
      } else if(parseInt(input) === 3){
        const weather = await getWeather();
        resp += weather;
      }else{
        resp += "Please select an option:<br>";
        resp += "1. Get a joke<br>";
        resp += "2. Get the latest news<br>";
        resp += "3. Get the current weather<br>";
        resp += "4. Reset chat";
      }
  
      return resp;
    }
  }
  
  async function getWeather() {
    const API_KEY = "be84b33cb55ae12eeadc0670513a0f4d";
    const location = "AURAIYA"; // Replace with the desired location (e.g., city name or coordinates)
  
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${API_KEY}&units=metric`
      );
      const data = await response.json();
  
      if (response.ok) {
        const temperature = data.main.temp;
        const condition = data.weather[0].description;
        return `Current weather in ${location}:<br>Temperature: ${temperature}°C<br>Condition: ${condition}<br>`;
      } else {
        return "Unable to fetch the current weather. Please try again.";
      }
    } catch (error) {
      console.log(error);
      return "An error occurred while fetching the current weather. Please try again.";
    }
  }
  
  async function getJoke() {
    const response = await fetch('https://official-joke-api.appspot.com/jokes/random');
    const jsonResp = await response.json();
    return jsonResp.setup + ' ' + jsonResp.punchline;
  }
  
  async function getNews() {
    const response = await fetch('http://newsapi.org/v2/top-headlines?country=in&apiKey=20346985d7d74854a6586da4408b8a4a');
    const jsonResp = await response.json();
    const articles = jsonResp.articles;
    
    let news = "";
    articles.forEach((article, index) => {
      news += `Title: ${article.title}<br>Description: ${article.description}<br>Source: ${article.source.name}`;
      if (index !== articles.length - 1) {
        news += "<br>---------------<br>"; // Separator between articles
      }
    });
  
    return news;
  }
  