import React from 'react';
import {Spinner, Table, Button} from 'react-bootstrap';
import Cookies from 'js-cookie';
const debug_mode = true;

export default class Pending extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            activeDownloads: []
        }

        this.WsConnect();
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
        setTimeout(this.sendPing.bind(this), 2000);;
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
                    this.setState({
                        activeDownloads: data.active_downloads
                    })

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

    WsConnect(){
        this.ws = new WebSocket('wss://movies.rsakeys.org/torrent_status');
        this.ws.onopen = this.WsOpen.bind(this);
        this.ws.onmessage = this.WsMessage.bind(this);
        this.ws.onclose = this.WsClose.bind(this);
    }

    cancelDownload(e){
        const download_id = e.target.id.split('download-')[1];
        let movie_hash;
        for(let show in this.state.activeDownloads){
            if(this.state.activeDownloads[show].id === download_id){
                movie_hash = this.state.activeDownloads[show].movie_hash
            }
        }
        this.ws.send(JSON.stringify({
            request_type: 'delete',
            download_id: download_id,
            movie_hash: movie_hash,
            token: Cookies.get('token'),
        }))
    }

    render(){
        let all_downloads = []
        this.state.activeDownloads.map((downloads) => {
           
            all_downloads.push(
                (
                    <tr>
                    <td>{downloads.movie_name}</td>
                    <td>{downloads.status}</td>
                    <td>
                        <Button variant="danger" onClick={this.cancelDownload.bind(this)} id={`download-${downloads.id}`} type="submit">
                            Cancel
                        </Button>
                    </td>
                    </tr>
                )
            )  
        })
        const activeDownloadScene = this.state.activeDownloads.length === 0 ? (<Spinner animation="border" role="status">
        <span className="sr-only">Loading...</span>
      </Spinner>) : all_downloads;
        return (
            <Table striped bordered hover>
                <thead>
                    <tr>
                    <th>Show Name</th>
                    <th>Status</th>
                    <th></th>
                    </tr>
                </thead>
                <tbody>
                    {activeDownloadScene}
                </tbody>
             </Table>
            
        )
    }
}
