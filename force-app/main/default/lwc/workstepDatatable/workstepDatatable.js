import { LightningElement, wire } from 'lwc';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import getWorkStep from '@salesforce/apex/WorkStepDatatableController.getWorkStep'
import updateWorkStep from '@salesforce/apex/WorkStepDatatableController.updateWorkStep'
import { notifyRecordUpdateAvailable } from "lightning/uiRecordApi";
import { refreshApex } from "@salesforce/apex";

/***PICKLIST*****/
import { getPicklistValues } from "lightning/uiObjectInfoApi";
import { getObjectInfo } from "lightning/uiObjectInfoApi";

import STATUS_FIELD from "@salesforce/schema/WorkStep.Status";
import WORKSTEP_OBJECT from "@salesforce/schema/WorkStep";
/********/
const COLS=[
    {label: "Id", fieldName:"Id"},
    {label: "WorkOrderId", fieldName:"WorkOrderId"},
    {label: "Name", fieldName:"Name"},
    {label: "Color", fieldName:"Status_Color__c", editable: {fieldName:"editCell"}},
    { label: 'Status', type: 'customPick', fieldName: 'Status', editable: true, typeAttributes: { 
        label:"picklist", 
        //value:{fieldName: "color"}, 
        //placeholder: "CIAO", 
        options:{fieldName:"pickListOptions"} }}
]
const detailCOLS=[
    {fieldName:"WorkOrderId", label:"WorkOrderId"},
    {fieldName:"Subject", label:"Subject"},
    {fieldName:"Account", label: "Account"}
];
//const sampleData=[{"WorkOrderId":'work1', '0': 'stato 1', '1':'stato 2' }, {"WorkOrderId":'work1', '0': 'stato 1', '1':'stato 2' }]; //dato raggruppato
export default class WorkstepDatatable extends LightningElement {
    columns=COLS
    pickListOptions= []//[{label:"New", value:"New"}, {label:"In Progress", value:"In Progress"}, {label:"Completed", value:"Completed"}]
    
    
    data=[];
    wiredData;
    defaultRecordTypeId;
    draftValues;
    draftValues2;
    pick=false;
    workstepIds={};

    groupedData=[] //sampleData;
    stepCols=[]; // colonne STEP
    groupedCols; //=[{fieldName:"WorkOrderId", label:"WorkOrderId"}]; //colonne


     /******GET PICKLIST VALUES*********/

     @wire(getObjectInfo, { objectApiName: WORKSTEP_OBJECT })
     wireWorkStepInfo({data, error}) {
         if (data) {
             this.defaultRecordTypeId = data.defaultRecordTypeId;
         }
         else if (error) {
             console.log(error);        
         }
     };
 
 
     @wire(getPicklistValues, { recordTypeId: '$defaultRecordTypeId', fieldApiName: STATUS_FIELD })
     getStatusPicklistValues({data, error}) {
         if(data){             
             this.pickListOptions = data.values;
             this.pick=true;
             //console.log("SEQ - GET PICK VALUE "+JSON.stringify(this.pickListOptions));
 
         }
     }
    
    @wire(getWorkStep, {flag: '$pick'})
    wireResponse(result){
        let data=result.data
        if(!data || !this.pick) return;
        this.wiredData=result
        let data2=data.map((element) => {
            return {...element,pickListOptions:this.pickListOptions,editCell:false,Subject:element.WorkOrder.Subject}
            //return {...element,pickListOptions:this.statusPicklistValues,color:"0"}
            
        })
        
        //console.log('----getWorkStep '+JSON.stringify(data2));
        this.data=data2;        
        
        //STEP COLUMNS COMPOSITION
        //REDUCE STEP   object with KEY value step

        let groupedColumns= data.reduce((result, currentValue) => { 
              (result[currentValue['Name']] = result[currentValue['Name']] || []).push(currentValue);
              return result;
            }, {});
        
        //console.log('STEP GROUPED '+JSON.stringify(groupedColumns)+"KEYS "+JSON.stringify(Object.keys(groupedColumns)) );
        
        this.stepCols=Object.keys(groupedColumns).map( (key,idx) => {
            return {
                label : key, 
                fieldName:key, 
                type:"customPick" , 
                editable: {fieldName:"editCell_"+key}, 
                typeAttributes: { 
                    placeholder: 'Choose Stage',
                    label:"picklist",  
                    options:{fieldName:"pickListOptions"} 
                    
            }}
        })

        this.groupedCols=detailCOLS.concat(this.stepCols);
        //console.log("SEQ - DEFINE COLS");
        //console.log("SEQ - GROUPED COLS "+JSON.stringify( this.groupedCols));
        //console.log("SEQ - PICKLIST "+JSON.stringify( this.pickListOptions))
        
        //DATA COMPOSITION
        // workorder group
        let groupedWork= data.reduce((result, currentValue) => { 
            (result[currentValue['WorkOrderId']] = result[currentValue['WorkOrderId']] || []).push(currentValue);
            return result;
          }, {});
        
        //console.log(" GROUPED DATA grezzo"+JSON.stringify(groupedWork))

        this.groupedData=Object.keys(groupedWork).map( (key,idx) => {
            let obj= {
                WorkOrderId : key, 
                pickListOptions:this.pickListOptions, 
                code: key, 
                editCell:false 
            }   
            let wstepList=groupedWork[key] 
            obj=wstepList.reduce((result,element)=>{
                this.workstepIds[key+"_"+element.Name]=element.Id;
                result[element.Name]=element.Status_Color__c    
                result['editCell_'+element.Name]= true
                result.Subject=element.WorkOrder.Subject
                result.Account=element.WorkOrder.Account.Name
                return result
            },obj)        
            return  obj        
        })

        //console.log("SEQ -  GROUPED DATA "+JSON.stringify(this.groupedData))
        //console.log("SEQ - DEFINE PICKLIST OPTIONS");
    }

    async handleSave(event) {
        //console.log("--handleSave "+JSON.stringify(event));
        const updatedFields = event.detail.draftValues;
        //console.log("RECORD TO UPDATE "+JSON.stringify(updatedFields))
        // Prepare the record IDs for notifyRecordUpdateAvailable()
        const notifyChangeIds = updatedFields.map(row => { return { "recordId": row.Id } });
        //console.log("RECORD TO NOTIFY "+JSON.stringify(notifyChangeIds))
/*
        const records = event.detail.draftValues.slice().map((draftValue) => {
            const fields = Object.assign({}, draftValue);
            return { fields };
          });
        
        //const records = event.detail.draftValues
        console.log("--record "+JSON.stringify(records));
        */
        try {
            // Pass edited fields to the updateContacts Apex controller
            const result = await updateWorkStep({data: updatedFields});
//            console.log(JSON.stringify("Apex update result: "+ result));
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'record updated',
                    variant: 'success'
                })
            );

            // Refresh LDS cache and wires
            notifyRecordUpdateAvailable(notifyChangeIds);
            await refreshApex(this.wiredData);
        
                this.draftValues = [];
        }catch(error) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error updating or refreshing records',
                    message: error.body.message,
                    variant: 'error'
                })
            );
         }
        
    }

    async handleSaveGrouped(event) {
        //console.log("--handleSave "+JSON.stringify(event));
        //const updatedFields = event.detail.draftValues;
        const updatedGroupedFields = event.detail.draftValues;
        //console.log("RECORD TO UPDATE "+JSON.stringify(updatedGroupedFields))
        
        let updatedFields=[];
        updatedGroupedFields.forEach( (groupRow) =>{
            Object.keys(groupRow).map( (step) =>{
                if(this.groupedCols.some( col => col.fieldName==step))
                    updatedFields.push({Id: this.workstepIds [groupRow.code+"_"+step], Status: groupRow[step]})
            })
        })
        
        //console.log("RECORD TO UPDATE AFTER TRANSFORM"+JSON.stringify(this.workstepIds)+" ARRAY " +JSON.stringify(updatedFields))

        // Prepare the record IDs for notifyRecordUpdateAvailable()
        const notifyChangeIds = updatedFields.map(row => { return { "recordId": row.Id } });
        //console.log("RECORD TO NOTIFY "+JSON.stringify(notifyChangeIds))
/*
        const records = event.detail.draftValues.slice().map((draftValue) => {
            const fields = Object.assign({}, draftValue);
            return { fields };
          });
        
        //const records = event.detail.draftValues
        console.log("--record "+JSON.stringify(records));
        */
        try {
            // Pass edited fields to the updateContacts Apex controller
            const result = await updateWorkStep({data: updatedFields});
            //console.log(JSON.stringify("Apex update result: "+ result));
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'record updated',
                    variant: 'success'
                })
            );

            // Refresh LDS cache and wires
            notifyRecordUpdateAvailable(notifyChangeIds);
            await refreshApex(this.wiredData);
        
                this.draftValues2 = [];
        }catch(error) {
            console.log("ERROR DURING UPDATE "+JSON.stringify(error))
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error updating or refreshing records',
                    message: error.body.pageErrors[0].message,
                    variant: 'error'
                })
            );
         }
        
    }    
   
}