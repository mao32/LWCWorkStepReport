import LightningDataTable from 'lightning/datatable';
import picklistTemplate from "./picklist.html";
import displayTemplate from "./display.html";
export default class PicklistTypeDatatable extends LightningDataTable {

    static customTypes={       
        customPick:{
            template: displayTemplate,         
            editTemplate: picklistTemplate,  
            standardCellLayout: true,
            typeAttributes: ["options","placeholder","label","value","context"]
        }
    }

}