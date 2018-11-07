import {api} from "./api";
import uuid from "uuid/v4";
const apiKey = "AIzaSyC9Bmqy41QOFV4nET2iVYcgsiL6kVBX8pw";

export const googleMapsApi = {
    getPlaceGeo: (location = "3 Phố Huế") => {
        return new Promise((resolve, reject)=>{
            var geocoder = new google.maps.Geocoder();

            geocodeAddress(geocoder, location);

            function geocodeAddress(geocoder, address) {
                geocoder.geocode({'address': address}, function(results, status) {
                    if (status === 'OK') {
                        let geometry = results[0].geometry.location;
                        resolve({
                            lat: geometry.lat(),
                            lng: geometry.lng()
                        });
                    } else {
                        alert("Không thể tìm thấy địa chỉ");
                    }
                })}
        })

    }
};