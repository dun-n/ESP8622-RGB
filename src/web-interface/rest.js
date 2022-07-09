class RestUtils {
    constructor() {}

    settings(callback, type, body){
        const ajax = new XMLHttpRequest();
        const self = this;
        ajax.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                callback(JSON.parse(this.response));
            } else if (this.readyState == 4) {
                self.error();
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
        const self = this;
        ajax.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                callback(JSON.parse(this.response));
            } else if (this.readyState == 4) {
                self.error();
            }
        };
        ajax.open('GET', NODE_ENDPOINT+API_PATH+"palettes",true);
        ajax.send();
    }

    palette(callback, type, params){
        const ajax = new XMLHttpRequest();
        const self = this;
        ajax.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                callback(JSON.parse(this.response));
            } else if (this.readyState == 4) {
                self.error();
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
        if(type === 'GET' && params){
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

    mode(callback, type, params) {
        const ajax = new XMLHttpRequest();
        const self = this;
        ajax.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                callback(JSON.parse(this.response));
            } else if (this.readyState == 4) {
                self.error();
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
        let query = NODE_ENDPOINT+API_PATH+"mode";
        if(type === 'GET' && params){
            query += '/' + params;
        }
        ajax.open(type, query,true);
        ajax.send(body);
    }

    error(){
        Toastify({
            text: "Rest Error",
            duration: 3000,
            close: true,
            gravity: "bottom", // `top` or `bottom`
            position: "right", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            className: 'toast-error'
        }).showToast();
    }

}

