angular.module('mapService', [])

// super simple service
// each function returns a promise object 
.factory('map', function($http) {
    return {
        get : function() {
            return $http.get('/smdux1/api/map');
        },
        create : function(mapData) {
            return $http.post('/smdux1/api/map', mapData);
        },
        delete : function(id) {
        return $http.delete('/smdux1/api/map/' + id);
    }
}
         });