import React, { useState, useEffect, useRef } from "react";
//import TextareaAutosize from 'react-textarea-autosize';
import useApi from './../Services/OpenAPIService.js';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { RotateLoader } from 'react-spinners';
import { RotatingLines } from  'react-loader-spinner'


function Main() {
  const [message, setMessage] = useState('');
  const { response, getResponse } = useApi();
  const [loading, setLoading] = useState('');
  const myref=useRef(null);

  const [chat, setChat] = useState([]);
  const [options, setOption] = useState(1);
  const [listOptions] = useState([
    { id: 1, desc: "Richard son" },
    { id: 2, desc: "Robby son" },
    { id: 3, desc: "Ellen son" }
  ]);

  const [names, setNames] = useState([])

  function handleSelect(e) {
    const selected = e.target.value;
    setOption(selected);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const newMessage = { text: message, sender: 'user' };
    setChat(prevChat => [...prevChat, newMessage]);
    getResponse(message);
    setMessage('');
    setLoading(true);
  };


  useEffect(() => {
    console.log("message---------")
    console.log(message)
    console.log(response)
    if (response) {
      const newResponse = { text: response, sender: 'bot' };
      setChat(prevChat => [...prevChat, newResponse]);
      setLoading(false);
    }
  }, [response]);

  useEffect(() => {
    myref.current.scrollTop = myref.current.scrollHeight;
  }, [loading])

  useEffect(() => {
    const apiURL = process.env.REACT_APP_API_URL + "/names";
    fetch(apiURL) // Replace with your backend route
      .then((res) => res.json())
      .then((data) => {
        setNames(data)
        console.log(data)
      })
      .catch((error) => console.log(error));
  }, []);


  return (
    <div className="msger">
       <header className ="msger-header">
          <div className ="msger-header-title"> 
            <img className ='logo' src='../logo.png' alt="" ></img>
            <div className ='title'>
              AI Nursery Assistant V 1.00
            </div>
          </div>
          <div className ='select'>
            <select value={options} onChange={e => handleSelect(e)}>
              {names.map((nm, index)=> (
                <option key={index} value={nm}>
                  {nm}
                </option>
              ))}
            </select>
          </div>
      </header>
      <hr></hr>
      <main className="msger-chat" ref={myref}>
        <div className="msg left-msg">
            <div  className="msg-img"><img src='../avatar.png' alt=''/></div>
            <div className="msg-bubble">
              <div className="msg-text">
                Hi, im Babii AI, how can i help?
              </div>
            </div>
        </div> 
        {chat.map((message, i) => (
            <div key={i} className='messagediv'>
            {
                message.sender === 'user' ? 
                (
                  <div className="msg right-msg">
                    <div className="msg-img" > User</div>
                    <div className="msg-bubble">
                      <div className="msg-text"> 
                        <div className="msg-text">
                          {message.text}
                        </div>
                      </div>
                    </div>
                  </div> 
                ):
                ( 
                  <div className="msg left-msg">
                    <div className="msg-img">
                        <img src='../avatar.png' alt=''/>
                    </div>
                    <div className="msg-bubble">
                      <div className="msg-text">
                        <pre> {message.text} </pre>
                      </div>
                    </div>
                  </div>
                )
            }
            </div>
          ))
        }             
        
        {loading ? 
          (
            <div className="msg left-msg">
              <div className="msg-img">
                  <img src='../avatar.png' alt=''/>
              </div>
              <div className="msg-bubble">
                <div className="loader-container">
                  <div className="loader-content">
                    <RotatingLines
                      strokeColor="grey"
                      strokeWidth="5"
                      animationDuration="0.75"
                      width="24"
                      visible={true}
                    />
                    <p className="loader-text">Thinking...</p>
                  </div>
                </div>
              </div>
            </div> 
          ):(
            <div></div>
          )}
      </main>
      <div style={{padding:'20px'}}>
        <div className="msg right-msg" style={{margin:'20px'}}>
          <div className="msg-bubble" style={{margin:'10px', borderRadius:'25px', padding:'10px'}}>
            <div className="msg-text"> 
              <div className="msg-text" style={{color:'black'}}>
                How do I get started?
              </div>
            </div>
          </div>
          <div className="msg-bubble" style={{margin:'10px', borderRadius:'25px', padding:'10px'}}>
            <div className="msg-text"> 
              <div className="msg-text" style={{color:'black'}}>
                What is Babii?
              </div>
            </div>
          </div>
        </div> 
        <form onSubmit={handleSubmit} className="msger-inputarea">
            <input className='msger-send_text' type="text" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Ask me anything about your child..."/>
            <button type="submit" className="msger-send-btn">
              <span> <i className="fas fa-paper-plane blue"></i></span>
            </button>
        </form>
      </div>
    </div>
  );
}
export default Main;
