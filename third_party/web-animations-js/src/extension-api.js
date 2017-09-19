// Copyright 2016 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
//   You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//   See the License for the specific language governing permissions and
// limitations under the License.

'use strict';
(function(scope) {
  if (window.WebAnimationsPolyfillExtension) {
    return;
  }

  var extensions = {};
  var applyHooks = [];

  function register(params) {
    console.assert(typeof params.name == 'string');
    if (params.name in extensions) {
      throw new Error('Extension already registered: ' + params.name);
    }
    extensions[params.name] = params;

    if (params.properties) {
      for (var property in params.properties) {
        registerProperty(property, params.properties[property]);
      }
    }

    if (params.applyHook) {
      var applyHookParams = params.applyHook;
      if (applyHookParams instanceof Function) {
        applyHookParams = { callback: applyHookParams };
      } else {
        console.assert(applyHookParams.callback instanceof Function);
      }

      var watchedProperties = applyHookParams.watchedProperties || Object.keys(params.properties || {});

      // TODO(alancutter): Support runAfter and runBefore.
      applyHooks.push({
        watchedProperties: watchedProperties,
        callback: applyHookParams.callback,
      });
    }
  }

  function registerProperty(property, params) {
    if (property == 'offset' || property == 'composite' || property == 'easing') {
      throw new Error('Attempted to register disallowed property name: ' + property);
    }
    if (scope.isRegisteredProperty(property)) {
      throw new Error('Property already registered: ' + property);
    }
    console.assert(params.parse instanceof Function);
    console.assert(params.merge instanceof Function);
    // TODO(alancutter): Make addPropertyHandler's merge function work like the
    // extension API and avoid this format conversion function.
    function merge(start, end) {
      var result = params.merge(start, end);
      return [result.start, result.end, result.serialize];
    }
    scope.addPropertyHandler(params.parse, merge, property);
  }

  function clearApplyHooks(effectSet) {
    applyHooks.forEach(function(applyHook) {
      for (var id in effectSet) {
        var effect = effectSet[id];
        var style = effect._target.style;
        if (!style._applyHookAffectedProperties) {
          return;
        }
        for (var property in style._applyHookAffectedProperties) {
          style._clear(property);
        }
      }
    });
  };

  function callApplyHooks(effectSet) {
    applyHooks.forEach(function(applyHook) {
      for (var id in effectSet) {
        var effect = effectSet[id];
        if (!effect._target._webAnimationsPatchedStyle) {
          return;
        }
        var style = effect._target.style;
        var watchedValues = {};
        applyHook.watchedProperties.forEach(function(property) {
          watchedValues[property] = style._getAnimated(property);
        });
        // TODO(alancutter): Avoid calling apply hooks if watched values haven't changed.
        var newValues = applyHook.callback(watchedValues, effect._target);
        if (!newValues) {
          return;
        }
        var affectedProperties = style._applyHookAffectedProperties || {};
        style._applyHookAffectedProperties = affectedProperties;
        for (var property in newValues) {
          style._set(property, newValues[property]);
          affectedProperties[property] = true;
        }
      }
    });
  };

  scope.clearApplyHooks = clearApplyHooks;
  scope.callApplyHooks = callApplyHooks;

  window.WebAnimationsPolyfillExtension = {
    register: register,
  };
})(webAnimations1);
