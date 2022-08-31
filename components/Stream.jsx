import React from 'react';

import {
    Row,
    Col,
    Carousel,
    Image,
    Form,
    FormControl,
    Card,
    Spinner
} from 'react-bootstrap';

import Axios from 'axios';
import Cookies from 'js-cookie';

export default class Stream extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
    }
  }
  

  


  render() {
      let streamScene = this.props.chosenFile ? (
        <video className='video-stream' id={`${this.props.currentShowName}`} width="960" height="480" controls src={this.props.apiLink}></video>
      ) : <div id='choose-file'>
          <h4>Please choose a file to stream from the sidebar.</h4>
      </div>
    
    return (
        <main role="main">
        <Row>
          <Col>
          <div className='container text-center d-flex justify-content-center'>  
           {streamScene}
          </div>
        </Col>

      </Row>
  
       <Row>
           <Col>
           <div className='container text-center d-flex justify-content-center'> 
           <h6 id='credits'>Made with ❤️&nbsp; by Roan.</h6>
           </div>
           </Col>
       </Row>
        </main>
 
    );
  }
}







