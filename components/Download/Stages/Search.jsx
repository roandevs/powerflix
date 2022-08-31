import {Form, Button, Table} from 'react-bootstrap';

export default function Search(props){
    let suggestions = []
    for(let show in props.possibleExistingShows){
        suggestions.push(

            <tr>
            <td>{props.possibleExistingShows[show].name}</td>
            <td>
                <Button variant="danger" onClick={props.streamMovie} id={`show-${props.possibleExistingShows[show].name}`} type="submit">
                    Watch Now
                </Button>
            </td>
            </tr>
        )
    }
    let showHintScene = suggestions.length !== 0 ? (
       <div id='suggestions-list'>
           <div className='container text-center d-flex justify-content-center'> 
           <p className='form-field-label'>Are you sure this show isn't already downloaded:</p>
           </div>
        <Table striped bordered hover>
                <thead>
                    <tr>
                    <th>Show Name</th>
                    <th></th>
                    </tr>
                </thead>
                <tbody>
                    {suggestions}
                </tbody>
             </Table>
       </div>
    ) : null
    return (
        <Form>
            <div id='form-area' className='download'>
                <div className='container text-center d-flex justify-content-center'> 
                    <h4 className='form-field-label'>SHOW NAME</h4>
                </div>

                <div className='container text-center d-flex justify-content-center'> 
                    <Form.Group controlId="show-name">
                        <div className='container text-center d-flex justify-content-center'> 
                            <Form.Control className='form-input' value={props.show_name} onChange={props.update} type="text"  />
                        </div>
                    </Form.Group>
                </div>

                {showHintScene}
                
        

                <div className='container text-center d-flex justify-content-center'> 
                    <Button variant="primary"  id='form-button' variant="primary"  onClick={props.search} type="submit" size="lg"><div>SEARCH</div>
                    </Button>
                </div>
            </div>
        </Form>

    )
}