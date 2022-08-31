import {Navbar,Image} from 'react-bootstrap';

export default function Navigation(props){
    return (
        <Navbar className='implosive-topnav' fixed="top" bg="dark" variant="dark">
        <button onClick={props.changeSideBarView} className="navbar-toggler" id='nav-toggler' type="button" data-toggle="collapse" data-target="#navbarHeader" aria-controls="navbarHeader" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
            </button>
        <div className='container text-center d-flex justify-content-center'> 
            <Image height='20' id='logo' src='/implosive.png' />
            </div>
    </Navbar>
    )
}