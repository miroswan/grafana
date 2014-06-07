define([
  'angular',
  'jquery',
  'config',
  'underscore'
],
function (angular, $, config, _) {
  "use strict";

  var module = angular.module('kibana.routes');

  module.config(function($routeProvider) {
    $routeProvider
      .when('/dashboard/file/:jsonFile', {
        templateUrl: 'app/partials/dashboard.html',
        controller : 'DashFromFileProvider',
      });
  });

  module.controller('DashFromFileProvider', function(
    $scope, $rootScope, $http, $routeParams, alertSrv, dashboard, filterSrv, panelMoveSrv) {

    $scope.init = function() {
      console.log('DashFromFileProvider->init()')

      file_load($routeParams.jsonFile)
        .then(function(data) {
          $scope.dashboard = dashboard.create(data);
          $scope.filter = filterSrv;
          $scope.filter.init($scope.dashboard);

          var panelMove = panelMoveSrv.create($scope.dashboard);
          // For moving stuff around the dashboard.
          $scope.panelMoveDrop = panelMove.onDrop;
          $scope.panelMoveStart = panelMove.onStart;
          $scope.panelMoveStop = panelMove.onStop;
          $scope.panelMoveOver = panelMove.onOver;
          $scope.panelMoveOut = panelMove.onOut;

          $rootScope.$emit("dashboard-loaded", $scope.dashboard);
        });
    };

    var renderTemplate = function(json,params) {
      var _r;
      _.templateSettings = {interpolate : /\{\{(.+?)\}\}/g};
      var template = _.template(json);
      var rendered = template({ARGS:params});
      try {
        _r = angular.fromJson(rendered);
      } catch(e) {
        _r = false;
      }
      return _r;
    };

    var file_load = function(file) {
      return $http({
        url: "app/dashboards/"+file.replace(/\.(?!json)/,"/")+'?' + new Date().getTime(),
        method: "GET",
        transformResponse: function(response) {
          return renderTemplate(response,$routeParams);
        }
      }).then(function(result) {
        if(!result) {
          return false;
        }
        return result.data;
      },function() {
        alertSrv.set('Error',"Could not load <i>dashboards/"+file+"</i>. Please make sure it exists" ,'error');
        return false;
      });
    };

    $scope.init();

  });

});
