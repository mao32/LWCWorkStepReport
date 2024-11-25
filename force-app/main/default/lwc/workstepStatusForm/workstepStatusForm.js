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
        //const event = new CustomEvent('changedescription', {
        const event = new CustomEvent('cellchange', {
            composed: true,
            bubbles: true,
            cancelable: true,
            detail: {
                draftValues: [{
                    /*
                    workstepId: this.workstepid,
                    description: this.description,
                    value:this.value,
                    groupKey:this.groupkey,
                    step:this.step,                    
                    */
                    code:this.code,
                    [this.step+"desc"]: this.description,
                    [this.step+"id"]: this.workstepid,                    
                    
                }
            ]},
        });
        
        this.dispatchEvent(event);
    }
}