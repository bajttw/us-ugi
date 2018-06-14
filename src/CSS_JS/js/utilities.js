function isSet(obj) {
    if (typeof obj === 'undefined' || obj === null || obj === '' || (typeof obj === 'object' && ($.isEmptyObject(obj) || ((typeof obj.size === 'function') && (obj.size() === 0))))) {
        return false;
    }
    return true;
}

// function Bajt.str.is(value) {//isStr
//     return typeof value === 'string' && value.length > 0;
// }

// function Bajt.json.is(str) {//isJsonString
//     if (typeof str === 'string' && str.length > 0) {
//         var firstChar = str.charAt(0);
//         return (firstChar === '[' || firstChar === '{');
//     }
//     return false;
// }

// function Bajt.obj.is(value) {//isObject
//     return (value != null && typeof value === 'object');
// }

// function Bajt.obj.is$(obj) {//is$Obj
//     //    console.log('Bajt.obj.is$');
//     //    if (Bajt.obj.is(obj)){
//     //        console.log('jquery');
//     //        console.log(obj.jquery);
//     //        console.log('length');
//     //        console.log(obj.length);
//     //        console.log('selector');
//     //        console.log(obj.selector);
//     //        console.log('context');
//     //        console.log(obj.context);
//     //
//     //    }
//     return (Bajt.obj.is(obj) && obj.jquery && obj.length > 0);// && obj.selector && obj.context);
// }

function isDT(obj) {
    return (Bajt.obj.is(obj) && typeof obj.rows === 'function');
}

// function Bajt.obj.isIterate(value) {//isIterate
//     return $.isArray(value) && value.length > 0;
//     //    return Bajt.obj.is(value) && value.length;
// }

// function Bajt.json.isObj(value) {//isJsonObj 
//     return (typeof value === 'string' && value.charAt(0) === '{');
// }

// function Bajt.json.isArray(value) {//isJsonArray
//     return (typeof value === 'string' && value.charAt(0) === '[');
// }

// function Bajt.json.getValue(value, key) {//getJsonValue 
//     value = Bajt.json.is(value) ? JSON.parse(value) : value;
//     if (Bajt.obj.is(value)) {
//         return B.obj.getValue(key || 'v', value);
//     }
//     return value;
// }

function isFloat(value) {
    return (typeof value === 'number' && value % 1 !== 0);
}
/*
 * Selectors  
 */
// function Bajt.str.getName(str) {// getNameFromStr
//     var name = '',
//         match = /\[[^\].]*]$/.exec(str);
//     if (match) {
//         name = match[0].slice(1, match[0].length - 1);
//     }
//     return name;
// }

// function getNrFromId(str) {//Bajt.html.geNrFromId
//     var nrStr = '',
//         match = /_\d+/.exec(str);
//     if (match) {
//         nrStr = match[0].slice(1, match[0].length);
//     }
//     return nrStr !== '' ? parseInt(nrStr, 10) : -1;
// }
// function getNameFromId(str) {//get.html.getNameFromId
//     var name = '',
//         match = /_[^_.]*$/.exec(str);
//     if (match) {
//         name = match[0].slice(1, match[0].length);
//     }
//     return name;
// }
// function Bajt.html.validateSelector(selector) {
//     var selectorOk = '';
//     if (typeof selector === 'string') {
//         if (selector[0] !== '#') {
//             selectorOk = '#' + selector;
//         } else {
//             selectorOk = selector;
//         }
//     }
//     return selectorOk;
// }

// function objectKeys(obj, filter) {
//     var keys = [];
//     if (Bajt.obj.is(obj)){
//         for (var k in obj) {
//             var push = true;
//             if (Bajt.obj.is(filter)) {
//                 push = filter.type === 'include' ? filter.values.indexOf(k) >= 0 : filter.values.indexOf(k) < 0;
//             }
//             if (push){
//                 keys.push(k);
//             }
//         }
//     }
//     return keys;
// }


/*
 * Converters
 */




function executeFunctionByName(functionName, context /*, args */) {
    var args = [].slice.call(arguments).splice(2);
    var namespaces = functionName.split('.');
    var func = namespaces.pop();
    for (var i = 0; i < namespaces.length; i++) {
        context = context[namespaces[i]];
    }
    return context[func].apply(context, args);
}

/*
 * Klasy użyteczne
 */


// function Bajt.url.modify(url, oldAction, newAction, parameters) {//modifyUrl
//     var decompose = url.split('?'),
//         newUrl = decompose[0].replace(oldAction, newAction),
//         newParam = {},
//         pt;
//     if (decompose.length > 1) {
//         pt = decompose[1].split('&');
//         for (var i = 0, ien = pt.length; i < ien; i++) {
//             var p = pt[i].split('=');
//             newParam[p[0]] = p[1];
//         }
//     }
//     $.extend(newParam, parameters);
//     pt = [];
//     for (var k in newParam) {
//         pt.push(k + '=' + newParam[k]);
//     }
//     if (pt.length > 0) {
//         newUrl += '?' + pt.join('&');
//     }
//     return newUrl;
// }








