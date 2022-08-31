import Browse from '../components/Browse';
import Stream from '../components/Stream';
import DownloadPanel from '../components/Download/Index';
import Navigation from '../components/Navigation';
import Sidebar from '../components/Sidebar';
import jwt from 'jsonwebtoken';
import config from '../config';
import React from 'react';
import Axios from 'axios';
import Cookies from 'js-cookie'
import {Container, Row, Col} from 'react-bootstrap';

export async function getServerSideProps({ req, res }){
    const auth_header = req.headers['cookie']
    const token = auth_header && auth_header.split('token=')[1]
    if (token == null){
        return {
            redirect: {
                destination: '/login',
                permanent: false,
            },
        }
    }
    try{
        const user = await authenticate_user(token);
        return {
            props: {
                user: user.name
                
            }
        }
    }
    catch(e){
        console.log(e)
        return {
            redirect: {
                destination: '/login',
                permanent: false,
            },
        }
    }
}

export default class Movies extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            showSideBar: true,
            view: 'browse',
            currentShowName: '',
            chosenFile: false,
            showChooseFileSection: false,
            allFiles: [],
            apiLink: '',

        };
    }
    changeSideBarView(){
        this.setState({showSideBar: !this.state.showSideBar})
    }
    
    switchView(e){
        this.setState({
            view: e.target.id,
            showChooseFileSection: false
        })
    }

    startStream(e){
        if(e.target.id.split('file-').length < 2){ // is not film
            const season = e.target.id.split('season-')[1].split('-episode')[0];
            const episode = e.target.id.split('episode-')[1];
            this.setState({
                apiLink: `/stream/season/${this.state.currentShowName}/${season}/${episode}`,
                chosenFile: true
            })
        }
        else{
            this.setState({
                apiLink: `/stream/${this.state.currentShowName}/${e.target.id.split('file-')[1]}`,
                chosenFile: true
            })
        }
    }

    async streamMovie(e){
        console.log(e)
        const show_name = e.target.id.split('show-')[1];
        if(!show_name){
            alert("An error occured, contact Roan.");
        }
        const request = await Axios.post('/api/get_files', {
            token: Cookies.get('token'),
            show_name: show_name
        });
        const response = JSON.parse(JSON.stringify(request));
        if(response.data.allFiles.length === 1 && typeof response.data.allFiles[0] === 'string'){
            this.setState({
                showChooseFileSection: false,
                allFiles: []
            })
        }
        else{
            this.setState({
                showChooseFileSection: true,
                allFiles: response.data.allFiles,
            });
        }
        let apiLink = typeof response.data.allFiles[0] === 'object' ? `/stream/season/${show_name}/${Object.keys(response.data.allFiles[0])[0]}/${response.data.allFiles[0][Object.keys(response.data.allFiles[0])[0]][0]}` : `/stream/${show_name}/${response.data.allFiles[0]}`
        this.setState({
            apiLink: apiLink,
            chosenFile: true,
            currentShowName: show_name,
            view: 'stream'
        })
    }

    render(){
        let view;
        switch(this.state.view){
            case "browse":
                view=<Browse streamMovie={this.streamMovie.bind(this)}/>
                break;
            case "stream":
                view=<Stream 
                currentShowName={this.state.currentShowName}
                chosenFile={this.state.chosenFile}
                apiLink={this.state.apiLink}
                />
                break;
            case "download":
                view=<DownloadPanel
                streamMovie={this.streamMovie.bind(this)}
                />
                break;
            default:
                view=<Browse/>
        }
        return (
            <div id='implosive'>
                <Container fluid>
                    <Row>
                        <Col>    
                            <Navigation changeSideBarView={this.changeSideBarView.bind(this)}/>
                            <Sidebar 
                                view={this.state.showSideBar} 
                                switchView={this.switchView.bind(this)}
                                showChooseFileSection={this.state.showChooseFileSection}
                                allFiles={this.state.allFiles}
                                startStream={this.startStream.bind(this)}
                                isMovie={this.state.isMovie}
                            />
                            {view}
                        </Col>
                    </Row>
                </Container>
            </div>       
        )
    }
}

async function authenticate_user(token){
    return new Promise((resolve, reject) => {
        jwt.verify(token, config.web_token_secret, (err, user) => {
            if (err) {
                reject(err);
            }
            else{
                return resolve(user);
            }
        })
    });  
}