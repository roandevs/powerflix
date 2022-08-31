import React from 'react';
import ReactDOM from 'react-dom';
import {
  Row,
  Col,
  Container,
  Image,
  ListGroup,
  Navbar,
  Button
} from 'react-bootstrap';

import {
  Player, 
  BigPlayButton,
  ControlBar,
  ForwardControl,
  ReplayControl
} from 'video-react';
import Sidebar from './Sidebar.jsx';


class DesktopStream extends React.Component {
  constructor(props) {
    super(props);


    this.state = {
        show_nav: true
    };
   
  }



  changeView(){
    this.setState({show_nav: !this.state.show_nav})
  }



  render() {
    return (
    <Container fluid>

      <Row>
        <Col>
          <Navbar className='implosive-topnav' fixed="top" bg="dark" variant="dark">
            <button onClick={this.changeView.bind(this)} className="navbar-toggler" id='nav-toggler' type="button" data-toggle="collapse" data-target="#navbarHeader" aria-controls="navbarHeader" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className='container text-center d-flex justify-content-center'> 
              <Image height='20' id='logo' src='/implosive.webp' />
            </div>
          </Navbar>  
          <Sidebar view={this.state.show_nav}/>
          <main role="main">
            <div className='container text-center d-flex justify-content-center streaming-div'> 
              <Player playsInline src="https://movies.roan.dev/api/stream/500 Days Of Summer" videoId='implosive-player'  fluid>
              <BigPlayButton position="center" />
              <ControlBar autoHideTime={90000000} fluid>  
             <div id='next-epi-div' order={7}>
             <Button className='next-epi' id='next-epi' type="button"></Button>
             <div id='episodes-content'>
             <ListGroup id='list-of-shows'>
            <ListGroup.Item>Episode 1</ListGroup.Item>
            <ListGroup.Item>Episode 2</ListGroup.Item>
            <ListGroup.Item>Episode 3</ListGroup.Item>
            <ListGroup.Item>Episode 4</ListGroup.Item>
            <ListGroup.Item>Episode 5</ListGroup.Item>
          </ListGroup>
             </div>
             </div>

                <ForwardControl seconds={10} order={3.1} />
                <ReplayControl seconds={10} order={2.1} />
                
              </ControlBar>
              </Player>
            </div>
          </main>
        </Col>
      </Row>
    </Container>
    );
  }
}




export default DesktopStream;