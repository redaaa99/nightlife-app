import React from 'react';
import Auth from '../../modules/Auth';
import RaisedButton from 'material-ui/RaisedButton';


const config = require('../../../config');

class HomePage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {data: null};
    }

    componentDidMount(){
            this.showResult(this.props.location.query.term);
    }

    showResult(query) {
        if(query===undefined)
        {
            return;
        }
        if(query.trim().toLowerCase().toString()!=="")
        {
            document.getElementById( 'display-search' ).innerHTML = "<div id=\"fountainG\">\n" +
                "\t<div id=\"fountainG_1\" class=\"fountainG\"></div>\n" +
                "\t<div id=\"fountainG_2\" class=\"fountainG\"></div>\n" +
                "\t<div id=\"fountainG_3\" class=\"fountainG\"></div>\n" +
                "\t<div id=\"fountainG_4\" class=\"fountainG\"></div>\n" +
                "\t<div id=\"fountainG_5\" class=\"fountainG\"></div>\n" +
                "\t<div id=\"fountainG_6\" class=\"fountainG\"></div>\n" +
                "\t<div id=\"fountainG_7\" class=\"fountainG\"></div>\n" +
                "\t<div id=\"fountainG_8\" class=\"fountainG\"></div>\n" +
                "</div>";
            smoothScroll("display-search");
            let url = "/search/"+query;
            let request = new XMLHttpRequest();
            request.open('GET', url, true);
            let that = this;
            request.onload = function() {
                if (request.status >= 200 && request.status < 400) {
                    document.getElementById('display-search').innerHTML = '';
                    let response=JSON.parse(request.responseText);
                    that.setState({data : response});
                } else {

                    // We reached our target server, but it returned an error
                    humane.error = humane.spawn({ addnCls: 'humane-libnotify-error', timeout: 3000 })
                    humane.error('No location with this name');
                }
            };
            request.onerror = function() {
                // There was a connection error of some sort
                console.log("errror2");
            };
            request.send();
        }
    }
    handleClick(id) {
        if(!Auth.isUserAuthenticated()){
            this.props.router.push('/login?term='+document.getElementById("query").value);
        }else{
            let that = this;
            let request = new XMLHttpRequest();
            let params = "ind="+id+"&userToken="+Auth.getToken()+"&term="+(this.props.location.query.term ||document.getElementById("query").value);
            console.log(params);
            request.open('GET', "/add?"+params, true);
            request.onload = function() {
                if (request.status >= 200 && request.status < 400) {
                    let response=JSON.parse(request.responseText);
                    that.setState({data : response});
                } else {
                    console.log("errror1");
                }
            };
            request.onerror = function() {
                console.log("errror2");
            };
            request.send();
        }
    }
    _handleKeyPress(e) {
        if (e.key === 'Enter') {
            this.showResult(document.getElementById("query").value);
        }
    }
    render() {
        let that = this;
        if(this.state.data)
        {
            return (<div onKeyPress={(e) => this._handleKeyPress(e)}>
                    <div id="image"></div>
                    <div className="wrap">
                        <div className="search">
                            <input type="text" id="query" className="searchTerm" placeholder="Where are you?" />
                            <button onClick={this.showResult.bind(this,document.getElementById("query").value)} type="submit" className="searchButton">
                                <i className="fa fa-search"></i>
                            </button>
                        </div>
                    </div>
                    <div id="display-search">
                        {this.state.data.map((element,index) =>{
                            return (
                                <div key={index} id="smaller" className="w3-card-4">
                                    <header className="w3-container w3-light-grey">
                                        <h3>{element.name}</h3>
                                    </header>
                                    <div className="w3-container">
                                        <p>{element.display_phone}</p>
                                        <hr/>
                                        <a href={element.image_url} target="_blank" ><img id="sampleImg"  src={element.image_url} className="Avatar"/></a>
                                        <p>Rating: {element.rating} </p><p> Address: {element.location.address1}
                                        <br/>{(element.location.address2 || '')}</p><br/>
                                        <p><a href={"https://www.google.com/maps/?q="+element.coordinates.latitude.toString()+","+element.coordinates.longitude.toString()+""} >Location</a></p>
                                    </div>
                                    <button onClick={() => {that.handleClick(element.id);}} className="w3-button w3-block w3-dark-grey"><span>{(element.numberOfPpl || '0')}</span>&nbsp;Going</button>
                                </div>
                            );
                        })}
                    </div>
                    <div style={{textAlign : "center"}}className="button-line">
                        <RaisedButton onClick={()=>{smoothScroll("react-app");}} type="submit" label="Back To Top " primary />
                    </div>
                </div>
            );
        }
        else
        {
            return (<div onKeyPress={(e) => this._handleKeyPress(e)}>
                    <div id="image"></div>
                    <div className="wrap">
                        <div className="search">
                            <input type="text" id="query" className="searchTerm" placeholder="Where are you?" />
                            <button onClick={this.showResult} type="submit" className="searchButton">
                                <i className="fa fa-search"></i>
                            </button>
                        </div>
                    </div>
                    <div id="display-search"></div>
                </div>
            );
        }

    }
}


function currentYPosition() {
    // Firefox, Chrome, Opera, Safari
    if (self.pageYOffset) return self.pageYOffset;
    // Internet Explorer 6 - standards mode
    if (document.documentElement && document.documentElement.scrollTop)
        return document.documentElement.scrollTop;
    // Internet Explorer 6, 7 and 8
    if (document.body.scrollTop) return document.body.scrollTop;
    return 0;
}


function elmYPosition(eID) {
    var elm = document.getElementById(eID);
    var y = elm.offsetTop;
    var node = elm;
    while (node.offsetParent && node.offsetParent != document.body) {
        node = node.offsetParent;
        y += node.offsetTop;
    } return y;
}


function smoothScroll(eID) {
    var startY = currentYPosition();
    var stopY = elmYPosition(eID);
    var distance = stopY > startY ? stopY - startY : startY - stopY;
    if (distance < 100) {
        scrollTo(0, stopY); return;
    }
    var speed = Math.round(distance / 10);
    if (speed >= 20) speed = 20;
    var step = Math.round(distance / 25);
    var leapY = stopY > startY ? startY + step : startY - step;
    var timer = 0;
    if (stopY > startY) {
        for ( var i=startY; i<stopY; i+=step ) {
            setTimeout("window.scrollTo(0, "+leapY+")", timer * speed);
            leapY += step; if (leapY > stopY) leapY = stopY; timer++;
        } return;
    }
    for ( var i=startY; i>stopY; i-=step ) {
        setTimeout("window.scrollTo(0, "+leapY+")", timer * speed);
        leapY -= step; if (leapY < stopY) leapY = stopY; timer++;
    }
}


export default HomePage;