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
                    }
                })}
        })
    },
    getDistance: ({from, to}) => {
        return new Promise((resolve, reject)=>{
            var service = new google.maps.DistanceMatrixService;
            service.getDistanceMatrix({
                origins: [from],
                destinations: [to],
                travelMode: 'DRIVING',
                unitSystem: google.maps.UnitSystem.METRIC,
                avoidHighways: false,
                avoidTolls: false
            }, (response, status) => {

                if (response.rows[0].elements[0].status == "NOT_FOUND") {
                    reject()
                } else {
                    resolve(response.rows[0].elements[0].distance)
                }

            })
        })

    }
};