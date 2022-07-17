const COLOR_TEMPLATE = document.getElementById('color-template');
const PALETTE = document.getElementById('palette');

// Vanilla Throttle implementation
// from https://gist.github.com/peduarte/969217eac456538789e8fac8f45143b4
function throttle(func, wait = 100) {
    let timer = null;
    return function(...args) {
        if (timer === null) {
            timer = setTimeout(() => {
                func.apply(this, args);
                timer = null;
            }, wait);
        }
    };
}


class Color extends EventEmitter3{
    static nextId = 0;
    id;
    element;
    hexElement;
    hex;
    rgbElement;
    rgb;
    previewElement;
    upButton;
    downButton;
    trashButton;
    selected = false;
    constructor(color) {
        super();
        this.id= Color.nextId++;
        this.rgb = color.rgb;
        this.hex = color.hexString;
        this.createDOMElement();
    }

    createDOMElement(){
        const newColor = COLOR_TEMPLATE.cloneNode(true);
        newColor.id = 'color-' + this.id;
        this.element = newColor;
        this.element.addEventListener('click', () => {
            this.emit('select', this);
        })
        this.hexElement = newColor.querySelector('.hex');
        this.rgbElement = newColor.querySelector('.rgb');
        this.previewElement = newColor.querySelector('.color-preview');
        this.upButton = newColor.querySelector('.sorter-up');
        this.upButton.addEventListener('click', (event) => {
            event.stopPropagation();
            this.emit('upClick', this);
        })
        this.downButton = newColor.querySelector('.sorter-down');
        this.downButton.addEventListener('click', (event) => {
            event.stopPropagation();
            this.emit('downClick', this);
        })
        this.trashButton = newColor.querySelector('.trash');
        this.trashButton.addEventListener('click', (event) => {
            event.stopPropagation();
            this.emit('trashClick', this);
        })
        PALETTE.appendChild(newColor);
        this.render();
    }

    removeDomElement(){
        this.element.remove();
    }

    render(){
        if(this.selected){
            this.element.classList.add('selected');
        }
        if(this.previewElement){
            this.previewElement.style.background = this.hex;
        }
        if(this.hexElement){
            this.hexElement.innerText = this.hex
        }
        if(this.rgbElement){
            this.rgbElement.innerText = this.getRGBString();
        }
    }

    getRGBString(){
        return `${this.rgb.r}, ${this.rgb.g}, ${this.rgb.b}`
    }

    update(color){
        this.rgb = color.rgb;
        this.hex = color.hexString;
        this.render();
    }

    unselect(){
        this.selected = false;
        this.element.classList.remove('selected');
    }

    select(){
        this.selected = true;
        this.element.classList.add('selected');
    }

}

class Picker extends EventEmitter3{

    colorPicker = new iro.ColorPicker('#picker');
    throttledPostColor;
    pickerHex = document.getElementById('picker-hex');
    pickerRed = document.getElementById('picker-red');
    pickerBlue = document.getElementById('picker-blue');
    pickerGreen = document.getElementById('picker-green');

    constructor() {
        super();
        this.throttledPostColor = throttle(this.postColor, 400);
        this.updateInputs(this.colorPicker.color);
        this.colorPicker.on('color:change', () => {
            const color = this.colorPicker.color;
            this.updateInputs(color);
            this.throttledPostColor();
            this.emit('change', color);
        });
        this.pickerHex.addEventListener('change', ()=>{
            try{
                this.colorPicker.color.hexString = this.pickerHex.value;
                this.pickerHex.classList.remove('error')
            } catch (e){
                this.pickerHex.classList.add('error')
            }
        })
        this.pickerRed.addEventListener('change', ()=>{
            if (this.pickerRed.value < 0){
                this.pickerRed.value = 0;
            } else if (this.pickerRed.value > 255){
                this.pickerRed.value = 255;
            }
            this.colorPicker.color.red = this.pickerRed.value;
        })
        this.pickerGreen.addEventListener('change', ()=>{
            if (this.pickerGreen.value < 0){
                this.pickerGreen.value = 0;
            } else if (this.pickerGreen.value > 255){
                this.pickerGreen.value = 255;
            }
            this.colorPicker.color.green = this.pickerGreen.value;
        })
        this.pickerBlue.addEventListener('change', ()=>{
            if (this.pickerBlue.value < 0){
                this.pickerBlue.value = 0;
            } else if (this.pickerBlue.value > 255){
                this.pickerBlue.value = 255;
            }
            this.colorPicker.color.blue = this.pickerBlue.value;
        })
    }

    postColor(){
        const ajax = new XMLHttpRequest();
        ajax.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                console.log('SUCCESS!!!!!!!!')
            }
        };
        const color = this.colorPicker.color;
        const body = {
            r: color.red,
            b: color.blue,
            g: color.green,
        };
        ajax.open("POST", NODE_ENDPOINT+API_PATH+"color",true);
        ajax.send(JSON.stringify(body));
    }

    updateInputs(color){
        this.pickerHex.value = color.hexString;
        this.pickerHex.classList.remove('error')
        this.pickerRed.value = color.red;
        this.pickerBlue.value = color.blue;
        this.pickerGreen.value = color.green;
    }

    getColor(){
        return this.colorPicker.color;
    }

    setColor(color){
        if(typeof color === 'string'){
         this.colorPicker.color.hexString = color;
        }
    }

}

class Palette {
    currentColor;
    colors;
    addButton = document.getElementById('add-btn');
    saveButton = document.getElementById('save-btn');
    clearButton = document.getElementById('clear-btn');
    bankNumber = document.getElementById('bank-number');
    paletteName = document.getElementById('palette-name');
    constructor() {
        this.colors = [];
        this.addButton.addEventListener('click', () => this.addColor());
        this.saveButton.addEventListener('click', () => this.savePalette());
        this.clearButton.addEventListener('click', () => this.clear());
        this.bankNumber.addEventListener('change', ()=>{
            const val = this.bankNumber.value;
            if(val < 1) {
                this.bankNumber.value = 1
            } else if (val > 16){
                this.bankNumber.value = 16;
            }
        })
        this.init();
    }

    shiftUp(color){
        const index = this.colors.findIndex(c => c === color);
        if(index > 0){
            const cTemp = this.colors[index];
            this.colors[index] = this.colors[index - 1];
            this.colors[index - 1] = cTemp;
        }
        this.renderColors();
    }

    shiftDown(color){
        const index = this.colors.findIndex(c => c === color);
        if(index >= 0 && index < this.colors.length - 1){
            const cTemp = this.colors[index];
            this.colors[index] = this.colors[index + 1];
            this.colors[index + 1] = cTemp;
        }
        this.renderColors();
    }

    renderColors(removed){
        if(removed){
            for(const c of removed){
                c.removeDomElement();
            }
        }
        for(const c of this.colors){
            c.removeDomElement();
            c.createDOMElement();
        }
    }

    addColor(color){
        if(this.currentColor){
            this.currentColor.unselect();
        }
        if(!color){
            color = picker.getColor();
        }
        this.currentColor = new Color(color)
        this.currentColor.select();
        this.currentColor.on('upClick', (color) => this.shiftUp(color));
        this.currentColor.on('downClick', (color) => this.shiftDown(color));
        this.currentColor.on('trashClick', (color) => this.remove(color));
        this.currentColor.on('select',(color) =>{
            this.currentColor.unselect();
            this.currentColor = color;
            this.currentColor.select();
            picker.setColor(this.currentColor.hex)

        })
        this.colors.push(this.currentColor)
    }


    remove(color) {
        const index = this.colors.findIndex(c => c === color);
        const removed = this.colors.splice(index, 1);
        this.renderColors(removed);
    }

    clear(){
        const removed = this.colors.splice(0, this.colors.length);
        this.renderColors(removed);
        const html = `Cleared <button class="undo-btn">Undo</button>`
        const elm = document.createElement('span');
        elm.innerHTML = html;
        const toast = Toastify({
            node: elm,
            //duration: 3000,
            close: true,
            gravity: "bottom", // `top` or `bottom`
            position: "right", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            className: 'toast-info'
        }).showToast();
        elm.querySelector('.undo-btn').addEventListener('click', ()=>{
            this.colors = removed;
            this.renderColors();
            if(toast){
                toast.hideToast();
            }
        })

    }

    savePalette() {
        const num = this.bankNumber.value;
        if(num) {
            const palette = ((typeof num === 'string') ? parseInt(num) : num) - 1;
            const name = this.paletteName.value;
            const colors = [];
            for (const color of this.colors) {
                colors.push({
                    red: color.rgb.r,
                    green: color.rgb.g,
                    blue: color.rgb.b,
                })
            }
            const data = {
                name,
                palette,
                colors
            }
            const rest = new RestUtils();
            rest.palette((res) => {
                Toastify({
                    text: "Saved",
                    duration: 3000,
                    close: true,
                    gravity: "bottom", // `top` or `bottom`
                    position: "right", // `left`, `center` or `right`
                    stopOnFocus: true, // Prevents dismissing of toast on hover
                    className: 'toast-success'
                }).showToast();
            }, 'POST', data);
        } else {
            Toastify({
                text: "Palette Bank Number Required",
                duration: 3000,
                close: true,
                gravity: "bottom", // `top` or `bottom`
                position: "right", // `left`, `center` or `right`
                stopOnFocus: true, // Prevents dismissing of toast on hover
                className: 'toast-error'
            }).showToast();
        }
    }

    init() {
        const rest = new RestUtils();
        const pal = rest.getParameterByName('palette');
        if (pal) {
            rest.palette((res) => {
                console.log(res);
                if (res) {
                    this.bankNumber.value = ((typeof pal === 'string') ? parseInt(pal) : pal) + 1;
                    this.paletteName.value = res.name;

                    if (res.colors && res.colors.length) {
                        for (const c of res.colors) {
                            let color = {
                                rgb: {
                                    r: c.red,
                                    g: c.blue,
                                    b: c.green
                                },
                                hexString: `#${c.red.toString(16).padStart(2,'0')}${c.green.toString(16).padStart(2,'0')}${c.blue.toString(16).padStart(2,'0')}`
                            }
                            palette.addColor(color);
                        }
                    }
                }
            }, 'GET', pal);
        }
    }
}

const picker = new Picker();
const palette = new Palette();

picker.on('change', (color)=>{
    if( palette.currentColor ){
        palette.currentColor.update(color);
    }
})
