import React from 'react';

import {
    Row,
    Col,
    Carousel,
    Image,
    Form,
    FormControl,
    Card,
    Spinner,
    OverlayTrigger,
    Popover,
    Modal,
    Button
} from 'react-bootstrap';

import Axios from 'axios';
import Cookies from 'js-cookie';

export default class Browse extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
        shows: [],
        isLoading: true,
        isSearching: false,
        searchView: false,
        showAd: true

    }
    this.getShows();
  }

  async getShows(){
    try{
        const request = await Axios.post('/api/get_shows', {
            token: Cookies.get('token')
        });
        const response = JSON.parse(JSON.stringify(request));
        this.setState({
            shows: response.data.all_shows,
            isLoading: false
        });
    }
    catch(e){
        console.log(e);
    }
  }
  get_paginated_result(shows, counter){
      let paginated_results = {}
      let current_count = 0;
      let pagination_limit = current_count + counter;
      let page = 1;
      for(let show in shows){
          if(current_count === 0){
              paginated_results[page] = [];
              paginated_results[page].push(shows[show]);
          }

          else if(current_count === pagination_limit){
              page+=1
              pagination_limit = current_count + counter;
              paginated_results[page] = [];
              paginated_results[page].push(shows[show]);
          }

          else{
              paginated_results[page].push(shows[show]);
          }

          current_count+=1;
      }
      return paginated_results;
  }

    async searchMovie(e){
        e.preventDefault();
        this.setState({
            isLoading: true
        });
        if(e.target.value === ''){
            this.setState({
                isLoading: false,
                searchView: false
            })
            return this.getShows();
        }
        try{
            const request = await Axios.post('/api/search', {
                token: Cookies.get('token'),
                query: e.target.value

            });
            const response = JSON.parse(JSON.stringify(request));
            this.setState({
                shows: response.data.possibleShows,
                isLoading: false,
                searchView: true
            });
        }
        catch(e){
            console.log(e);
        }
    }  

    handleCloseAd(){
        this.setState({
            showAd: false
        })
    }


  render() {
    let all_shows = [];
    let all_mobile_view_shows = [];
    let all_shows_searched = [];
    const paginated_shows = this.get_paginated_result(this.state.shows, 5);
    const mobile_paginated_shows = this.get_paginated_result(this.state.shows, 2);
    for(let show in mobile_paginated_shows){
        let all_cards = [];
        for(let card in mobile_paginated_shows[show]){
            let thumbnail = mobile_paginated_shows[show][card].has_thumbnail ? `/api/get_thumbnail/${mobile_paginated_shows[show][card].name}` : `/default_thumbnail.jpeg`
            let episode_info = [];
            if(mobile_paginated_shows[show][card].season_count > 0){
                if(mobile_paginated_shows[show][card].season_count === 1){
                    episode_info.push(
                        <li>{mobile_paginated_shows[show][card].season_count} season included</li>
                    )
                }
                else{
                    episode_info.push(
                        <li>{mobile_paginated_shows[show][card].season_count} seasons included</li>
                    )
                }
                
            }
            if(mobile_paginated_shows[show][card].special_episode_count > 0){
                if(mobile_paginated_shows[show][card].special_episode_count === 1){
                    episode_info.push(
                        <li>{mobile_paginated_shows[show][card].special_episode_count} special episode included</li>
                    )
                }
                else{
                    episode_info.push(
                        <li>{mobile_paginated_shows[show][card].special_episode_count} special episodes included</li>
                    )
                }
            }
            if(mobile_paginated_shows[show][card].episode_count === 1){
                episode_info = [];
            }
            else{
                if(mobile_paginated_shows[show][card].episode_count === 1){
                    episode_info.push(
                        <li>{mobile_paginated_shows[show][card].episode_count} episode included</li>
                    )
                }
                else{
                    episode_info.push(
                        <li>{mobile_paginated_shows[show][card].episode_count} episodes included</li>
                    )
                }
            }
            all_cards.push(
                <Col>
                <Card className='show-card' id={`show-${mobile_paginated_shows[show][card].name}`} onClick={this.props.streamMovie}>
                <Card.Img variant="top" className="show-image" id={`show-${mobile_paginated_shows[show][card].name}`} src={thumbnail} responsive="true"/>
                <div className="overlay" id={`show-${mobile_paginated_shows[show][card].name}`}> 
                <div className='show-description'>
                    <Row>
                            <Col>
                            <h5 className='mobile-epi-info' id={`show-${mobile_paginated_shows[show][card].name}`}>{mobile_paginated_shows[show][card].name}</h5>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                            <h6 className='mobile-epi-info' id={`show-${mobile_paginated_shows[show][card].name}`}><ul id='epi-info'>{episode_info}</ul></h6>
                            </Col>
                        </Row>
                    </div>
                </div>
                </Card>
                </Col>

            )
        }

        all_mobile_view_shows.push(
            <Row id='mobile-shows-layout'>
                {all_cards}
            </Row>
        )


        all_shows_searched.push(
            <Row id='search-layout'>
                {all_cards}
            </Row>

        )
    }
    for(let show in paginated_shows){
        let all_cards = [];
        for(let card in paginated_shows[show]){
            let thumbnail = paginated_shows[show][card].has_thumbnail ? `/api/get_thumbnail/${paginated_shows[show][card].name}` : `/default_thumbnail.jpeg`
            let episode_info = [];
            if(paginated_shows[show][card].season_count > 0){
                if(paginated_shows[show][card].season_count === 1){
                    episode_info.push(
                        <li>{paginated_shows[show][card].season_count} season included</li>
                    )
                }
                else{
                    episode_info.push(
                        <li>{paginated_shows[show][card].season_count} seasons included</li>
                    )
                }
                
            }
            if(paginated_shows[show][card].special_episode_count > 0){
                if(paginated_shows[show][card].special_episode_count === 1){
                    episode_info.push(
                        <li>{paginated_shows[show][card].special_episode_count} special episode included</li>
                    )
                }
                else{
                    episode_info.push(
                        <li>{paginated_shows[show][card].special_episode_count} special episodes included</li>
                    )
                }
            }
            if(paginated_shows[show][card].episode_count === 1){
                episode_info = [];
            }
            else{
                if(paginated_shows[show][card].episode_count === 1){
                    episode_info.push(
                        <li>{paginated_shows[show][card].episode_count} episode included</li>
                    )
                }
                else{
                    episode_info.push(
                        <li>{paginated_shows[show][card].episode_count} episodes included</li>
                    )
                }
            }
            if(episode_info.length > 0){
                const popover = (
                    <Popover id="popover-basic">
                      <Popover.Title as="h3">Show Information</Popover.Title>
                      <Popover.Content>
                      <ul>{episode_info}</ul>
                      </Popover.Content>
                    </Popover>
                );  
                all_cards.push(    
                    <OverlayTrigger trigger="hover" placement="top" overlay={popover}>
                        <Col id="show-col">
                        <a href='#' onClick={((e) => {
                            e.preventDefault();
                        })}>
                        <Card className='show-card' id={`show-${paginated_shows[show][card].name}`} onClick={this.props.streamMovie}>
                        <Card.Img variant="top" className="show-image" id={`show-${paginated_shows[show][card].name}`} src={thumbnail} responsive="true"/>
                        <div className="overlay" id={`show-${paginated_shows[show][card].name}`}>
                            <div className='show-description'>
                                <Row>
                                    <Col>
                                    <h5 id={`show-${paginated_shows[show][card].name}`}>{paginated_shows[show][card].name}</h5>
                                    </Col>
                                </Row>
                            </div>
                        </div>
                        </Card>
                        </a>
                        </Col>
                    </OverlayTrigger>
                )
            }
            else{
                all_cards.push(
                    <Col id="show-col">
                    <a href='#' onClick={((e) => {
                        e.preventDefault();
                    })}>
                    <Card className='show-card' id={`show-${paginated_shows[show][card].name}`} onClick={this.props.streamMovie}>
                    <Card.Img variant="top" className="show-image" id={`show-${paginated_shows[show][card].name}`} src={thumbnail} responsive="true"/>
                    <div className="overlay" id={`show-${paginated_shows[show][card].name}`}>
                        <div className='show-description'>
                            <Row>
                                <Col>
                                <h5 id={`show-${paginated_shows[show][card].name}`}>{paginated_shows[show][card].name}</h5>
                                </Col>
                            </Row>
                        </div>
                    </div>
                    </Card>
                    </a>
                    </Col>
                )
            }
                    
        }
        all_shows.push(
            <Carousel.Item>
            <Row>    
            <div className='container text-center d-flex justify-content-center'>  
            {all_cards}
            </div>
            </Row>
            </Carousel.Item>
        )
    }
    all_shows = all_shows.length === 0 ? <div id='no-shows'>
        <h4>No shows found</h4>
    </div> : all_shows
    let scene = this.state.isLoading ? (<Spinner id='loading-shows' animation="border" role="status">
    <span className="sr-only">Loading...</span>
    </Spinner>) : (
        <div id='shows-layout'>
        <Row>    
        <div className='container text-center d-flex justify-content-center'>   
        <Col id="category-title">
        <h4 style={{ width: '20vw' }}>Most Watched</h4>
        </Col>
        <Col id="category-title">
        <h4 style={{ width: '23vw' }}></h4>
        </Col>
        <Col id="category-title">
        <h4 style={{ width: '23vw' }}></h4>
        </Col>
        <Col id="category-title">
        <h4 style={{ width: '23vw' }}></h4>
        </Col>
        <Col id="category-title">
        <h4 style={{ width: '23vw' }}></h4>
        </Col>
        </div>
        </Row>

        <Carousel interval={null} className='category'>
            {all_shows}
        </Carousel>

        </div>
    );
    let desktop_scene = this.state.searchView ? (
        all_shows_searched
    ) : scene;
    let mobile_scene = this.state.isLoading ? (<Spinner id='loading-shows' animation="border" role="status">
     <span className="sr-only">Loading...</span>
    </Spinner>) : all_mobile_view_shows
    return (
        
        <main role="main">
        <Row>
          <Col>
          
          <Carousel id='banner'>
            <Carousel.Item> 
              <Image className="d-block w-100" src='/mandalorian.png' />
              
            </Carousel.Item>
            <Carousel.Item>
            <Image className="d-block w-100" src='/avengers.png' />
            </Carousel.Item>
            <Carousel.Item>
            <Image className="d-block w-100" src='/spiderman.png' />
            </Carousel.Item>
        </Carousel>
        </Col>

      </Row>
      <Row>
          <Col>
          <div className='search'>
                <Form onSubmit={this.searchMovie.bind(this)} inline>
                  <FormControl type="text" id='search-feature' placeholder="Search" onChange={this.searchMovie.bind(this)}  className="mr-sm-2" />
                  <Image height='20' id='search-icon' src='/search.png' />
                </Form>
              </div>  
              </Col>
        </Row>
        <br></br><br></br>
        {desktop_scene}
        {mobile_scene}

       <Row>
           <Col>
           <div className='container text-center d-flex justify-content-center'> 
           <h6 id='credits'>Made with ❤️&nbsp; by Roan.</h6>
           </div>
           </Col>
       </Row>
        </main>
 
    );
  }
}







