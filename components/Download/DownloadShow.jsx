import React from 'react';
import Search from './Stages/Search';
import Choose from './Stages/Choose';
import Cookies from 'js-cookie';
import Axios from 'axios';
import {
    Spinner,
    Alert,
    Row,
    Col,
    Modal,
    Form,
    Button
} from 'react-bootstrap';
const debug_mode = true;

export default class DownloadShow extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            stage: "search",
            show_name: "",
            error_show: false,
            error_message: "",
            processing: false,
            shows: [],
            seperator: Math.random().toString(26).slice(2),
            showingDownloadMoviePrompt: false,
            movie_name: "",
            movie_hash: "",
            movie_title: "",
            successDownloadMessage: false,
            thumbnail: null,
            showHint: false,
            possibleExistingShows: null
        }
    }
    choose_movie(e){
        e.preventDefault();
        this.setState({
            movie_title: e.target.id.split(`-${this.state.seperator}-`)[0],
            movie_hash: e.target.id.split(`-${this.state.seperator}-`)[1]
        })
        this.showDownloadMoviePrompt();
    }

    go_back(e){
        switch(e.target.id){
            case "choose-back-btn":
                this.setState({
                    stage: "search"
                })
        }
    }

    async update(event) {
        switch(event.target.id){
            case "show-name":
                this.setState({
                    show_name: event.target.value
                })
                try{
                    const request = await Axios.post('/api/search', {
                        token: Cookies.get('token'),
                        query: event.target.value
                    });
                    const response = JSON.parse(JSON.stringify(request));
                    this.setState({
                        showHint: true,
                        possibleExistingShows: response.data.possibleShows 
                    })
                }
                catch(e){
                    console.log(e);
                }
                break;
            case "movie-name":
                this.setState({
                    movie_name: event.target.value
                })
                break;
            default:
                break;
        }
    }

    showDownloadMoviePrompt(){
        this.setState({
            showingDownloadMoviePrompt: true
        })
    }

    hideDownloadMoviePrompt(){
        this.setState({
            showingDownloadMoviePrompt: false,
            successDownloadMessage: false
        })
    }

    WsClose(){
        alert("Lost connection with the logs server.. please refresh the page.")
        if(debug_mode){
            console.log("Told client we are closing the connection");
        }
    }

    sendPing(){
        this.ws.send(JSON.stringify({
            request_type: "ping"
        }))
        setTimeout(this.sendPing.bind(this), 2000);
    }

    WsMessage(event){
        const data = JSON.parse(event.data);
        switch(data.response_type){
            case "login_auth":
                if(!data.successful){
                    alert("Authentication with the websocket server failed, please contact Roan for more.");
                }
                this.sendPing();
                
                break;
            case "new_log":
                //
                break;
            case "pong":
                if(!data.successful){
                    this.WsClose();
                }
                else{
                    if(debug_mode){
                        console.log("Received pong back from server")
                    }
                }
                break;
            default:
                alert("Unknown response type given, please contact Roan for more.")
        }
        if(debug_mode){
            console.log(`Told client we got a message: ${event.data}`);
        }
    }

    WsOpen(){
        this.ws.send(JSON.stringify({
            request_type: 'login_auth',
            token: Cookies.get('token'),
        }))
        if(debug_mode){
            console.log("Telling client that we opened a websocket connection successfully")
        }
    }
    

    async downloadMovie(e){
        e.preventDefault();
        const url = '/request_torrent/new_torrent';
        const formData = new FormData();
        formData.append('file',this.state.thumbnail);
        formData.append('movie_name', this.state.movie_name);
        formData.append('movie_hash', this.state.movie_hash);
        formData.append('movie_title', this.state.movie_title);
        formData.append('token', Cookies.get('token'))
        const config = {
            headers: {
                'content-type': 'multipart/form-data'
            }
        }
        try{
            await Axios.post(url, formData,config);
            this.hideDownloadMoviePrompt();
            this.props.switchTab('pending');
        }
        catch(err){
            console.log(err);
            let message;
            if(err.response){
                switch(Number(err.response.status)){
                    case 403:
                       message = "You are not logged in/authorized to make this request.";
                       break;
                    case 400:
                        message = "Incorrect type of request, please make sure you fill out all the fields.";
                        break;
                    case 409:
                        message = "This show name is already taken, please check if the show already exists or try renaming it or specifying a specific season or title name.";
                        break;
                    default:
                        message = "Unknown error, contact Roan."
                }
                
                alert(message);
            }
        }
    }

    async search(e){
        e.preventDefault();
        if(this.state.show_name === ""){
            return this.setState({
                error_show:true,
                error_message: "You need to enter a show name."
            })
        }
        this.setState({
            processing: true
        })
        try{
            const request = await Axios.post('/api/download', {
                request_type: "search",
                show_name: this.state.show_name,
                token: Cookies.get('token')
            });
            const response = JSON.parse(JSON.stringify(request));
            this.setState({
                processing: false,
                error_show:false,
                shows: response.data.results,
                stage: "choose"
            });
        }
        catch(err){
            console.log(err.response.data.message)
            if(err.response){
                this.setState({
                    processing: false,
                    error_show:true,
                    error_message: err.response.data.message
                })
            }
        } 
    }

    handleUpdateThumbnail(e){
        this.setState({
            thumbnail: e.target.files[0]
         })
     }

    render(){
        
        const error_status = this.state.error_show ? 
        <div id='error-alert' className='download-error'>
            
            <Alert variant='login-error' className='card-error' id='error-box'>
            <div id='error-icon'></div> 
            <div className='container text-center d-flex justify-content-center'>
            <div id='error-message'>{this.state.error_message}</div>
            </div>
   
            </Alert>

        </div>   : null;
        const status = this.state.processing ? <Alert variant='login-error' className='text-center card-error'> <Spinner animation="border" size="sm" /></Alert> : error_status;
        let stage;
        switch(this.state.stage){
            case "search":
                stage=(
                    <Search 
                        showHint={this.state.showHint}
                        possibleExistingShows={this.state.possibleExistingShows}
                        update={this.update.bind(this)} 
                        search={this.search.bind(this)} 
                        show_name={this.state.show_name}
                        streamMovie={this.props.streamMovie}
                    />
                )
                break;
            case "choose":
                stage=(
                    <Choose
                        shows={this.state.shows}
                        choose_movie={this.choose_movie.bind(this)}
                        go_back={this.go_back.bind(this)}
                        seperator={this.state.seperator}
                    />
                )
                break;
            default:
                stage=(
                    <Search 
                        update={this.update.bind(this)} 
                        search={this.search.bind(this)} 
                        show_name={this.state.show_name}
                    />
                )
                break;
        }

        return (

            <div className='container text-center d-flex justify-content-center'> 
            <Row>
                <Col>
                <>
                <Modal show={this.state.showingDownloadMoviePrompt} onHide={this.hideDownloadMoviePrompt.bind(this)}>
                    <Modal.Header>
                    <Modal.Title>Set movie details:</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {status}
                        <Form onSubmit={this.downloadMovie.bind(this)} encType="multipart/form-data" method="POST">
                        <Form.Group controlId="movie-name">
                            <Form.Label>Show Name</Form.Label>
                            <Form.Control  type='text' value={this.state.movie_name} onChange={this.update.bind(this)} />
                        </Form.Group>
                        <Form.Group controlId="upload-thumbnail">
                            <Form.File 
                                onChange={this.handleUpdateThumbnail.bind(this)}
                                className='item-file-attachment'
                                id="thumbnail-file"
                                name="thumbnail_file"
                                label="Thumbnail Image"
                                custom
                            />
                        </Form.Group>

                        <Button variant="primary" type="submit">
                            Download
                        </Button>
                    </Form>
                        
                    </Modal.Body>
                    <Modal.Footer>
                        <p>Toolbox written by Roan</p>
                    
                    </Modal.Footer>
                </Modal>
                </>
                {status}
                {stage}
                </Col>

            </Row>
           
            </div>
        )
    }
}