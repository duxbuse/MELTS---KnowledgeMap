angular.module('mapController', [])

// inject the Todo service factory into our controller
.controller('mainController', function($scope, $http, map) {
    $scope.formData = {};

    // GET =====================================================================
    // when landing on the page, get all todos and show them
    // use the service to get all the todos
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
            map.create($scope.formData)

            // if successful creation, call our get function to get all the new todos
            .success(function(data) {
                $scope.formData = {}; // clear the form so our user is ready to enter another
                $scope.map = data; // assign our new list of todos
            });
        }
    };

    // DELETE ==================================================================
    // delete a todo after checking it
    $scope.deleteNode = function(id) {
        map.delete(id)
        // if successful creation, call our get function to get all the new todos
        .success(function(data) {
            $scope.map = data; // assign our new list of todos
        });
    };
});