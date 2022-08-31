import React from 'react';
import Image from 'react-bootstrap/Image';
import Router from 'next/router';
import Cookies from 'js-cookie';
import {Fade} from 'react-bootstrap'
class Sidebar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {}
    for(let item in props.allFiles){
      if(typeof props.allFiles[item] === 'object'){
        this.state[Object.keys(props.allFiles[item])[0]] = false
      }
    } 
  }

  logout(e){
    e.preventDefault();
    Cookies.set('token', "");
    Router.push('/login');
  }

  expandSeason(e){
    const season_identity = e.target.id.split('season-')[1];
    this.setState({
      [season_identity]: !this.state[season_identity]
    })
  }


  render() {

    let btn_class = this.props.view ? "col-md-2 d-none d-md-block sidebar hide-toggle" : "col-md-2 d-none d-md-block sidebar"
    let allFiles = [];
    for(let file in this.props.allFiles){
      if(typeof this.props.allFiles[file] === 'string'){
        allFiles.push(
          <li className="nav-item">
            <a className="nav-link" id={`file-${this.props.allFiles[file]}`} onClick={this.props.startStream} href="#">{this.props.allFiles[file].split('.mp4')[0]}</a>
          </li>
        )
      }
      
      else if(typeof this.props.allFiles[file] === 'object'){
        let seasonDiv = [];
        let allEpisodes = [];

        const episodes = this.props.allFiles[file][Object.keys(this.props.allFiles[file])[0]]
        for (let episode in episodes){
          allEpisodes.push(
            

            <li className="nav-item">
            <a className="nav-link" id={`season-${Object.keys(this.props.allFiles[file])[0]}-episode-${episodes[episode]}`} onClick={this.props.startStream} href="#">{episodes[episode].split('.mp4')[0]}</a>
            </li>
          )
        }
        const isDisplaying = this.state[Object.keys(this.props.allFiles[file])[0]] ? 'block' : 'none';
        seasonDiv.push(
        <div className='season-div'>
        <h5 id={`season-${Object.keys(this.props.allFiles[file])[0]}`}className='season-title' onClick={this.expandSeason.bind(this)}
                  aria-controls="example-fade-text"
                  aria-expanded={this.state[Object.keys(this.props.allFiles[file])[0]]}>{Object.keys(this.props.allFiles[file])[0]}</h5>
                  <Fade style={{display: isDisplaying}} in={this.state[Object.keys(this.props.allFiles[file])[0]]}>
                  <div id="example-fade-text" className='all-episodes'>
                  {allEpisodes}
                  </div>
                </Fade>
        </div>
        )

        allFiles.push(seasonDiv)

      }
    }
    let choose_file_scene = this.props.showChooseFileSection ? (
      <div>
        <div id='seperator'></div>
           <div id='choose-file-section'>
           <h5 id='choose-epi'>Choose an episode:</h5>
           </div>
            {allFiles}

      </div>
    ) : null;
    return(
        <nav className={btn_class}>
        <div className="sidebar-sticky" >
          <ul className="nav flex-column">
          <div className='container text-center d-flex justify-content-center'>   
          <Image id='sidebar-logo' src='/implosive.png' />
          </div>
            <h6 className="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1 text-muted">
              <a className="d-flex align-items-center text-muted" href="#">
                <span data-feather="plus-circle" />
              </a>
            </h6>
            <li className="nav-item">
              <a className="nav-link active" onClick={this.props.switchView} id='browse' href="#">
                <span data-feather="home" />Browse <span className="sr-only">(current)</span>
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" onClick={this.props.switchView} id='download' href="#">Download</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" onClick={this.logout.bind(this)} href="#">Logout</a>
            </li>
           
            {choose_file_scene}
          </ul>
        </div>
      </nav>
   
    );
  }
}

export default Sidebar;