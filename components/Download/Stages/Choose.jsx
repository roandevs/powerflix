import {Form, Button,Table, Row, Col} from 'react-bootstrap';

export default function Choose(props){
    let movies = []
    for (let result in props.shows) {
        movies.push(
            <tr key={props.shows[result].id}>
            <td className='download-results'>{props.shows[result].name}</td>
            <td>{props.shows[result].seeders}</td>
            <td> <Button id={`${props.shows[result].name}-${props.seperator}-${props.shows[result].info_hash}`} onClick={props.choose_movie} variant="primary" type="submit">
                    Download
                </Button></td>

            </tr>
        );
    }
    return (
        <Row>
            <Col>
            <div className="container text-center d-flex justify-content-center"> 
            <Button id='choose-back-btn' onClick={props.go_back} variant="primary" className='back-btn' type="submit">
                Go back
            </Button>
            </div>
            <Form.Text className="text-muted" id='search-disclaimer'>
                NOTE: <b>"Seeders"</b> describe how fast a show will download.
            </Form.Text>
        <div className="container text-center d-flex justify-content-center"> 
        <Table striped hover responsive>
        <thead>
            <tr>
            <th scope="col">Name</th>
            <th scope="col">Seeders</th>
            <th scope="col">Download</th>
            </tr>
        </thead>
        <tbody>
            {movies}
        </tbody>
        </Table>
        </div>
        </Col>
        </Row>
        
    
    )
}