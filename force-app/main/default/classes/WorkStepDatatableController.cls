/**
 * @description       : 
 * @author            : maurizio.colombo@lynxspa.com
 * @group             : 
 * @last modified on  : 10-02-2024
 * @last modified by  : maurizio.colombo@lynxspa.com
**/
public without sharing class WorkStepDatatableController {
    @AuraEnabled(cacheable=true)   
    public static List<WorkStep> getWorkStep(boolean flag){
         return [select id,workorderId,workorder.subject, workorder.account.name, name,Status_Color__c,StatusNum__c,Status from WorkStep];
    
    }
 
    @AuraEnabled
    public static String updateWorkStep(Object data){
       List<WorkStep> wsForUpdate = (List<WorkStep>) JSON.deserialize(
          JSON.serialize(data),
          List<WorkStep>.class
     );
     update wsForUpdate;
     return 'Success: workstep updated successfully';
     /*
     try {
         update wsForUpdate;
         return 'Success: contacts updated successfully';
     }
     catch (Exception e) {
         return 'The following exception has occurred: ' + e.getMessage();
     }
         */
    }
 }