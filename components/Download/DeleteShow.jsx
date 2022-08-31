import React from 'react';
import Axios from 'axios';
import Cookies from 'js-cookie'

import {
    Spinner,
    Button,
    Table
} from 'react-bootstrap';

export default class DeleteShow extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            isLoading: true,
            shows: []

        }

        this.getShows();
    }


  async getShows(){
    try{
        let all_shows = []
        const request = await Axios.post('/api/get_shows', {
            token: Cookies.get('token')
        });
        const response = JSON.parse(JSON.stringify(request));
        for(let show in response.data.all_shows){
            all_shows.push(response.data.all_shows[show].name)
        }
        this.setState({
            shows: all_shows,
            isLoading: false
        });
    }
    catch(e){
        console.log(e);
    }
  }

  async deleteShow(e){
      try{
        await Axios.post('/api/delete_show', {
            token: Cookies.get('token'),
            show_name: e.target.id.split('show-')[1]
        });
      }
      catch(e){
          alert("An error occured, please contact Roan")
          console.log(e);
      }

      this.getShows();
  }

    render(){
        let allShows = []
        this.state.shows.map((show) => {
           
            allShows.push(
                (
                    <tr>
                    <td>{show}</td>
                    <td>
                        <Button variant="danger" onClick={this.deleteShow.bind(this)} id={`show-${show}`} type="submit">
                            Delete
                        </Button>
                    </td>
                    </tr>
                )
            )  
        })
        const activeShowsScene = this.state.shows.length === 0 ? (<Spinner animation="border" role="status">
        <span className="sr-only">Loading...</span>
      </Spinner>) : allShows;
        return (
            <Table striped bordered hover>
                <thead>
                    <tr>
                    <th>Show Name</th>
                    <th></th>
                    </tr>
                </thead>
                <tbody>
                    {activeShowsScene}
                </tbody>
             </Table>
            
        )
    }
}