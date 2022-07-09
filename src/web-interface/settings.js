
class Settings {
    nodeName = document.getElementById('node-name');
    redPin = document.getElementById('red-pin');
    greenPin = document.getElementById('green-pin');
    bluePin = document.getElementById('blue-pin');
    restUtils = new RestUtils()
    saveButton = document.getElementById('save');
    constructor() {
        this.redPin.addEventListener('change', (event) => this.onChange(event));
        this.greenPin.addEventListener('change', (event) => this.onChange(event));
        this.bluePin.addEventListener('change', (event) => this.onChange(event));
        this.saveButton.addEventListener('click', () => this.save());
        setTimeout(()=>{
            this.restUtils.settings((res) => this.callback(res),'GET')
        });
    }

    onChange(event){
        const elm = event.target;
        if(elm.value < 0){
            elm.value = 0;
        } else if(elm.value > 16) {
            elm.value = 16
        }
    }

    callback(response, notify){
        if(response) {
            this.nodeName.value = response.nodeName
            this.redPin.value = response.redPin;
            this.greenPin.value = response.greenPin;
            this.bluePin.value = response.bluePin;
            if (notify) {
                this.success();
            }
        } else {
            this.error();
        }
    }

    success(){
        Toastify({
            text: "Saved",
            duration: 3000,
            close: true,
            gravity: "bottom", // `top` or `bottom`
            position: "right", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            className: 'toast-success'
        }).showToast();
    }

    error(){
        Toastify({
            text: "Error",
            duration: 3000,
            close: true,
            gravity: "bottom", // `top` or `bottom`
            position: "right", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            className: 'toast-error'
        }).showToast();
    }

    save(){
        const body =
            {
                nodeName: this.nodeName.value,
                redPin: this.redPin.value,
                greenPin: this.greenPin.value,
                bluePin: this.bluePin.value
            };
        this.restUtils.settings((res) => this.callback(res, true),'POST', body)
    }

}

const settings = new Settings();
