const PRESET_TEMPLATE = document.getElementById('preset-template')
const PRESET_CONTAINER_TEMPLATE  = document.getElementById('preset-container');
const PRESET_CONTAINER_CONTAINER = document.getElementById('preset-container-container');

class Presets {
    static nextId = 0;
    selected;
    rows = [];
    palettes = [];
    selectedElementContainer= document.getElementById('selected-palette')
    startButton = document.getElementById('start-btn');
    offButton = document.getElementById('off-btn');
    rest = new RestUtils();
    modeSelect = new ModeSelect();
    active = false;
    constructor() {
        this.startButton.addEventListener('click', ()=> this.start());
        this.offButton.addEventListener('click', ()=> this.off());
        this.rest.palettes((pals)=>{
            this.render(pals);
            this.rest.mode((mode)=> this.handleMode(mode), 'GET')
        })
    }

    handleMode(mode){
        if(mode.mode >= 0 && mode.palette >= 0){
            this.active = true;
        } else{
            this.active = false;
        }
        this.modeSelect.setMode(mode.mode);
        this.modeSelect.setDuration(mode.duration);
    }

    render(pals){
        let row = this.newRow();
        for (const pal of pals){
            if(row.children.length == 2){
                row = this.newRow();
            }
            const ps = new Preset(pal);
            this.palettes.push(ps);
            ps.on('select',(preset)=>{
                if(this.selected){
                    this.selected.unselect();
                }
                this.selected = preset;
                this.selected.select();
                this.updateSelected();
            });
            row.appendChild(ps.element);
        }
        if(this.palettes[0]){
            this.palettes[0].select();
            this.selected = this.palettes[0];
            this.updateSelected();
        }
    }

    updateSelected(){
        if(this.selectedElement){
            this.selectedElement.remove();
        }
        this.selectedElement = this.selected.element.cloneNode(true);
        this.selectedElement.querySelector('.edit-btn').remove();
        this.selectedElement.querySelector('.delete-button').remove();
        this.selectedElement.classList.remove('six');
        this.selectedElement.classList.add('twelve');
        this.selectedElementContainer.appendChild(this.selectedElement)
    }

    newRow(){
        const row = PRESET_CONTAINER_TEMPLATE.cloneNode(true);
        row.id = 'ps-row-' + Presets.nextId++;
        PRESET_CONTAINER_CONTAINER.appendChild(row);
        this.rows.push(row);
        return row;
    }

    start(){
        const data = {
            mode: this.modeSelect.getMode(),
            palette: this.selected.palette.palette,
            duration: this.modeSelect.getDuration()
        }
        this.rest.mode((res)=>{
            this.handleMode(res);
            this.success('Started')
        }, 'POST', data)
    }

    off(){
        const data = {
            off: true
        }
        this.rest.mode((res)=>{
            this.handleMode(res);
            this.success('Switched off')
        }, 'POST', data)
    }

    success(text){
        Toastify({
            text: text,
            duration: 3000,
            close: true,
            gravity: "bottom", // `top` or `bottom`
            position: "right", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            className: 'toast-success'
        }).showToast();
    }

}

class Preset extends EventEmitter3{
    static nextId = 0;
    id;
    element;
    palette;
    rows = [];

    constructor(pal) {
        super();
        this.palette = pal;
        this.id= Preset.nextId++;
        this.createDOMElement();
    }

    createDOMElement(){
        const newPreset = PRESET_TEMPLATE.cloneNode(true);
        newPreset.id = 'preset-' + this.id;
        this.element = newPreset;
        newPreset.addEventListener('click', ()=>{
            this.emit('select', this);
        });
        newPreset.querySelector('.edit-btn').addEventListener('click', (event) => {
            event.stopPropagation();
            window.location.href = '/wheel?palette=' + this.palette.palette;
        })
        newPreset.querySelector('.delete-button').addEventListener('click', (event) => {
            event.stopPropagation();
            const paletteOld = this.palette;
            const palette = this.palette.palette;
            const name = '';
            const colors = [];
            const data = {
                name,
                palette,
                colors
            }
            const rest = new RestUtils();
            rest.palette((res)=>{
                this.palette = res;
                this.render();
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
                    this.palette = paletteOld;
                    const palette = this.palette.palette;
                    const name = this.palette.name;
                    const colors = this.palette.colors;
                    const data = {
                        name,
                        palette,
                        colors
                    }
                    const rest = new RestUtils();
                    rest.palette((res)=>{
                        this.palette = res;
                        this.render();
                    }, "POST", data);
                    if(toast){
                        toast.hideToast();
                    }
                })
            }, 'POST', data);
        })
        this.render();
        return newPreset;
    }

    render(){
        for(const row of this.rows){
            row.remove();
        }
        this.element.querySelector('.bank-number .num').innerText = (this.palette.palette + 1) + '';
        this.element.querySelector('.bank-name').innerText = this.palette.name;
        if(this.palette && this.palette.colors && this.palette.colors.length){
            let row = this.newRow();
            for(const color of this.palette.colors){
                if(row.children.length == 4){
                    row = this.newRow();
                }
                let newColor = this.element.querySelector('.color-template').cloneNode(true);
                newColor.classList.remove('color-template');
                newColor.querySelector('.preset-color').style.background = `rgb(${color.red},${color.green},${color.blue})`;
                row.appendChild(newColor);
            }
        } else {
            this.element.querySelector('.empty-msg').style.display = 'block';
        }
    }

    newRow(){
        console.log("new Row")
        const row = this.element.querySelector('.color-row-template').cloneNode(true);
        row.classList.remove('color-row-template');
        row.id = 'color-row-' +Preset.nextId++;
        this.element.querySelector('.color-row-container').appendChild(row);
        this.rows.push(row);
        return row;
    }

    removeDomElement(){
        this.element.remove();
    }

    select(){
        this.element.querySelector('.preset-bank').classList.add('selected');
    }

    unselect(){
        this.element.querySelector('.preset-bank').classList.remove('selected');
    }

}

class ModeSelect extends EventEmitter3{
    modes = [
        {
            value: 0,
            name: 'Static',
            description:
                `Static mode holds a color for the duration than changes to the next color in the palette.`
        },
        {
            value: 1,
            name: 'Pulse',
            description:
                `Pulse Mode will fades a color in and then fade it out over the duration. Then it does the same for the next color in the palette.`
        },
        {
            value: 2,
            name: 'Fade',
            description:
                `Fade mode Will over the duration fade from one color to the next color in the palette.`
        },

    ];
    modeDescription = document.getElementById('mode-description');
    modeSelect = document.getElementById('mode-select');
    mode = 0;
    duration = document.getElementById('duration');
    strobeWarning = document.getElementById('strobe-warning');
    constructor() {
        super();
        for (const mode of this.modes){
            const option = document.createElement('option');
            option.innerText = mode.name;
            option.value = mode.value;
            this.modeSelect.appendChild(option);
        }
        this.updateModeDescription();
        this.modeSelect.addEventListener('change', ()=>{
            this.mode = this.modeSelect.value;
            this.updateModeDescription();
        });
        this.duration.value = 1000;
        this.duration.addEventListener('change', ()=>{
            if (this.duration.value < 10){
                this.duration.value = 10;
            } else if(this.duration.value > 65535){
                this.duration.value = 65535;
            }
            if(this.duration.value < 400){
                this.strobeWarning.style.display = 'block';
            } else {
                this.strobeWarning.style.display = 'None';
            }
        })
    }

    updateModeDescription(){
        let modeObj = this.modes.find(m => m.value == this.mode);
        this.modeDescription.innerText = modeObj.description;
    }

    getMode(){
        return this.mode;
    }

    getDuration(){
        return this.duration.value;
    }

    setMode(value){
        value = Math.max(0, value);
        this.mode = value;
        this.modeSelect.value = value;
    }

    setDuration(value){
        return this.duration.value = value;
    }


}

const p = new Presets();
