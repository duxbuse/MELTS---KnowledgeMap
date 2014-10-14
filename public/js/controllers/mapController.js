angular.module('mapController', [])

// inject the map service factory into our controller
.controller('mainController', function($scope, $http, map) {
    $scope.formData = {};

    // GET =====================================================================
    // when landing on the page, get all nodes and show them
    // use the service to get all the nodes
    map.get()
    .success(function(data) {
        $scope.map = data;
    });

    // CREATE ==================================================================
    // when submitting the add form, send the text to the node API
    $scope.createNode = function() {

        // validate the formData to make sure that something is there
        // if form is empty, nothing will happen
        if ($scope.formData.title != undefined) {

		
            // call the create function from our service (returns a promise object)
            map.create({
				title: $scope.formData.title.toUpperCase().trim(),
				unit: $scope.formData.unit.toUpperCase().trim(),
				prerequisites: $scope.formData.prerequisites.toUpperCase().trim()
			})

            // if successful creation, call our get function to get all the new nodes
            .success(function(data) {
                $scope.formData = {}; // clear the form so our user is ready to enter another
                $scope.map = data; // assign our new list of nodes
            });
        }
    };

    // DELETE ==================================================================
    // delete a node after checking it
    $scope.deleteNode = function(id) {
        map.delete(id)
        // if successful creation, call our get function to get all the new nodes
        .success(function(data) {
            $scope.map = data; // assign our new list of nodes
        });
    };
	
	$scope.findNode = function(unit){
		console.log(unit);
	};
	
	
});