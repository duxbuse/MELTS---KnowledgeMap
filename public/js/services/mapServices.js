angular.module('mapService', [])

// super simple service
// each function returns a promise object 
.factory('map', function($http) {
    return {
        get : function() {
            return $http.get('/api/map');
        },
        create : function(mapData) {
            return $http.post('/api/map', mapData);
        },
        delete : function(id) {
        return $http.delete('/api/map/' + id);
    }
}
         });