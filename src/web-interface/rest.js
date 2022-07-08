class RestUtils {
    constructor() {}

    settings(callback, type, body){
        const ajax = new XMLHttpRequest();
        ajax.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                callback(JSON.parse(this.response));
            }
        };
        if(type === 'POST' && typeof body != 'string'){
            body = JSON.stringify(body);
        }
        ajax.open(type, NODE_ENDPOINT+API_PATH+"settings",true);
        ajax.send(body);

    }

    palettes(callback){
        const ajax = new XMLHttpRequest();
        ajax.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                callback(JSON.parse(this.response));
            }
        };
        ajax.open('GET', NODE_ENDPOINT+API_PATH+"palettes",true);
        ajax.send();
    }

    palette(callback, type, params){
        const ajax = new XMLHttpRequest();
        ajax.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                callback(JSON.parse(this.response));
            }
        };
        let body;
        if(type === 'POST'){
            if(typeof body != 'string'){
                body = JSON.stringify(params);
            } else {
                body = params;
            }
        }
        let query = NODE_ENDPOINT+API_PATH+"palette";
        if(type === 'GET'){
            query += '/' + params;
        }
        ajax.open(type, query,true);
        ajax.send(body);
    }

    getParameterByName(name, url = window.location.href) {
        name = name.replace(/[\[\]]/g, '\\$&');
        var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    }

    start(callback, params) {
        const ajax = new XMLHttpRequest();
        ajax.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                callback(JSON.parse(this.response));
            }
        };
        let body;
        if(typeof body != 'string'){
            body = JSON.stringify(params);
        } else {
            body = params;
        }
        ajax.open('POST', NODE_ENDPOINT+API_PATH+"mode",true);
        ajax.send(body);
    }
}

