import React from 'react';
import {Form, Button} from 'react-bootstrap';
import Axios from 'axios';
import Cookies from 'js-cookie'
export default class DirectTorrent extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            magnet_uri: '',
            show_name: ''
        }
    }


    update(event) {
        switch(event.target.id){
            case "show-name":
                this.setState({
                    show_name: event.target.value
                })
                break;
            case "magnet-uri":
                this.setState({
                    magnet_uri: event.target.value
                })
                break;
            default:
                break;
        }
    }

    async downloadMovie(e){
        e.preventDefault();
        try{
            await Axios.post('/request_torrent/new_torrent', {
                movie_name: this.state.show_name,
                magnet_uri: this.state.magnet_uri,
                movie_hash: 'no value', /* i made this when i was tired and dont give a fuck. */
                movie_title: 'no value',
                token: Cookies.get('token')
            });
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
                    default:
                        message = "Unknown error, contact Roan."
                }
                
                alert(message);
            }
        }
    }


    render(){
        return (
            <Form>
            <div id='form-area' className='download'>
                <div className='container text-center d-flex justify-content-center'> 
                    <h4 className='form-field-label'>MAGNET URI</h4>
                </div>

                <div className='container text-center d-flex justify-content-center'> 
                    <Form.Group controlId="magnet-uri">
                        <div className='container text-center d-flex justify-content-center'> 
                            <Form.Control className='form-input' value={this.state.magnet_uri} onChange={this.update.bind(this)} type="text"  />
                        </div>
                    </Form.Group>
                </div>

                <div className='container text-center d-flex justify-content-center'> 
                    <h4 className='form-field-label'>SHOW NAME</h4>
                </div>

                <div className='container text-center d-flex justify-content-center'> 
                    <Form.Group controlId="show-name">
                        <div className='container text-center d-flex justify-content-center'> 
                            <Form.Control className='form-input' value={this.state.show_name} onChange={this.update.bind(this)} type="text"  />
                        </div>
                    </Form.Group>
                </div>
                
        

                <div className='container text-center d-flex justify-content-center'> 
                    <Button variant="primary"  id='form-button' variant="primary"  onClick={this.downloadMovie.bind(this)} type="submit" size="lg"><div>DOWNLOAD</div>
                    </Button>
                </div>
            </div>
        </Form>

        )
    }
}