import React from 'react';
import DownloadShow from './DownloadShow';
import DeleteShow from './DeleteShow';
import Pending from './Pending';
import DirectTorrent from './DirectTorrent';
import {
    Row,
    Col,
    Tab,
    Tabs,
    Container,
    Card,
} from 'react-bootstrap';

export default class DownloadPanel extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            activeTab: 'search-new'
        }
    }
    switchTab(tab){
        this.setState({
            activeTab: tab
        })
    }

    render() {
        return (
        <main role="main">
            <Row>
                <Col>
                <div className='container text-center d-flex justify-content-center'> 
                    <Container className='mt-5 mb-5'>
                    <Row className='justify-content-md-center'>
                        <Col lg={7}>
                        <Card bg='light' id='download-card' className='mb-2'>
                            <Card.Header>Download Show</Card.Header>
                            <Card.Body>
                            <Tabs activeKey={this.state.activeTab} onSelect={this.switchTab.bind(this)} id="uncontrolled-tab-example">
                                <Tab eventKey='search-new' title='Search Show'>
                                <br />
                                <DownloadShow 
                                streamMovie={this.props.streamMovie}
                                switchTab={this.switchTab.bind(this)}
                                />
                                </Tab>
                                <Tab eventKey='pending' title='Pending Downloads'>
                                <br />
                                <Pending/>
                                </Tab>
                                <Tab eventKey='torrent-new' title='Enter Magnet URI'>
                                <br />
                                <DirectTorrent switchTab={this.switchTab.bind(this)}/>
                                </Tab>
                                <Tab eventKey='delete' title='Delete Show'>
                                <br />
                                <DeleteShow />
                                </Tab>
                            </Tabs>
                            </Card.Body>
                        </Card>
                        </Col>
                    </Row>
                    </Container>
                    </div>

           </Col>
       </Row>
        </main>
 
    );
  }
}




