import { LightningElement, api } from 'lwc';

export default class WorkstepStatusForm extends LightningElement {
    @api workstepid;
    @api description;
    @api value;
    @api label;
    @api options;
    @api placeholder;
    @api groupkey;
    @api step;
    @api code
    @api statusvalue

    
    connectedCallback(){
        console.log("COMPONENTE WORKSTEP FORM ATTIVO "+this.workstepid+ " DESCRPTION "+this.value+" STEP "+this.step+" CODE "+this.code + "GOUPKEY "+this.groupKey)
    }

    handleChange(context){
        console.log("handleChange description")
        this.description=context.detail.value
        const event = new CustomEvent('changedescription', {
            composed: true,
            bubbles: true,
            cancelable: true,
            detail: {
                workstepId: this.workstepid,
                description: this.description,
                value:this.value,
                groupKey:this.groupkey,
                step:this.step,
                code:this.code,
                statusValue:this.statusvalue
            },
        });
        this.dispatchEvent(event);
    }
}