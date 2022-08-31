import React from 'react';
import Image from 'next/image';
import Cookies from 'js-cookie';
import Router from 'next/router';
import Axios from 'axios';
import {
    Form,
    Card,
    Button,
    Row,
    Col,
    Container,
    Navbar,
    Alert,
    Spinner,
} from 'react-bootstrap';

export default class Login extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            login_name: '',
            login_password: '',
            processing: false,
            error_show: false,
            error_message: '',
        }
    }

    handleErrorPopUp(error_message){
        this.setState({error_message: error_message})
        return this.setState({
            error_show: true
        })
    }
    async login(e){
        e.preventDefault();
        if(!this.state.login_name){
            return this.handleErrorPopUp("Please enter a name");
        }
        if(!this.state.login_password){
            return this.handleErrorPopUp("Please enter the movie sites password");
        }

        this.setState({
            processing: true
        })
        
        try{
            const request = await Axios.post('/api/login', {
                name: this.state.login_name,
                password: this.state.login_password
            });
            const response = JSON.parse(JSON.stringify(request));
            this.setState({
                processing: false
            });
            this.setState({error_show:false})
            Cookies.set('token', response.data.token);
            Router.push('/');
        }
        catch(err){
            console.log(err)
            if(!err.response.data.message || err.response.data.message == ""){
                err.response.data.message = "There was an error, please contact an admin for more."
            }
            this.setState({
                processing: false
            });
            return this.handleErrorPopUp(err.response.data.message);
        } 
    }

    update(event) {
        if(event.target.id == "login-name"){
            this.setState({login_name: event.target.value});
        }
        else if(event.target.id == "login-password"){
            this.setState({login_password: event.target.value});
        }
    }
    
    render(){
        const error_status = this.state.error_show ? 
        <div id='error-alert'>
            
            <Alert variant='login-error' id='error-box'>
            <div id='error-icon'></div> 
            <div className='container text-center d-flex justify-content-center'>
            <div id='error-message'>{this.state.error_message}</div>
            </div>
   
            </Alert>

        </div>   : null;
        const status = this.state.processing ? <Alert variant='login-error' className='text-center'> <Spinner animation="border" size="sm" /></Alert> : error_status;
        return (
            <div id='main'>
                <Container fluid>
                    <Row>
                        <Col>
                            <Navbar className='implosive-topnav' fixed="top" bg="dark" variant="dark">
                                <div className='container text-center d-flex justify-content-center'> 
                                    <Image
                                        src="/implosive.png"
                                        height={20}
                                        width={100}
                                    />
                                </div>
                            </Navbar>  
                            <div className='container text-center d-flex justify-content-center login'> 

                                <Container className='mt-5 mb-5'>
                                <Row className='justify-content-md-center'>
                                    <Col>
                                    {status}
                                    <div className='container text-center d-flex justify-content-center'> 
                                        <Card bg='transparent' id='login-form-card' className='mb-2 form-card'>
                                            <Card.Body>
                                                <Form>
                                                    <div id='form-area'>
                                                        <div className='container text-center d-flex justify-content-center'> 
                                                            <h4 className='form-field-label'>YOUR NAME</h4>
                                                        </div>

                                                        <div className='container text-center d-flex justify-content-center'> 
                                                            <Form.Group controlId="login-name">
                                                                <div className='container text-center d-flex justify-content-center'> 
                                                                    <Form.Control className='form-input' value={this.state.login_name} onChange={this.update.bind(this)} type="username"  />
                                                                </div>
                                                            </Form.Group>
                                                        </div>
                                                        
                                                        <div className='container text-center d-flex justify-content-center'> 
                                                            <h4 className='form-field-label'>PASSWORD</h4>
                                                        </div>
                                                        
                                                        
                                                        <div className='container text-center d-flex justify-content-center'> 
                                                            <Form.Group controlId="login-password">
                                                                <div className='container text-center d-flex justify-content-center'> 
                                                                    <Form.Control className='form-input' value={this.state.login_password} onChange={this.update.bind(this)} type="password" />
                                                                </div>
                                                            </Form.Group>
                                                        </div>

                                                        <div className='container text-center d-flex justify-content-center'> 
                                                            <Button variant="primary"  id='form-button' variant="primary"  onClick={this.login.bind(this)} type="submit" size="lg"><div>LOGIN</div>
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </Form>
                                            </Card.Body>
                                        </Card>
                                    </div>
                                    </Col>
                                </Row>
                                </Container>
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
                </Container>
            </div>
        )
    }
}