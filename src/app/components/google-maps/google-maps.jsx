import React from "react";
import ReactDOM from "react-dom";
import {googleMapsApi} from "../../api/google-maps-api";
import debounce from "lodash/debounce";
export class GoogleMaps extends React.Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {

        let {address, onChange, location} = this.props;

        const initMap = ({lat, lng}) => {
            this.map = new google.maps.Map(ReactDOM.findDOMNode(this), {
                center: {lat: lat, lng: lng},
                zoom: 18,
                disableDefaultUI: true
            });

            this.marker = new google.maps.Marker({
                position: {lat: lat, lng: lng},
                map: this.map,
            });

            onChange({lat, lng});

        };

        if (location) {
            initMap(location);
        } else {
            googleMapsApi.getPlaceGeo(address).then((location) => {
                initMap(location);
            });
        }
    }

    handleChangeMarker = debounce((address) => {
        let {onChange} = this.props;
        googleMapsApi.getPlaceGeo(address).then(({lat, lng}) => {
            this.marker.setPosition({lat: lat, lng: lng});
            this.map.panTo({lat: lat, lng: lng});
            onChange({lat, lng});
        })

    }, 1000);

    componentWillReceiveProps(props) {
        if (props.address != this.props.address) {
            this.handleChangeMarker(props.address);
        }
    }

    render() {


        return (
            <div className="google-maps"/>
        );
    }
}